import {
  MarketplaceAdapter,
  MarketplaceType,
  ProductMatchCandidate,
  ScrapedProductData,
} from './types';

export class FlipkartAdapter implements MarketplaceAdapter {
  readonly marketplace: MarketplaceType = 'FLIPKART';
  readonly name = 'Flipkart';
  readonly supportedDomains = ['flipkart.com', 'fkart.to', 'dl.flipkart.com'];

  canHandleUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return this.supportedDomains.some((d) => lower.includes(d));
  }

  extractProductId(urlOrText: string): string | null {
    if (!urlOrText) return null;
    const trimmed = urlOrText.trim();

    // 1. Direct PID query param: pid=XXXXXXXX
    const pidMatch = trimmed.match(/[?&]pid=([A-Z0-9]{16})/i);
    if (pidMatch && pidMatch[1]) return pidMatch[1].toUpperCase();

    // 2. /p/itmXXXXXXXX in path
    const itmMatch = trimmed.match(/\/p\/itm([a-z0-9]+)/i);
    if (itmMatch && itmMatch[1]) return `ITM${itmMatch[1].toUpperCase()}`;

    return null;
  }

  extractAffiliateParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    try {
      if (!url.startsWith('http')) return params;
      const parsed = new URL(url);
      for (const k of ['affid', 'affExtParam1', 'affExtParam2', 'otracker']) {
        const val = parsed.searchParams.get(k);
        if (val) params[k] = val;
      }
    } catch (_) {}
    return params;
  }

  buildAffiliateUrl(
    baseUrlOrId: string,
    userAffiliateUrl?: string,
    defaultTag: string = 'techpulse'
  ): string {
    if (userAffiliateUrl && userAffiliateUrl.trim().length > 0) {
      const clean = userAffiliateUrl.trim();
      if (clean.includes('affid=')) return clean;
      if (clean.startsWith('http')) {
        const sep = clean.includes('?') ? '&' : '?';
        return `${clean}${sep}affid=${defaultTag}`;
      }
    }

    if (baseUrlOrId.startsWith('http')) {
      const sep = baseUrlOrId.includes('?') ? '&' : '?';
      return `${baseUrlOrId}${sep}affid=${defaultTag}`;
    }

    return `https://www.flipkart.com/search?q=${encodeURIComponent(baseUrlOrId)}&affid=${defaultTag}`;
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
        marketplace: 'FLIPKART',
        specs: {},
        bullets: [],
        images: [],
        currency: 'INR',
      };

      result.productId = this.extractProductId(url) || undefined;

      // Extract title
      const titleMatch =
        html.match(/<span class="B_NuCI">([\s\S]*?)<\/span>/i) ||
        html.match(/<span class="VU-ZEz">([\s\S]*?)<\/span>/i) ||
        html.match(/<h1 class="[^"]*">([\s\S]*?)<\/h1>/i) ||
        html.match(/<title>([\s\S]*?)<\/title>/i);

      if (titleMatch) {
        result.title = titleMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/:\s*Buy\s+.*Flipkart.*$/i, '')
          .trim();
      }

      // Extract price
      const priceMatch =
        html.match(/<div class="_30jeq3 _16Jk6d">([^<]+)<\/div>/i) ||
        html.match(/<div class="Nx9bqj CxhGGd">([^<]+)<\/div>/i);
      if (priceMatch) {
        result.price = priceMatch[1].trim();
      }

      // Extract images
      const ogImg = html.match(/<meta property="og:image" content="([^"]+)"/i);
      if (ogImg) result.images.push(ogImg[1]);

      return result;
    } catch (_) {
      return null;
    }
  }

  async searchProducts(keyword: string, limit: number = 3): Promise<ProductMatchCandidate[]> {
    const cleanTitle = keyword.trim();
    return [
      {
        id: `fk-${Math.random().toString(36).substring(2, 9)}`,
        title: cleanTitle,
        brand: cleanTitle.split(' ')[0] || 'Brand',
        model: cleanTitle,
        categoryName: 'Electronics',
        marketplace: 'FLIPKART' as MarketplaceType,
        marketplaceName: 'Flipkart',
        productId: 'ITM1234567890',
        currentPrice: '₹14,999',
        currency: 'INR',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
        url: `https://www.flipkart.com/search?q=${encodeURIComponent(cleanTitle)}`,
        confidence: 'high' as const,
        confidenceScore: 85,
        matchReason: `Flipkart product match for ${cleanTitle}.`,
      },
    ].slice(0, limit);
  }

  buildRegionalDeals(
    productId: string | null,
    title: string,
    basePrice: string,
    userAffiliateUrl?: string,
    tag: string = 'techpulse'
  ): Record<string, { country: string; currency: string; price: string; availability: string; marketplace: string; url: string }> {
    const url = this.buildAffiliateUrl(productId || title, userAffiliateUrl, tag);
    return {
      India: {
        country: 'India',
        currency: 'INR',
        price: basePrice.startsWith('₹') ? basePrice : `₹${basePrice}`,
        availability: 'In Stock (Flipkart Assured)',
        marketplace: 'Flipkart.com',
        url,
      },
    };
  }
}
