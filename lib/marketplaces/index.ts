import { MarketplaceAdapter, MarketplaceType } from './types';
import { AmazonAdapter } from './amazon';
import { FlipkartAdapter } from './flipkart';
import { GenericProductAdapter } from './generic';

export * from './types';
export * from './amazon';
export * from './flipkart';
export * from './generic';

const amazonAdapter = new AmazonAdapter();
const flipkartAdapter = new FlipkartAdapter();
const cromaAdapter = new GenericProductAdapter('CROMA', 'Croma', ['croma.com']);
const myntraAdapter = new GenericProductAdapter('MYNTRA', 'Myntra', ['myntra.com']);
const walmartAdapter = new GenericProductAdapter('WALMART', 'Walmart', ['walmart.com']);
const ebayAdapter = new GenericProductAdapter('EBAY', 'eBay', ['ebay.com']);
const genericAdapter = new GenericProductAdapter('GENERIC', 'Online Store', []);

const registeredAdapters: MarketplaceAdapter[] = [
  amazonAdapter,
  flipkartAdapter,
  cromaAdapter,
  myntraAdapter,
  walmartAdapter,
  ebayAdapter,
  genericAdapter,
];

/**
 * Automatically detects the appropriate marketplace adapter from a given URL or marketplace type string.
 */
export function getMarketplaceAdapter(urlOrType?: string): MarketplaceAdapter {
  if (!urlOrType) return amazonAdapter;
  const input = urlOrType.trim();

  // 1. Direct type match
  const directMatch = registeredAdapters.find(
    (a) => a.marketplace.toUpperCase() === input.toUpperCase()
  );
  if (directMatch) return directMatch;

  // 2. URL Domain match
  for (const adapter of registeredAdapters) {
    if (adapter.canHandleUrl(input)) {
      return adapter;
    }
  }

  // Fallback to Amazon for general ASINs or generic adapter
  if (/^[A-Z0-9]{10}$/i.test(input)) {
    return amazonAdapter;
  }

  return genericAdapter;
}
