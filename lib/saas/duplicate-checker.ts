import prisma from '@/lib/db';
import { ArticleIntent } from './input-analyzer';

export interface DuplicateCheckResult {
  hasDuplicate: boolean;
  duplicateScore: number; // 0-100
  matchedArticleId?: string;
  matchedTitle?: string;
  matchedSlug?: string;
  matchedStatus?: string;
  reason?: string;
  options: Array<'OPEN_EXISTING' | 'UPDATE_EXISTING' | 'CREATE_DIFFERENT_ANGLE' | 'PROCEED_ANYWAY' | 'CANCEL'>;
}

/**
 * Calculates string similarity score between 0 and 1 using token overlap & Jaccard index
 */
function calculateSimilarity(strA: string, strB: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['best', 'the', 'top', 'for', 'and', 'with', 'under', 'review'].includes(w));

  const tokensA = new Set(normalize(strA));
  const tokensB = new Set(normalize(strB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

/**
 * Checks for existing duplicate content under the same websiteId.
 * Distinguishes between identical topics (duplicate risk > 80) and legitimate different intents
 * (e.g. "Best Earbuds Under 2000" vs "OnePlus Nord Buds 4 Review").
 */
export async function checkDuplicateContent(
  websiteId: string,
  proposedTitle: string,
  proposedSlug: string,
  proposedProductNames: string[] = [],
  proposedIntent: ArticleIntent = 'BUYING_GUIDE'
): Promise<DuplicateCheckResult> {
  const existingArticles = await prisma.contentArticle.findMany({
    where: { websiteId },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      affiliateProducts: true
    }
  });

  const normalizedProposedSlug = proposedSlug.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const art of existingArticles) {
    const normalizedExistingSlug = art.slug.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Exact Slug Match
    if (normalizedProposedSlug === normalizedExistingSlug) {
      return {
        hasDuplicate: true,
        duplicateScore: 100,
        matchedArticleId: art.id,
        matchedTitle: art.title,
        matchedSlug: art.slug,
        matchedStatus: art.status,
        reason: `An article with identical URL slug already exists: "${art.title}" (${art.status}).`,
        options: ['OPEN_EXISTING', 'UPDATE_EXISTING', 'CREATE_DIFFERENT_ANGLE', 'CANCEL']
      };
    }

    // 2. High Title Semantic Similarity
    const similarity = calculateSimilarity(proposedTitle, art.title);

    if (similarity >= 0.75) {
      // Check if both are the exact same intent type
      const isBothBuyingGuides = (proposedTitle.toLowerCase().includes('best') || proposedTitle.toLowerCase().includes('top')) &&
                                 (art.title.toLowerCase().includes('best') || art.title.toLowerCase().includes('top'));
      
      const isBothSingleReview = proposedTitle.toLowerCase().includes('review') && art.title.toLowerCase().includes('review');

      if (isBothBuyingGuides || isBothSingleReview) {
        return {
          hasDuplicate: true,
          duplicateScore: Math.round(similarity * 100),
          matchedArticleId: art.id,
          matchedTitle: art.title,
          matchedSlug: art.slug,
          matchedStatus: art.status,
          reason: `High semantic similarity (${Math.round(similarity * 100)}%) with existing ${art.status} article: "${art.title}".`,
          options: ['OPEN_EXISTING', 'UPDATE_EXISTING', 'CREATE_DIFFERENT_ANGLE', 'CANCEL']
        };
      }
    }

    // 3. Product Duplicate Review Check
    if (proposedIntent === 'PRODUCT_REVIEW' && proposedProductNames.length > 0) {
      const primaryProduct = proposedProductNames[0].toLowerCase();
      if (art.title.toLowerCase().includes(primaryProduct) && art.title.toLowerCase().includes('review')) {
        return {
          hasDuplicate: true,
          duplicateScore: 85,
          matchedArticleId: art.id,
          matchedTitle: art.title,
          matchedSlug: art.slug,
          matchedStatus: art.status,
          reason: `A dedicated product review already exists for "${proposedProductNames[0]}".`,
          options: ['OPEN_EXISTING', 'UPDATE_EXISTING', 'CREATE_DIFFERENT_ANGLE', 'CANCEL']
        };
      }
    }
  }

  return {
    hasDuplicate: false,
    duplicateScore: 0,
    options: ['PROCEED_ANYWAY']
  };
}
