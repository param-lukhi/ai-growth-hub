export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface ArticleSchemaProps {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
}

export function generateArticleSchema(a: ArticleSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: a.title,
    description: a.description,
    image: a.image ? [a.image] : [],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': a.url,
    },
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    author: {
      '@type': 'Person',
      name: a.authorName || 'TechPulse Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: a.publisherName || 'TechPulse Reviews',
      logo: {
        '@type': 'ImageObject',
        url: a.publisherLogo || 'https://techpulsereviews.com/logo.png',
      },
    },
  };
}

export interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  brand: string;
  price?: string;
  currency?: string;
  url: string;
  ratingValue?: number;
  reviewCount?: number;
}

export function generateProductSchema(p: ProductSchemaProps) {
  const cleanPrice = p.price ? p.price.replace(/[^0-9.]/g, '') : undefined;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.image ? [p.image] : [],
    brand: {
      '@type': 'Brand',
      name: p.brand,
    },
  };

  if (cleanPrice && cleanPrice !== '') {
    schema.offers = {
      '@type': 'Offer',
      price: cleanPrice,
      priceCurrency: p.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: p.url,
    };
  }

  // Only include aggregateRating if genuine ratings are provided
  if (p.ratingValue && p.ratingValue > 0 && p.reviewCount && p.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.ratingValue,
      reviewCount: p.reviewCount,
    };
  }

  return schema;
}

export interface ReviewSchemaProps {
  title: string;
  description: string;
  image: string;
  author?: string;
  datePublished?: string;
  itemReviewed: {
    name: string;
    brand: string;
  };
  ratingValue?: number;
}

export function generateReviewSchema(r: ReviewSchemaProps) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: r.title,
    description: r.description,
    image: r.image,
    author: {
      '@type': 'Person',
      name: r.author || 'TechPulse Editorial Team',
    },
    datePublished: r.datePublished || new Date().toISOString(),
    itemReviewed: {
      '@type': 'Product',
      name: r.itemReviewed.name,
      brand: {
        '@type': 'Brand',
        name: r.itemReviewed.brand,
      },
    },
  };

  // Only add reviewRating when a genuine rating value is supplied
  if (r.ratingValue && r.ratingValue > 0) {
    schema.reviewRating = {
      '@type': 'Rating',
      ratingValue: r.ratingValue,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateOrganizationSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TechPulse',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/techpulse',
      'https://facebook.com/techpulse',
    ],
  };
}
