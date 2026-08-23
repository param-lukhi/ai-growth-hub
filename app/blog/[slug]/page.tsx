import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import AmazonButton from '@/components/AmazonButton';
import RegionalPrice from '@/components/RegionalPrice';
import ProsCons from '@/components/ProsCons';
import FaqAccordion from '@/components/FaqAccordion';
import ProductCard from '@/components/ProductCard';
import BlogCard from '@/components/BlogCard';
import ReviewScores from '@/components/ReviewScores';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import SocialShare from '@/components/SocialShare';
import CommentsSection from '@/components/CommentsSection';
import TableOfContents from '@/components/TableOfContents';
import AuthorBio from '@/components/AuthorBio';
import AffiliateDisclosureNotice from '@/components/AffiliateDisclosureNotice';
import ProductAlternatives from '@/components/ProductAlternatives';
import AdBanner from '@/components/AdBanner';
import { formatDate, estimateReadTime, safeJsonParse } from '@/lib/utils';
import { Clock, ShieldCheck, Tag, ChevronRight, CheckCircle2, XCircle, RefreshCw, Sparkles, User } from 'lucide-react';
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema, generateReviewSchema } from '@/lib/seo';
import { parseMarkdownToHtml } from '@/lib/markdown';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const blog = await db.blog.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!blog) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app';
  const pageUrl = `${siteUrl}/blog/${blog.slug}`;
  const title = blog.metaTitle || `${blog.title} | TechPulse`;
  const description = blog.metaDescription || `Read our comprehensive research-based review and buying guide for ${blog.title}.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      images: [{ url: blog.featuredImage, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [blog.featuredImage],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await db.blog.findUnique({
    where: { slug: params.slug },
    include: { category: true, product: true },
  });

  if (!blog || blog.status !== 'PUBLISHED') {
    notFound();
  }

  // Increment view counter in background
  db.blog.update({
    where: { id: blog.id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  const linkedProduct = blog.product;

  // Related articles from same category
  const relatedBlogs = await db.blog.findMany({
    where: { categoryId: blog.categoryId, id: { not: blog.id }, status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  // Alternative products in same category
  const alternatives = await db.product.findMany({
    where: {
      categoryId: blog.categoryId,
      id: { not: linkedProduct?.id || '' },
      status: 'PUBLISHED',
    },
    take: 4,
  });

  const rawBlogSpecs = safeJsonParse<Record<string, string>>(blog.specifications, {});
  const rawProdSpecs = linkedProduct ? safeJsonParse<Record<string, string>>(linkedProduct.specifications, {}) : {};

  const ratingScores = rawBlogSpecs._ratingScores
    ? safeJsonParse(rawBlogSpecs._ratingScores, null) || rawBlogSpecs._ratingScores
    : (rawProdSpecs._ratingScores ? safeJsonParse(rawProdSpecs._ratingScores, null) || rawProdSpecs._ratingScores : null);

  const priceHistoryData = rawBlogSpecs._priceHistory
    ? safeJsonParse(rawBlogSpecs._priceHistory, null) || rawBlogSpecs._priceHistory
    : (rawProdSpecs._priceHistory ? safeJsonParse(rawProdSpecs._priceHistory, null) || rawProdSpecs._priceHistory : null);

  const rawMergedSpecs = { ...rawProdSpecs, ...rawBlogSpecs };
  const specifications = { ...rawMergedSpecs };
  delete specifications._ratingScores;
  delete specifications._priceHistory;

  const features = safeJsonParse<string[]>(
    blog.features && blog.features !== '[]' ? blog.features : (linkedProduct?.features || '[]'),
    []
  );
  const pros = safeJsonParse<string[]>(
    blog.pros && blog.pros !== '[]' ? blog.pros : (linkedProduct?.pros || '[]'),
    []
  );
  const cons = safeJsonParse<string[]>(
    blog.cons && blog.cons !== '[]' ? blog.cons : (linkedProduct?.cons || '[]'),
    []
  );
  const faqs = safeJsonParse<{ question: string; answer: string }[]>(blog.faqs, []);
  const tags = safeJsonParse<string[]>(blog.tags, []);

  const readTime = estimateReadTime(blog.content);

  const isUpdated =
    blog.updatedAt &&
    blog.updatedAt.getTime() - blog.createdAt.getTime() > 24 * 60 * 60 * 1000;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app';
  const pageUrl = `${siteUrl}/blog/${blog.slug}`;

  // Structured Data Schemas
  const articleSchema = generateArticleSchema({
    title: blog.title,
    description: blog.metaDescription || blog.title,
    image: blog.featuredImage,
    url: pageUrl,
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    authorName: 'TechPulse Editorial Team',
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: blog.category.name, url: `${siteUrl}/category/${blog.category.slug}` },
    { name: blog.title, url: pageUrl },
  ]);

  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  return (
    <article className="pb-16 pt-6 bg-neutral-50 dark:bg-neutral-950">
      {/* Schema.org Script Injections */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link href={`/category/${blog.category.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400">
            {blog.category.name}
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-xs">{blog.title}</span>
        </nav>

        {/* Title & Metadata */}
        <header className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/category/${blog.category.slug}`}
              className="bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold px-3 py-1 rounded-full hover:bg-brand-100 transition-colors"
            >
              {blog.category.name}
            </Link>

            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span>Published: {formatDate(blog.createdAt)}</span>
              {isUpdated && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <RefreshCw className="w-3 h-3" />
                    Updated: {formatDate(blog.updatedAt)}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                {readTime}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
            {blog.title}
          </h1>

          {blog.metaDescription && (
            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
              {blog.metaDescription}
            </p>
          )}

          {/* Author & Editorial Disclosure Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                T
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white">TechPulse Editorial Research</span>
                <span className="block text-[11px] text-neutral-400">Specification & Market Analysis</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Independent Editorial Standards</span>
            </div>
          </div>
        </header>

        {/* Hero Featured Image */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-8 shadow-sm bg-neutral-100 dark:bg-neutral-800">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contextual Affiliate Notice */}
        <AffiliateDisclosureNotice compact className="mb-8" />

        {/* Quick Summary Box with Buy Button */}
        <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                Product Quick Verdict
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {blog.product ? blog.product.name : blog.title}
              </h2>
              {blog.product && (
                <div className="text-neutral-400 text-xs mt-1">
                  Brand: <strong className="text-neutral-200">{blog.product.brand}</strong>
                </div>
              )}
            </div>

            {blog.product && (
              <div className="text-right">
                <span className="text-xs text-neutral-400 block mb-1 font-semibold">Current Price</span>
                <RegionalPrice
                  basePrice={blog.product.price}
                  amazonUrl={blog.amazonUrl}
                  affiliateUrl={blog.affiliateUrl}
                  marketplaces={blog.marketplaces || blog.product.marketplaces}
                  className="text-2xl font-extrabold text-white"
                  showFlag={true}
                />
              </div>
            )}
          </div>

          {/* Highlights bullet points */}
          {features.length > 0 && (
            <ul className="space-y-2 text-sm text-neutral-300">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Amazon CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <AmazonButton
              url={blog.affiliateUrl || blog.amazonUrl}
              price={blog.product?.price}
              blogId={blog.id}
              marketplaces={blog.marketplaces || blog.product?.marketplaces}
              size="lg"
              className="w-full sm:w-auto"
              text="Check Latest Price on Amazon"
            />
            <span className="text-xs text-neutral-400 text-center sm:text-left">
              *Direct link to Amazon official store. Prices update with merchant changes.
            </span>
          </div>
        </div>

        {/* Table of Contents */}
        <TableOfContents content={blog.content} />

        {/* AdSense Placement 1: After Intro / Summary */}
        <AdBanner slot="blog-top-ad" format="horizontal" />

        {/* Evaluation Scores Breakdown */}
        <ReviewScores scoresData={ratingScores || undefined} />

        {/* Price History Chart */}
        <PriceHistoryChart currentPrice={blog.product?.price || '$1,199'} historyData={priceHistoryData || undefined} />

        {/* Key Specifications Table */}
        {Object.keys(specifications).length > 0 && (
          <section className="my-10 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Technical Overview
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">
                Key Specifications & Technical Data
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60">
                    <th className="py-3 px-4 font-bold text-neutral-900 dark:text-white rounded-l-xl">Feature</th>
                    <th className="py-3 px-4 font-bold text-neutral-900 dark:text-white rounded-r-xl">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {Object.entries(specifications).map(([key, val]) => (
                    <tr key={key} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">{key}</td>
                      <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white break-words">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pros & Cons Section */}
        {(pros.length > 0 || cons.length > 0) && (
          <ProsCons pros={pros} cons={cons} />
        )}

        {/* Who Should Buy vs Who Should Avoid */}
        <section className="my-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 space-y-3">
            <h4 className="text-base font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Who Should Buy It?</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Shoppers looking for top-tier performance in this price bracket.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Users who prioritize reliable build quality and key feature highlights.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>Buyers seeking verified long-term customer satisfaction and brand warranty.</span>
              </li>
            </ul>
          </div>

          <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 space-y-3">
            <h4 className="text-base font-extrabold text-rose-900 dark:text-rose-300 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Who Should Avoid It?</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Budget-constrained buyers who do not need pro-level premium specs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>Users looking for alternative ecosystems or specific specialized ports.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* AdSense Placement 2: Mid Content */}
        <AdBanner slot="blog-mid-ad" format="auto" />

        {/* Article Body Content */}
        <section 
          className="prose dark:prose-invert max-w-none my-10 font-sans leading-relaxed text-neutral-800 dark:text-neutral-200"
          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(blog.content) }}
        />

        {/* Conclusion / Final Verdict Box */}
        {blog.conclusion && (
          <section className="bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 sm:p-8 my-10 space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-sans">
              Final Verdict: Balanced Recommendation
            </h3>
            <p className="text-neutral-800 dark:text-neutral-200 text-base leading-relaxed">
              {blog.conclusion}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <AmazonButton
                url={blog.affiliateUrl || blog.amazonUrl}
                price={blog.product?.price}
                blogId={blog.id}
                size="md"
                text="Check Availability & Deals"
              />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Compare prices and check verified buyer customer reviews on Amazon.
              </span>
            </div>
          </section>
        )}

        {/* Smart Alternatives */}
        {alternatives.length > 0 && (
          <ProductAlternatives
            currentProductId={linkedProduct?.id}
            currentProductName={linkedProduct?.name || blog.title}
            alternatives={alternatives}
          />
        )}

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <FaqAccordion faqs={faqs} />
        )}

        {/* Author Bio Section */}
        <AuthorBio className="my-10" />

        {/* Comments Section */}
        <CommentsSection />

        {/* Social Share & Tags */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-neutral-400" />
              {tags.map((t, i) => (
                <span key={i} className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-md font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <SocialShare title={blog.title} />
        </div>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  More From {blog.category.name}
                </span>
                <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sans mt-1">
                  Related Guides & Reviews
                </h3>
              </div>
              <Link
                href={`/category/${blog.category.slug}`}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View Category →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((b) => (
                <BlogCard key={b.id} blog={b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
