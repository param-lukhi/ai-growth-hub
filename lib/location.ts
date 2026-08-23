export interface MarketplaceConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  domain: string;
  defaultTag: string;
}

export const MARKETPLACES: Record<string, MarketplaceConfig> = {
  IN: { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹', domain: 'amazon.in', defaultTag: 'techpulsein-20' },
  US: { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', domain: 'amazon.com', defaultTag: 'techpulse-20' },
  GB: { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£', domain: 'amazon.co.uk', defaultTag: 'techpulseuk-20' },
  CA: { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: '$', domain: 'amazon.ca', defaultTag: 'techpulseca-20' },
  AU: { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', symbol: '$', domain: 'amazon.com.au', defaultTag: 'techpulseau-20' },
  DE: { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', symbol: '€', domain: 'amazon.de', defaultTag: 'techpulsede-20' },
  FR: { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', symbol: '€', domain: 'amazon.fr', defaultTag: 'techpulsefr-20' },
  IT: { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', symbol: '€', domain: 'amazon.it', defaultTag: 'techpulseit-20' },
  ES: { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', symbol: '€', domain: 'amazon.es', defaultTag: 'techpulsees-20' },
  NL: { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', symbol: '€', domain: 'amazon.nl', defaultTag: 'techpulsenl-20' },
  BE: { code: 'BE', name: 'Belgium', flag: '🇧🇪', currency: 'EUR', symbol: '€', domain: 'amazon.com.be', defaultTag: 'techpulsebe-20' },
  SE: { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', symbol: 'kr', domain: 'amazon.se', defaultTag: 'techpulsese-20' },
  PL: { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN', symbol: 'zł', domain: 'amazon.pl', defaultTag: 'techpulsepl-20' },
  JP: { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', symbol: '¥', domain: 'amazon.co.jp', defaultTag: 'techpulsejp-20' },
  SG: { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: '$', domain: 'amazon.sg', defaultTag: 'techpulsesg-20' },
  AE: { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ', domain: 'amazon.ae', defaultTag: 'techpulseae-20' },
  SA: { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', symbol: '﷼', domain: 'amazon.sa', defaultTag: 'techpulsesa-20' },
  BR: { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', symbol: 'R$', domain: 'amazon.com.br', defaultTag: 'techpulsebr-20' },
  MX: { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', symbol: '$', domain: 'amazon.com.mx', defaultTag: 'techpulsemx-20' },
  TR: { code: 'TR', name: 'Turkey', flag: '🇹🇷', currency: 'TRY', symbol: '₺', domain: 'amazon.com.tr', defaultTag: 'techpulsetr-20' },
};

export const MARKETPLACE_LIST = Object.values(MARKETPLACES);

export function getMarketplaceByCode(code?: string | null): MarketplaceConfig {
  if (!code) return MARKETPLACES.US;
  const upper = code.toUpperCase();
  return MARKETPLACES[upper] || MARKETPLACES.US;
}

export function detectBrowserCountry(): string {
  if (typeof window === 'undefined') return 'US';

  // Check saved choice
  const saved = localStorage.getItem('user_country');
  if (saved && MARKETPLACES[saved]) return saved;

  // Check navigator language locale
  const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || '').toUpperCase();
  
  if (lang.includes('IN') || lang.includes('HI')) return 'IN';
  if (lang.includes('GB')) return 'GB';
  if (lang.includes('DE')) return 'DE';
  if (lang.includes('FR')) return 'FR';
  if (lang.includes('IT')) return 'IT';
  if (lang.includes('ES')) return 'ES';
  if (lang.includes('NL')) return 'NL';
  if (lang.includes('BE')) return 'BE';
  if (lang.includes('SE') || lang.includes('SV')) return 'SE';
  if (lang.includes('PL')) return 'PL';
  if (lang.includes('JP') || lang.includes('JA')) return 'JP';
  if (lang.includes('SG')) return 'SG';
  if (lang.includes('AE')) return 'AE';
  if (lang.includes('SA')) return 'SA';
  if (lang.includes('BR') || lang.includes('PT')) return 'BR';
  if (lang.includes('MX')) return 'MX';
  if (lang.includes('TR')) return 'TR';
  if (lang.includes('CA')) return 'CA';
  if (lang.includes('AU')) return 'AU';
  if (lang.includes('US') || lang.includes('EN')) return 'US';

  return 'US'; // Default fallback
}

export interface RegionalProductData {
  price: string;
  affiliateUrl: string;
  marketplaceName: string;
  countryCode: string;
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  domain: string;
  isLocalAvailable: boolean;
  isFallback: boolean;
}

export interface MarketplaceEntry {
  price?: string;
  url?: string;
  available?: boolean;
}

export function resolveRegionalProduct(
  basePrice: string,
  baseAmazonUrl: string,
  baseAffiliateUrl?: string | null,
  marketplacesJson?: string | null,
  countryCode: string = 'US',
  defaultMarketplaceCode: string = 'IN'
): RegionalProductData {
  const targetMarket = getMarketplaceByCode(countryCode);

  let customMarketplaces: Record<string, MarketplaceEntry> = {};
  if (marketplacesJson) {
    try {
      customMarketplaces = JSON.parse(marketplacesJson);
    } catch (e) {}
  }

  // 1. Direct match for target country
  const targetData = customMarketplaces[targetMarket.code];
  if (targetData && targetData.price && targetData.url && targetData.available !== false) {
    return {
      price: targetData.price,
      affiliateUrl: targetData.url,
      marketplaceName: targetMarket.name,
      countryCode: targetMarket.code,
      flag: targetMarket.flag,
      currencySymbol: targetMarket.symbol,
      currencyCode: targetMarket.currency,
      domain: targetMarket.domain,
      isLocalAvailable: true,
      isFallback: false,
    };
  }

  // 2. Fallback to Admin Default Marketplace if available in JSON
  const fallbackMarket = getMarketplaceByCode(defaultMarketplaceCode);
  const fallbackData = customMarketplaces[fallbackMarket.code];
  if (fallbackData && fallbackData.price && fallbackData.url && fallbackData.available !== false) {
    return {
      price: fallbackData.price,
      affiliateUrl: fallbackData.url,
      marketplaceName: fallbackMarket.name,
      countryCode: fallbackMarket.code,
      flag: fallbackMarket.flag,
      currencySymbol: fallbackMarket.symbol,
      currencyCode: fallbackMarket.currency,
      domain: fallbackMarket.domain,
      isLocalAvailable: false,
      isFallback: true,
    };
  }

  // 3. Ultimate Fallback to Base Product Attributes
  let baseMarket = MARKETPLACES.IN;
  if (basePrice.includes('$')) baseMarket = MARKETPLACES.US;
  else if (basePrice.includes('€')) baseMarket = MARKETPLACES.DE;
  else if (basePrice.includes('£')) baseMarket = MARKETPLACES.GB;
  else if (basePrice.includes('₹')) baseMarket = MARKETPLACES.IN;

  return {
    price: basePrice,
    affiliateUrl: baseAffiliateUrl || baseAmazonUrl || `https://${targetMarket.domain}`,
    marketplaceName: targetMarket.name,
    countryCode: targetMarket.code,
    flag: targetMarket.flag,
    currencySymbol: targetMarket.symbol,
    currencyCode: targetMarket.currency,
    domain: targetMarket.domain,
    isLocalAvailable: false,
    isFallback: true,
  };
}

/**
 * Generate default Amazon affiliate URLs for all 20 marketplaces given an Amazon URL or ASIN
 */
export function generateRegionalAffiliateUrls(
  amazonUrl: string,
  customTagPrefix: string = 'techpulse'
): Record<string, MarketplaceEntry> {
  const asinMatch = amazonUrl.match(/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  const asin = asinMatch ? asinMatch[1] : null;

  const result: Record<string, MarketplaceEntry> = {};

  MARKETPLACE_LIST.forEach((m) => {
    let url = `https://www.${m.domain}`;
    if (asin) {
      url = `https://www.${m.domain}/dp/${asin}?tag=${m.defaultTag}`;
    } else {
      url = `https://www.${m.domain}?tag=${m.defaultTag}`;
    }
    result[m.code] = {
      price: '',
      url,
      available: true,
    };
  });

  return result;
}
