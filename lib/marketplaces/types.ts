export type MarketplaceType =
  | 'AMAZON'
  | 'FLIPKART'
  | 'CROMA'
  | 'MYNTRA'
  | 'WALMART'
  | 'EBAY'
  | 'GENERIC';

export interface VerifiedSpecPoint {
  field: string;
  value: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  category?: string;
}

export interface ProductIdentity {
  marketplace: MarketplaceType;
  productId: string | null; // e.g. ASIN for Amazon, FSN/PID for Flipkart, SKU for others
  marketplaceName: string;
  title: string;
  brand: string;
  model: string;
  categoryName: string;
  originalPrice?: string;
  currentPrice: string;
  currency: string;
  discount?: string;
  availability: string;
  mainImage: string;
  galleryImages: string[];
  features: string[];
  specifications: Record<string, string>;
  specDetails?: VerifiedSpecPoint[];
  sourceUrl: string;
  affiliateUrl: string;
  affiliateParams?: Record<string, string>;
  isVerified: boolean;
  verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'UNVERIFIED';
  verifiedAt: string;
  rating?: number;
  reviewCount?: number;
}

export interface ProductMatchCandidate {
  id: string;
  title: string;
  brand: string;
  model: string;
  categoryName: string;
  marketplace: MarketplaceType;
  marketplaceName: string;
  productId: string;
  currentPrice: string;
  currency: string;
  image: string;
  url: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0 to 100
  matchReason: string;
}

export interface ScrapedProductData {
  marketplace: MarketplaceType;
  productId?: string;
  title?: string;
  brand?: string;
  model?: string;
  price?: string;
  currency?: string;
  originalPrice?: string;
  discount?: string;
  availability?: string;
  images: string[];
  bullets: string[];
  specs: Record<string, string>;
  description?: string;
  rating?: number;
  reviewCount?: number;
}

export interface MarketplaceAdapter {
  readonly marketplace: MarketplaceType;
  readonly name: string;
  readonly supportedDomains: string[];

  canHandleUrl(url: string): boolean;
  extractProductId(urlOrText: string): string | null;
  extractAffiliateParams(url: string): Record<string, string>;
  buildAffiliateUrl(baseUrlOrId: string, userAffiliateUrl?: string, defaultTag?: string): string;
  scrapeProduct(url: string): Promise<ScrapedProductData | null>;
  searchProducts(keyword: string, limit?: number): Promise<ProductMatchCandidate[]>;
  buildRegionalDeals(
    productId: string | null,
    title: string,
    basePrice: string,
    userAffiliateUrl?: string,
    tag?: string
  ): Record<string, { country: string; currency: string; price: string; availability: string; marketplace: string; url: string }>;
}
