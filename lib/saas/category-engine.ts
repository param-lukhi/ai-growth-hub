/**
 * Category-Aware Content & Product Specification Engine
 * Enforces dynamic specification schemas, strict category recommendation filtering,
 * image verification, and honest editorial phrasing.
 */

export interface CategorySpecField {
  name: string;
  unit?: string;
  description: string;
  importance: 'CRITICAL' | 'IMPORTANT' | 'OPTIONAL';
}

export interface CategoryEvaluationSchema {
  category: string;
  aliases: string[];
  specs: CategorySpecField[];
  evaluationCriteria: string[];
  irrelevantCriteria: string[]; // Criteria that MUST NOT be used for this category
  defaultPros: string[];
  defaultCons: string[];
}

export const CATEGORY_SCHEMAS: Record<string, CategoryEvaluationSchema> = {
  Earbuds: {
    category: 'Earbuds & Audio',
    aliases: ['earbuds', 'tws', 'headphones', 'earphones', 'neckband', 'audio', 'soundbar', 'speakers'],
    specs: [
      { name: 'Driver Size', unit: 'mm', description: 'Dynamic driver diameter for bass & clarity', importance: 'CRITICAL' },
      { name: 'Active Noise Cancellation (ANC)', unit: 'dB', description: 'Noise cancellation depth', importance: 'CRITICAL' },
      { name: 'Transparency Mode', description: 'Ambient sound pass-through capability', importance: 'IMPORTANT' },
      { name: 'Battery Life (Earbuds + Case)', unit: 'hours', description: 'Total playback duration', importance: 'CRITICAL' },
      { name: 'Bluetooth Version', description: 'Bluetooth connection protocol standard', importance: 'IMPORTANT' },
      { name: 'Audio Codecs', description: 'Supported audio codecs (AAC, SBC, LDAC, aptX)', importance: 'IMPORTANT' },
      { name: 'Microphone & Calling', description: 'Mic count and AI environmental noise reduction', importance: 'IMPORTANT' },
      { name: 'Latency', unit: 'ms', description: 'Audio-video delay for gaming & media', importance: 'IMPORTANT' },
      { name: 'Water Resistance (IP Rating)', description: 'Ingress protection against sweat and rain', importance: 'IMPORTANT' },
      { name: 'Comfort & Weight', unit: 'g', description: 'Ergonomic in-ear fit and per-bud weight', importance: 'IMPORTANT' },
      { name: 'App Support & EQ', description: 'Companion mobile app customization', importance: 'OPTIONAL' }
    ],
    evaluationCriteria: ['Sound Quality', 'Bass Depth', 'Active Noise Cancellation', 'Battery Endurance', 'Call Quality', 'Fit & Comfort', 'Build Quality', 'Value for Money'],
    irrelevantCriteria: ['Camera Score', 'Display Score', 'GPU Score', 'RAM', 'Operating System', 'Screen Resolution'],
    defaultPros: ['Rich dynamic bass output', 'Reliable Bluetooth connectivity', 'Comfortable lightweight ergonomic design', 'Long battery life with fast charging'],
    defaultCons: ['App customization limited on iOS', 'ANC slightly less effective in heavy winds']
  },

  Smartphones: {
    category: 'Smartphones',
    aliases: ['smartphone', 'smartphones', 'phone', 'mobiles', 'mobile', 'cellphone', 'android', 'iphone'],
    specs: [
      { name: 'Display', unit: 'inch/Hz', description: 'Panel type, size, resolution, and refresh rate', importance: 'CRITICAL' },
      { name: 'Processor', description: 'SoC chipset, clock speed, and node architecture', importance: 'CRITICAL' },
      { name: 'RAM', unit: 'GB', description: 'System memory type and capacity', importance: 'CRITICAL' },
      { name: 'Storage', unit: 'GB/TB', description: 'Internal UFS / NVMe storage capacity', importance: 'CRITICAL' },
      { name: 'Rear Camera', unit: 'MP', description: 'Primary, ultra-wide, and telephoto sensor setup', importance: 'CRITICAL' },
      { name: 'Front Camera', unit: 'MP', description: 'Selfie camera sensor and video capabilities', importance: 'IMPORTANT' },
      { name: 'Battery', unit: 'mAh', description: 'Battery capacity and endurance', importance: 'CRITICAL' },
      { name: 'Charging', unit: 'W', description: 'Wired fast charging and wireless charging support', importance: 'IMPORTANT' },
      { name: 'Operating System', description: 'OS version, skin, and promised update policy', importance: 'IMPORTANT' },
      { name: 'Connectivity', description: '5G bands, Wi-Fi 6/7, Bluetooth, NFC', importance: 'IMPORTANT' },
      { name: 'Dimensions & Weight', unit: 'g', description: 'Form factor, thickness, and hand-feel', importance: 'OPTIONAL' }
    ],
    evaluationCriteria: ['Display & Brightness', 'Processing & Gaming', 'Camera Performance', 'Battery Life & Charging', 'Software Experience', 'Build Quality & Ergonomics', 'Value for Money'],
    irrelevantCriteria: ['Driver Size', 'ANC Depth', 'Brake Horsepower', 'Engine Displacement', 'Tyre Size'],
    defaultPros: ['Vibrant high refresh rate display', 'Snappy day-to-day multitasking performance', 'Versatile multi-lens camera setup', 'All-day battery longevity'],
    defaultCons: ['Charger may not be included in box', 'Pre-installed bloatware requires cleanup']
  },

  Laptops: {
    category: 'Laptops & Computers',
    aliases: ['laptop', 'laptops', 'notebook', 'ultrabook', 'pc', 'macbook', 'desktop', 'computer'],
    specs: [
      { name: 'CPU (Processor)', description: 'Processor model, core/thread count, base/boost frequency', importance: 'CRITICAL' },
      { name: 'GPU (Graphics)', description: 'Integrated or dedicated graphics card with VRAM', importance: 'CRITICAL' },
      { name: 'RAM', unit: 'GB', description: 'Memory speed, channel, and upgradeability', importance: 'CRITICAL' },
      { name: 'Storage', unit: 'GB/TB', description: 'PCIe Gen4 NVMe SSD capacity and speed', importance: 'CRITICAL' },
      { name: 'Display', unit: 'inch/Hz', description: 'Resolution, panel type, color gamut (sRGB/DCI-P3), brightness', importance: 'CRITICAL' },
      { name: 'Battery & Charger', unit: 'Wh', description: 'Battery capacity and estimated real-world hours', importance: 'IMPORTANT' },
      { name: 'Ports & Connectivity', description: 'Thunderbolt/USB-C, HDMI, USB-A, SD slot, Wi-Fi 6E', importance: 'IMPORTANT' },
      { name: 'Keyboard & Trackpad', description: 'Key travel, backlighting, and trackpad surface', importance: 'IMPORTANT' },
      { name: 'Weight & Dimensions', unit: 'kg', description: 'Chassis material, thickness, and portability', importance: 'IMPORTANT' },
      { name: 'Operating System', description: 'Windows 11 / macOS / Linux', importance: 'IMPORTANT' }
    ],
    evaluationCriteria: ['CPU Performance', 'GPU & Gaming Capability', 'Display Quality & Color Accuracy', 'Battery Life', 'Keyboard & Ergonomics', 'Thermal Management', 'Port Selection & Build'],
    irrelevantCriteria: ['Rear Camera', 'Selfie Camera MP', 'Engine Torque', 'Water Resistance IP68'],
    defaultPros: ['Excellent processing throughput for multitasking', 'Crisp high-resolution anti-glare display', 'Sturdy premium chassis construction', 'Fast NVMe SSD boot times'],
    defaultCons: ['Fan noise audible under maximum sustained load', 'Upgradeability may be limited with soldered RAM']
  },

  Automotive: {
    category: 'Automotive & Car Accessories',
    aliases: ['automotive', 'car', 'cars', 'vehicle', 'auto', 'dash cam', 'tyre inflator', 'ceramic coating', 'car vacuum', 'garage'],
    specs: [
      { name: 'Product Type & Compatibility', description: 'Universal fitment, vehicle type (Sedan, SUV, Hatchback)', importance: 'CRITICAL' },
      { name: 'Power Source / Voltage', unit: 'V/mAh', description: '12V cigarette lighter, USB, or rechargeable lithium battery', importance: 'CRITICAL' },
      { name: 'Build Quality & Materials', description: 'Heat-resistant ABS, aluminum housing, ruggedized casing', importance: 'IMPORTANT' },
      { name: 'Operating Specifications', description: 'PSI pressure rating, 4K camera resolution, or suction wattage', importance: 'CRITICAL' },
      { name: 'Ease of Installation', description: 'Plug-and-play, DIY mounting, or professional setup required', importance: 'IMPORTANT' },
      { name: 'Safety Features & Protections', description: 'Auto cut-off, thermal overheat protection, surge fuse', importance: 'CRITICAL' },
      { name: 'Durability & Weather Resistance', description: 'Operating temperature range (-10°C to 65°C), waterproof rating', importance: 'IMPORTANT' },
      { name: 'Warranty & Support', description: 'Manufacturer warranty coverage duration', importance: 'IMPORTANT' }
    ],
    evaluationCriteria: ['Performance & Accuracy', 'Build Durability & Heat Resistance', 'Ease of Installation & Use', 'Safety Protection Features', 'Portability & Storage', 'Value for Money'],
    irrelevantCriteria: ['Camera Selfies', 'RAM', 'Display Refresh Rate', 'ANC Noise Cancellation'],
    defaultPros: ['Robust high-temperature tolerant construction', 'Straightforward plug-and-play operation', 'Essential roadside emergency reliability', 'Compact glove-box friendly footprint'],
    defaultCons: ['Power cable length could be longer for full-size SUVs', 'Instruction booklet could be more detailed']
  },

  TVs: {
    category: 'Smart TVs & Home Entertainment',
    aliases: ['tv', 'tvs', 'television', 'smart tv', 'oled', 'qled', 'led tv', 'home theater'],
    specs: [
      { name: 'Display Technology', description: 'OLED, QLED, Mini-LED, or LED LCD panel', importance: 'CRITICAL' },
      { name: 'Screen Size & Resolution', unit: 'inch/4K', description: 'Diagonal size and pixel resolution (4K UHD / 8K)', importance: 'CRITICAL' },
      { name: 'Refresh Rate & Motion', unit: 'Hz', description: 'Native refresh rate (60Hz / 120Hz / 144Hz VRR)', importance: 'CRITICAL' },
      { name: 'HDR Formats Support', description: 'Dolby Vision, HDR10+, HDR10, HLG', importance: 'IMPORTANT' },
      { name: 'Sound System & Output', unit: 'W', description: 'Speaker wattage, Dolby Atmos, eARC support', importance: 'IMPORTANT' },
      { name: 'Smart TV Operating System', description: 'Google TV, webOS, Tizen, Fire TV OS', importance: 'IMPORTANT' },
      { name: 'Connectivity & HDMI Ports', description: 'HDMI 2.1 ports, USB, Optical, Ethernet, Wi-Fi 5/6', importance: 'IMPORTANT' },
      { name: 'Gaming Features', description: 'ALLM, VRR, FreeSync, input lag under 10ms', importance: 'OPTIONAL' }
    ],
    evaluationCriteria: ['Picture Quality & Contrast', 'HDR Brightness & Color Vibrancy', 'Sound Output & Clarity', 'Smart Platform & App Speed', 'Gaming Capabilities & Refresh Rate', 'Value for Money'],
    irrelevantCriteria: ['Driver Size', 'ANC', 'Processor Clock Speed', 'Battery Capacity'],
    defaultPros: ['Stunning contrast and deep black levels', 'Vibrant HDR color reproduction', 'Smooth user-friendly Smart TV interface', 'Comprehensive streaming app ecosystem'],
    defaultCons: ['Integrated speakers benefit from an external soundbar', 'Stand legs require wide TV console furniture']
  }
};

/**
 * Identify matching category schema by keyword, topic, or niche string
 */
export function getCategorySchema(input: string): CategoryEvaluationSchema {
  const clean = input.toLowerCase();

  for (const [key, schema] of Object.entries(CATEGORY_SCHEMAS)) {
    if (clean.includes(key.toLowerCase())) {
      return schema;
    }
    for (const alias of schema.aliases) {
      if (clean.includes(alias)) {
        return schema;
      }
    }
  }

  // Default fallback to Technology general
  return CATEGORY_SCHEMAS.Smartphones;
}

/**
 * Category-Correct Recommendation Filter
 * Ensures that if an article is about Wireless Earbuds, it strictly recommends audio products
 * and NEVER recommends laptops, smartphones, or automotive items.
 */
export function filterCategoryRecommendations<T extends { category?: string; name?: string; title?: string }>(
  items: T[],
  targetCategoryOrNiche: string
): T[] {
  const schema = getCategorySchema(targetCategoryOrNiche);
  const validKeywords = [schema.category.toLowerCase(), ...schema.aliases.map(a => a.toLowerCase())];

  return items.filter(item => {
    const textToCheck = `${item.category || ''} ${item.name || ''} ${item.title || ''}`.toLowerCase();
    
    // Must match at least one valid keyword for this category
    const matchesTargetCategory = validKeywords.some(kw => textToCheck.includes(kw));
    
    // Must NOT match explicit irrelevant criteria or contradictory categories
    if (schema.category.includes('Audio') || schema.category.includes('Earbuds')) {
      if (textToCheck.includes('laptop') || textToCheck.includes('smartphone') || textToCheck.includes('car vacuum') || textToCheck.includes('tyre inflator')) {
        return false;
      }
    } else if (schema.category.includes('Automotive')) {
      if (textToCheck.includes('laptop') || textToCheck.includes('smartphone') || textToCheck.includes('oled tv') || textToCheck.includes('earbuds')) {
        return false;
      }
    } else if (schema.category.includes('Laptops')) {
      if (textToCheck.includes('earbuds') || textToCheck.includes('car cushion') || textToCheck.includes('tyre inflator')) {
        return false;
      }
    }

    return matchesTargetCategory;
  });
}

/**
 * Image Verification Guard
 * Checks whether an image URL is a verified product asset.
 * If not verified, flags image verification requirement instead of inventing fake pictures.
 */
export function verifyProductImage(
  productName: string,
  imageUrl?: string | null
): { isVerified: boolean; finalImageUrl: string; statusBadge: string } {
  if (!imageUrl || imageUrl.trim() === '' || imageUrl.includes('placeholder') || imageUrl.includes('default-product')) {
    return {
      isVerified: false,
      finalImageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      statusBadge: 'IMAGE VERIFICATION REQUIRED'
    };
  }

  // Check if image domain is trusted Amazon CDN or validated media CDN
  const isTrustedHost = imageUrl.includes('media-amazon.com') ||
    imageUrl.includes('m.media-amazon.com') ||
    imageUrl.includes('images-na.ssl-images-amazon.com') ||
    imageUrl.includes('blogweb904.vercel.app') ||
    imageUrl.startsWith('/uploads/');

  if (isTrustedHost) {
    return {
      isVerified: true,
      finalImageUrl: imageUrl,
      statusBadge: 'VERIFIED PRODUCT IMAGE'
    };
  }

  return {
    isVerified: false,
    finalImageUrl: imageUrl,
    statusBadge: 'IMAGE VERIFICATION REQUIRED'
  };
}

/**
 * Truthful Editorial Disclaimer & Testing Statement Generator
 * Generates transparent editorial statements without inventing fake lab testing claims.
 */
export function generateTruthfulEditorialStatement(
  brandName: string,
  category: string,
  hasFirstHandLabData: boolean = false
): string {
  if (hasFirstHandLabData) {
    return `${brandName} evaluated and hands-on tested these ${category} products through structured real-world usage and performance benchmarks.`;
  }

  return `${brandName} researched, analyzed, and compared these ${category} products using verified technical specifications, manufacturer data sheets, verified customer consensus, and relevant official sources.`;
}
