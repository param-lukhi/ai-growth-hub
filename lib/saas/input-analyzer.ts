import { getCategorySchema } from './category-engine';

export type InputMode = 'TOPIC' | 'PRODUCT' | 'COMPARISON' | 'UPLOAD_MEDIA' | 'URL';

export type ArticleIntent =
  | 'PRODUCT_REVIEW'
  | 'BUYING_GUIDE'
  | 'COMPARISON'
  | 'EXPLAINER'
  | 'HOW_TO'
  | 'NEWS'
  | 'ROUNDUP';

export interface AnalyzedProductEntity {
  rawInput: string;
  brand: string;
  model: string;
  fullName: string;
  category: string;
  subcategory?: string;
  productType: string;
  userImageUrls?: string[];
  productUrl?: string;
  estimatedPrice?: string;
  confidence: number; // 0-100
}

export interface InputAnalysisResult {
  inputMode: InputMode;
  detectedTopic: string;
  cleanedTitle: string;
  articleIntent: ArticleIntent;
  category: string;
  subcategory?: string;
  productType: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'Commercial' | 'Informational' | 'Transactional' | 'Navigational';
  commercialIntent: 'High' | 'Medium' | 'Low';
  products: AnalyzedProductEntity[];
  userUploadedImages: string[];
  referenceUrls: string[];
  customInstructions?: string;
  requiresClarification: boolean;
  clarificationPrompt?: string;
}

const KNOWN_BRANDS: Record<string, string> = {
  oneplus: 'OnePlus',
  apple: 'Apple',
  samsung: 'Samsung',
  sony: 'Sony',
  boat: 'boAt',
  realme: 'Realme',
  noise: 'Noise',
  boult: 'Boult',
  jbl: 'JBL',
  bose: 'Bose',
  sennheiser: 'Sennheiser',
  google: 'Google',
  xiaomi: 'Xiaomi',
  redmi: 'Redmi',
  motorola: 'Motorola',
  hp: 'HP',
  dell: 'Dell',
  lenovo: 'Lenovo',
  asus: 'Asus',
  acer: 'Acer',
  msi: 'MSI',
  lg: 'LG',
  portronics: 'Portronics',
  spigen: 'Spigen',
  anker: 'Anker',
  dji: 'DJI',
  gopro: 'GoPro',
  dyson: 'Dyson'
};

/**
 * Parses freeform user input (topic, product name, URL, or image)
 * into a structured understanding of brand, model, category, and intent.
 */
export function analyzeContentInput(input: {
  topic?: string;
  productNames?: string[];
  productUrl?: string;
  imageUrls?: string[];
  documentText?: string;
  customInstructions?: string;
  targetNiche?: string;
}): InputAnalysisResult {
  const rawTopic = (input.topic || '').trim();
  const productNames = input.productNames || [];
  const imageUrls = input.imageUrls || [];
  const productUrl = (input.productUrl || '').trim();
  const customInstructions = (input.customInstructions || '').trim();
  const targetNiche = input.targetNiche || 'Technology';

  // 1. Determine Input Mode
  let inputMode: InputMode = 'TOPIC';
  if (productNames.length > 1 || rawTopic.toLowerCase().includes(' vs ') || rawTopic.toLowerCase().includes(' compared to ')) {
    inputMode = 'COMPARISON';
  } else if (productNames.length === 1) {
    inputMode = 'PRODUCT';
  } else if (imageUrls.length > 0 && !rawTopic && productNames.length === 0) {
    inputMode = 'UPLOAD_MEDIA';
  } else if (productUrl && !rawTopic && productNames.length === 0) {
    inputMode = 'URL';
  } else if (rawTopic.toLowerCase().includes('review') || rawTopic.toLowerCase().includes('hands-on')) {
    inputMode = 'PRODUCT';
  }

  // 2. Determine Article Format Intent
  let articleIntent: ArticleIntent = 'BUYING_GUIDE';
  const combinedText = `${rawTopic} ${productNames.join(' ')} ${customInstructions}`.toLowerCase();

  if (combinedText.includes(' vs ') || combinedText.includes('comparison') || combinedText.includes('compare') || productNames.length > 1) {
    articleIntent = 'COMPARISON';
  } else if (combinedText.includes('review') || inputMode === 'PRODUCT' || (productNames.length === 1 && !combinedText.includes('best') && !combinedText.includes('top'))) {
    articleIntent = 'PRODUCT_REVIEW';
  } else if (combinedText.includes('how to') || combinedText.includes('setup') || combinedText.includes('guide to using')) {
    articleIntent = 'HOW_TO';
  } else if (combinedText.includes('explainer') || combinedText.includes('what is') || combinedText.includes('how does')) {
    articleIntent = 'EXPLAINER';
  } else if (combinedText.includes('news') || combinedText.includes('launch') || combinedText.includes('announced')) {
    articleIntent = 'NEWS';
  } else if (combinedText.includes('roundup') || combinedText.includes('listicle')) {
    articleIntent = 'ROUNDUP';
  } else {
    articleIntent = 'BUYING_GUIDE';
  }

  // 3. Extract Products & Brands
  const products: AnalyzedProductEntity[] = [];

  // Extract from explicit productNames list
  if (productNames.length > 0) {
    productNames.forEach((pName, idx) => {
      const parsed = parseProductEntity(pName, imageUrls[idx] ? [imageUrls[idx]] : [], targetNiche);
      products.push(parsed);
    });
  } else if (rawTopic) {
    // If topic has "vs", split products
    if (rawTopic.toLowerCase().includes(' vs ')) {
      const parts = rawTopic.split(/ vs /i);
      parts.forEach((part, idx) => {
        const cleanedPart = part.replace(/^compare\s+/i, '').replace(/\s+review$/i, '').trim();
        if (cleanedPart) {
          products.push(parseProductEntity(cleanedPart, imageUrls[idx] ? [imageUrls[idx]] : [], targetNiche));
        }
      });
    } else if (articleIntent === 'PRODUCT_REVIEW') {
      const cleanName = rawTopic.replace(/\s+review$/i, '').replace(/^review\s+of\s+/i, '').trim();
      products.push(parseProductEntity(cleanName, imageUrls, targetNiche));
    }
  }

  // 4. Determine Primary Category Schema
  const effectiveCategoryText = `${products[0]?.category || ''} ${products[0]?.productType || ''} ${rawTopic} ${targetNiche}`;
  const schema = getCategorySchema(effectiveCategoryText);

  // 5. Generate Clean Title & Keywords
  let detectedTopic = rawTopic;
  if (!detectedTopic) {
    if (articleIntent === 'PRODUCT_REVIEW' && products[0]) {
      detectedTopic = `${products[0].fullName} Review: Specifications, Features & Buying Advice`;
    } else if (articleIntent === 'COMPARISON' && products.length >= 2) {
      detectedTopic = `${products[0].fullName} vs ${products[1].fullName}: Which One Should You Buy?`;
    } else {
      detectedTopic = `Best ${schema.category} Guide & Top Recommendations (2026)`;
    }
  }

  const primaryKeyword = products[0]
    ? `${products[0].fullName.toLowerCase()} review`
    : detectedTopic.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  const secondaryKeywords = [
    `${primaryKeyword} price`,
    `${primaryKeyword} specs`,
    `${primaryKeyword} comparison`,
    `best ${schema.category.toLowerCase()}`
  ];

  // 6. Handle Low-Confidence Image Uploads
  let requiresClarification = false;
  let clarificationPrompt: string | undefined;

  if (inputMode === 'UPLOAD_MEDIA' && products.length === 0) {
    requiresClarification = true;
    clarificationPrompt = 'Uploaded image detected. Please specify the exact product name (e.g. OnePlus Nord Buds 4) or product URL so we can verify exact specifications.';
  }

  return {
    inputMode,
    detectedTopic,
    cleanedTitle: detectedTopic,
    articleIntent,
    category: schema.category,
    productType: products[0]?.productType || schema.category,
    primaryKeyword,
    secondaryKeywords,
    searchIntent: articleIntent === 'EXPLAINER' || articleIntent === 'HOW_TO' ? 'Informational' : 'Commercial',
    commercialIntent: articleIntent === 'PRODUCT_REVIEW' || articleIntent === 'BUYING_GUIDE' || articleIntent === 'COMPARISON' ? 'High' : 'Medium',
    products,
    userUploadedImages: imageUrls,
    referenceUrls: productUrl ? [productUrl] : [],
    customInstructions,
    requiresClarification,
    clarificationPrompt
  };
}

/**
 * Parses individual product string into brand, model, and product type
 */
function parseProductEntity(
  rawName: string,
  userImages: string[] = [],
  nicheHint: string = 'Technology'
): AnalyzedProductEntity {
  const clean = rawName.trim();
  const lower = clean.toLowerCase();

  let detectedBrand = 'Generic / Unbranded';
  for (const [key, formatted] of Object.entries(KNOWN_BRANDS)) {
    if (lower.includes(key)) {
      detectedBrand = formatted;
      break;
    }
  }

  // Determine Product Type
  let productType = 'Product';
  if (lower.includes('earbud') || lower.includes('buds') || lower.includes('airdopes') || lower.includes('tws') || lower.includes('headphones')) {
    productType = 'Wireless Earbuds';
  } else if (lower.includes('phone') || lower.includes('iphone') || lower.includes('galaxy') || lower.includes('smartphone')) {
    productType = 'Smartphone';
  } else if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('notebook') || lower.includes('book')) {
    productType = 'Laptop';
  } else if (lower.includes('watch') || lower.includes('smartwatch')) {
    productType = 'Smartwatch';
  } else if (lower.includes('dash cam') || lower.includes('dashcam')) {
    productType = 'Dash Cam';
  } else if (lower.includes('inflator') || lower.includes('air compressor')) {
    productType = 'Tyre Inflator';
  } else if (lower.includes('coating') || lower.includes('ceramic')) {
    productType = 'Ceramic Coating Spray';
  } else if (lower.includes('tv') || lower.includes('television')) {
    productType = 'Smart TV';
  }

  // Model name without duplicate brand
  let model = clean;
  if (detectedBrand !== 'Generic / Unbranded') {
    model = clean.replace(new RegExp(`^${detectedBrand}\\s*`, 'i'), '').trim();
  }

  const schema = getCategorySchema(`${productType} ${clean} ${nicheHint}`);

  return {
    rawInput: clean,
    brand: detectedBrand,
    model: model || clean,
    fullName: detectedBrand !== 'Generic / Unbranded' && !clean.toLowerCase().startsWith(detectedBrand.toLowerCase())
      ? `${detectedBrand} ${clean}`
      : clean,
    category: schema.category,
    productType,
    userImageUrls: userImages,
    confidence: detectedBrand !== 'Generic / Unbranded' ? 95 : 75
  };
}
