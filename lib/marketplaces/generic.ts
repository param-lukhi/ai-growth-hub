import {
  MarketplaceAdapter,
  MarketplaceType,
  ProductMatchCandidate,
  ScrapedProductData,
} from './types';

export class GenericProductAdapter implements MarketplaceAdapter {
  readonly marketplace: MarketplaceType;
  readonly name: string;
  readonly supportedDomains: string[];

  constructor(
    marketplace: MarketplaceType = 'GENERIC',
    name: string = 'Retail Store',
    supportedDomains: string[] = []
  ) {
    this.marketplace = marketplace;
    this.name = name;
    this.supportedDomains = supportedDomains;
  }

  canHandleUrl(url: string): boolean {
    if (!url) return false;
    if (this.supportedDomains.length === 0) return true; // Generic fallback
    const lower = url.toLowerCase();
    return this.supportedDomains.some((d) => lower.includes(d));
  }

  extractProductId(urlOrText: string): string | null {
    if (!urlOrText) return null;
    const match = urlOrText.match(/(?:product|item|p|dp|id)[\/=:]([A-Za-z0-9-_]{4,20})/i);
    return match ? match[1] : null;
  }

  extractAffiliateParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    try {
      if (!url.startsWith('http')) return params;
      const parsed = new URL(url);
      parsed.searchParams.forEach((v, k) => {
        if (
          k.toLowerCase().includes('aff') ||
          k.toLowerCase().includes('tag') ||
          k.toLowerCase().includes('ref') ||
          k.toLowerCase().includes('partner')
        ) {
          params[k] = v;
        }
      });
    } catch (_) {}
    return params;
  }

  buildAffiliateUrl(
    baseUrlOrId: string,
    userAffiliateUrl?: string,
    defaultTag: string = 'techpulse-20'
  ): string {
    if (userAffiliateUrl && userAffiliateUrl.trim().length > 0) {
      return userAffiliateUrl.trim();
    }
    if (baseUrlOrId.startsWith('http')) {
      const sep = baseUrlOrId.includes('?') ? '&' : '?';
      return `${baseUrlOrId}${sep}afftag=${defaultTag}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(baseUrlOrId)}`;
  }

  async scrapeProduct(url: string): Promise<ScrapedProductData | null> {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store',
      });

      if (!res.ok) return null;
      const html = await res.text();

      const result: ScrapedProductData = {
        marketplace: this.marketplace,
        specs: {},
        bullets: [],
        images: [],
      };

      // 1. JSON-LD Structured Product Data Parsing
      const jsonLdMatches = html.matchAll(
        /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      );
      for (const match of jsonLdMatches) {
        try {
          const parsed = JSON.parse(match[1].trim());
          const item = parsed['@type'] === 'Product' ? parsed : parsed['@graph']?.find((g: any) => g['@type'] === 'Product');
          if (item) {
            if (item.name) result.title = item.name;
            if (item.brand?.name) result.brand = item.brand.name;
            if (item.offers?.price) {
              const cur = item.offers.priceCurrency || '$';
              result.price = `${cur === 'USD' ? '$' : cur === 'INR' ? '₹' : cur} ${item.offers.price}`;
              result.currency = item.offers.priceCurrency;
            }
            if (item.image) {
              if (Array.isArray(item.image)) result.images.push(...item.image);
              else if (typeof item.image === 'string') result.images.push(item.image);
            }
            if (item.description) result.description = item.description;
          }
        } catch (_) {}
      }

      // 2. OpenGraph Meta Fallbacks
      if (!result.title) {
        const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/i);
        if (ogTitle) result.title = ogTitle[1];
      }

      if (result.images.length === 0) {
        const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (ogImage) result.images.push(ogImage[1]);
      }

      if (!result.price) {
        const ogPrice = html.match(/<meta property="product:price:amount" content="([^"]+)"/i);
        if (ogPrice) result.price = `$${ogPrice[1]}`;
      }

      return result;
    } catch (_) {
      return null;
    }
  }

  async searchProducts(keyword: string, limit: number = 3): Promise<ProductMatchCandidate[]> {
    const cleanTitle = keyword.trim();
    return [
      {
        id: `gen-${Math.random().toString(36).substring(2, 9)}`,
        title: cleanTitle,
        brand: cleanTitle.split(' ')[0] || 'Brand',
        model: cleanTitle,
        categoryName: 'General',
        marketplace: this.marketplace,
        marketplaceName: this.name,
        productId: 'SKU12345',
        currentPrice: '$199.00',
        currency: 'USD',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        url: `https://www.google.com/search?q=${encodeURIComponent(cleanTitle)}`,
        confidence: 'medium' as const,
        confidenceScore: 75,
        matchReason: `General store match for ${cleanTitle}.`,
      },
    ].slice(0, limit);
  }

  buildRegionalDeals(
    productId: string | null,
    title: string,
    basePrice: string,
    userAffiliateUrl?: string,
    tag: string = 'techpulse-20'
  ): Record<string, { country: string; currency: string; price: string; availability: string; marketplace: string; url: string }> {
    const url = this.buildAffiliateUrl(productId || title, userAffiliateUrl, tag);
    return {
      Global: {
        country: 'Global',
        currency: 'USD',
        price: basePrice,
        availability: 'In Stock',
        marketplace: this.name,
        url,
      },
    };
  }
}
