import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { validateArticleQuality } from '@/lib/saas/agent-engine';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body; // 'APPROVE' | 'REJECT' | 'CONVERT_TO_DRAFT'

    const topic = await prisma.topicOpportunity.findUnique({
      where: { id: params.id },
      include: {
        website: { include: { agent: true } }
      }
    });

    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic not found.' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.topicOpportunity.update({
        where: { id: params.id },
        data: { status: 'APPROVED' }
      });
      return NextResponse.json({ success: true, topic: updated });
    }

    if (action === 'REJECT') {
      const updated = await prisma.topicOpportunity.update({
        where: { id: params.id },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ success: true, topic: updated });
    }

    if (action === 'CONVERT_TO_DRAFT') {
      const website = topic.website;
      const slug = topic.primaryKeyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const isTech = website.niche.toLowerCase().includes('tech');
      const intro = `Shopping for ${topic.topic} requires sorting through dozens of confusing specifications and marketing buzzwords. In this research-backed guide, the ${website.name} team evaluates performance, reliability, build quality, and true value to help you make an informed buying decision.`;
      
      const content = `## Quick Recommendations: Top Picks

1. **Best Overall Winner**: Premium performance, reliable build, and verified durability.
2. **Best Budget Choice**: High-value option delivering key features at an accessible price.
3. **Best for Enthusiasts**: Advanced features designed for demanding power users.

---

## Detailed Evaluation & Testing Criteria

When ranking ${topic.topic}, we analyzed real consumer consensus data, verified manufacturer hardware specifications, thermal/battery endurance, and long-term reliability.

### Key Factors Tested:
- **Build Quality & Durability**: Materials, finish, and wear resistance.
- **Real-World Performance**: Everyday responsiveness and efficiency.
- **Price-to-Value Ratio**: How it compares to previous generations and close competitors.

---

## Comparison Table

| Product | Key Highlight | Best For | Verified Rating | Amazon Deal |
| :--- | :--- | :--- | :--- | :--- |
| **Top Pick Alpha** | Maximum Endurance & Durability | Daily Use & Longevity | 4.6 / 5.0 | Check Price |
| **Top Pick Beta** | Budget Value & Compact Design | Value Shoppers | 4.4 / 5.0 | Check Price |
| **Top Pick Gamma** | Premium Feature Set | Enthusiasts | 4.7 / 5.0 | Check Price |

---

## Pros & Cons

### What We Like:
- Verified hardware specifications and high build quality
- Outstanding value compared to high-end flagship alternatives
- Responsive customer support and reliable warranty coverage

### What to Keep in Mind:
- Stock availability may fluctuate during flash sales
- Ensure you choose the correct model variant for your requirements

---

## Frequently Asked Questions

### Which option offers the best value for money?
Our #1 recommended pick offers the highest combination of durability, feature depth, and customer satisfaction in this category.

### Does this product include warranty support?
Yes, all recommended items carry standard manufacturer warranty protection.
`;

      const initialArticleData = {
        title: topic.suggestedTitle,
        slug,
        category: isTech ? 'Electronics & Technology' : 'Automotive Accessories',
        tags: [topic.primaryKeyword, website.niche, 'Buying Guide', 'Reviews'],
        author: `${website.name} Editorial Team`,
        featuredImage: 'https://m.media-amazon.com/images/I/61aLy7kImQL._SL1500_.jpg',
        introduction: intro,
        content,
        pros: ['Exceptional price-to-performance ratio', 'Tested reliability and build quality', 'Full warranty support'],
        cons: ['High demand may cause temporary shipping delays'],
        faqs: [
          { question: `What makes this ${topic.topic} worth buying?`, answer: 'High verified durability, competitive pricing, and strong user review ratings.' },
          { question: 'Is there a warranty included?', answer: 'Yes, full 1-year standard manufacturer warranty is provided.' }
        ],
        conclusion: `Based on our comprehensive analysis, choosing any of the top-ranked options above ensures you receive the best possible performance for your investment in ${website.targetCountry}.`,
        affiliateDisclosure: 'This article may contain affiliate links. If you purchase through our links, we may earn a commission at no additional cost to you.',
        seoTitle: `${topic.suggestedTitle} - Buying Guide & Reviews`,
        metaDescription: `Discover the top-rated ${topic.topic} with our comprehensive review and buying guide. Compare features, pros, cons, and current verified deals.`,
        canonicalUrl: `${website.domainUrl}/blog/${slug}`,
        schemaJson: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": topic.suggestedTitle,
          "author": { "@type": "Organization", "name": website.name }
        }),
        internalLinks: [
          { suggestedLink: `/blog/${slug}`, anchorText: topic.primaryKeyword, targetArticle: topic.suggestedTitle, reason: 'High relevance pillar support' }
        ]
      };

      // Run Quality Validation
      const qcResult = validateArticleQuality(initialArticleData as any, website as any);

      // Create ContentArticle
      const newArticle = await prisma.contentArticle.create({
        data: {
          websiteId: website.id,
          topicId: topic.id,
          title: initialArticleData.title,
          slug: initialArticleData.slug,
          category: initialArticleData.category,
          tags: JSON.stringify(initialArticleData.tags),
          author: initialArticleData.author,
          featuredImage: initialArticleData.featuredImage,
          introduction: initialArticleData.introduction,
          content: initialArticleData.content,
          pros: JSON.stringify(initialArticleData.pros),
          cons: JSON.stringify(initialArticleData.cons),
          faqs: JSON.stringify(initialArticleData.faqs),
          conclusion: initialArticleData.conclusion,
          affiliateDisclosure: initialArticleData.affiliateDisclosure,
          seoTitle: initialArticleData.seoTitle,
          metaDescription: initialArticleData.metaDescription,
          canonicalUrl: initialArticleData.canonicalUrl,
          schemaJson: initialArticleData.schemaJson,
          internalLinks: JSON.stringify(initialArticleData.internalLinks),
          qualityScore: qcResult.overallScore,
          qualityBreakdown: JSON.stringify(qcResult),
          status: 'DRAFT'
        }
      });

      // Update Topic Status
      await prisma.topicOpportunity.update({
        where: { id: params.id },
        data: { status: 'CONVERTED_TO_DRAFT' }
      });

      // Log Activity
      await prisma.agentActivityLog.create({
        data: {
          websiteId: website.id,
          agentName: website.agent?.agentName || `${website.name} Growth Agent`,
          actionType: 'DRAFT_GENERATED',
          message: `Converted topic "${topic.topic}" into structured draft with Quality Score ${qcResult.overallScore}/100.`,
          status: 'SUCCESS'
        }
      });

      return NextResponse.json({ success: true, article: newArticle });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
