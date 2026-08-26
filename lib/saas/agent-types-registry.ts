export type AgentTypeKey =
  | 'SEO_TRAFFIC'
  | 'BLOG_WRITER'
  | 'PRODUCT_REVIEW'
  | 'PRODUCT_COMPARISON'
  | 'AFFILIATE_CONTENT'
  | 'SEARCH_CONSOLE'
  | 'PINTEREST'
  | 'YOUTUBE_SHORTS'
  | 'INSTAGRAM_REELS'
  | 'MEDIUM'
  | 'CUSTOM';

export interface AgentToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'RESEARCH' | 'CONTENT' | 'SEO' | 'AFFILIATE' | 'SOCIAL' | 'ANALYTICS';
}

export interface AgentTypeDefinition {
  type: AgentTypeKey;
  name: string;
  shortName: string;
  iconName: string;
  badgeColor: string;
  description: string;
  responsibilities: string[];
  defaultRole: string;
  defaultTone: string;
  defaultSystemPrompt: string;
  defaultGoals: string;
  recommendedTools: string[];
  defaultSchedule: string;
}

export const AVAILABLE_AGENT_TOOLS: AgentToolDefinition[] = [
  { id: 'KEYWORD_RESEARCH', name: 'Keyword & SERP Analyzer', description: 'Analyze high commercial intent queries, search volume, and competitor keyword gaps', category: 'RESEARCH' },
  { id: 'SEARCH_CONSOLE', name: 'Google Search Console Audit', description: 'Analyze position 5-20 striking distance keywords, impressions, CTR, and traffic decay', category: 'ANALYTICS' },
  { id: 'COMPETITOR_ANALYSIS', name: 'Competitor Content Gap Analyzer', description: 'Find content opportunities and missing topical sub-sections', category: 'RESEARCH' },
  { id: 'ARTICLE_WRITER', name: 'Deep Pillar Content Generator', description: 'Produce original, structured, high-word-count articles with headings & FAQs', category: 'CONTENT' },
  { id: 'PRODUCT_RESEARCH', name: 'Technical Spec & Spec Sheet Engine', description: 'Extract accurate manufacturer specifications without hallucinations', category: 'RESEARCH' },
  { id: 'IMAGE_VERIFIER', name: 'Product Image & Media Engine', description: 'Preserve uploaded images and verify authentic product visual references', category: 'CONTENT' },
  { id: 'SCHEMA_GENERATOR', name: 'Schema.org JSON-LD Generator', description: 'Generate Article, Product, Review, and FAQPage structured data', category: 'SEO' },
  { id: 'INTERNAL_LINKER', name: 'Contextual Internal Linking Engine', description: 'Suggest relevant topical pillar links to boost crawl depth', category: 'SEO' },
  { id: 'AFFILIATE_MAPPER', name: 'Multi-Affiliate Platform Adapter', description: 'Map products to Amazon, Flipkart, Cuelinks, vCommission, and Impact', category: 'AFFILIATE' },
  { id: 'DISCLOSURE_GUARD', name: 'FTC Compliance & Disclosure Guard', description: 'Mandate FTC affiliate notices and nofollow sponsored attributes', category: 'AFFILIATE' },
  { id: 'SOCIAL_PACKAGER', name: 'Multi-Channel Social Formatter', description: 'Format scripts for YouTube Shorts, Reels, Pinterest Pins, and Medium', category: 'SOCIAL' },
  { id: 'DUPLICATE_CHECKER', name: 'Semantic Duplicate Content Protector', description: 'Prevent repetitive topic generation across published and draft articles', category: 'CONTENT' }
];

export const AGENT_TYPES_REGISTRY: Record<AgentTypeKey, AgentTypeDefinition> = {
  SEO_TRAFFIC: {
    type: 'SEO_TRAFFIC',
    name: 'SEO & Traffic Agent',
    shortName: 'SEO & Traffic',
    iconName: 'Search',
    badgeColor: 'blue',
    description: 'Autonomous keyword discovery, search intent analysis, competitor content gaps, and internal linking strategies.',
    responsibilities: [
      'Keyword research & high commercial intent clustering',
      'Search intent & SERP difficulty evaluation',
      'Competitor content gap analysis',
      'Internal linking recommendations',
      'Search Console position 5-20 optimization'
    ],
    defaultRole: 'Autonomous SEO Strategist & Organic Traffic Optimizer',
    defaultTone: 'Data-driven, precise, analytical, and actionable',
    defaultSystemPrompt: 'You are the dedicated SEO & Traffic Agent. Your primary responsibility is finding high-buyer-intent, low-competition keyword clusters and search queries in the assigned country. Provide clear ranking opportunities and content gap blueprints.',
    defaultGoals: 'Identify 15+ actionable ranking opportunities per week and double organic search clicks.',
    recommendedTools: ['KEYWORD_RESEARCH', 'SEARCH_CONSOLE', 'COMPETITOR_ANALYSIS', 'INTERNAL_LINKER'],
    defaultSchedule: 'DAILY'
  },

  BLOG_WRITER: {
    type: 'BLOG_WRITER',
    name: 'Blog Writer Agent',
    shortName: 'Blog Writer',
    iconName: 'FileText',
    badgeColor: 'indigo',
    description: 'Generates comprehensive, research-backed, structured articles with SEO titles, meta descriptions, FAQs, verified images, and schema.',
    responsibilities: [
      'Topic & SERP intent research',
      'Comprehensive structured article generation',
      'SEO title & meta description optimization',
      'Structured FAQ schema & JSON-LD data',
      'Contextual internal linking & affiliate CTAs'
    ],
    defaultRole: 'Senior Content Producer & Editorial Writer',
    defaultTone: 'Engaging, thorough, objective, and reader-first',
    defaultSystemPrompt: 'You are the dedicated Blog Writer Agent. Generate exhaustive, research-backed articles with rich headings, verified product specifications, pros/cons, FAQs, and structured data. Never output generic paragraph dumps.',
    defaultGoals: 'Publish 3 in-depth pillar articles weekly with average quality score > 90/100.',
    recommendedTools: ['ARTICLE_WRITER', 'PRODUCT_RESEARCH', 'IMAGE_VERIFIER', 'SCHEMA_GENERATOR', 'INTERNAL_LINKER', 'AFFILIATE_MAPPER', 'DUPLICATE_CHECKER'],
    defaultSchedule: '3_PER_WEEK'
  },

  PRODUCT_REVIEW: {
    type: 'PRODUCT_REVIEW',
    name: 'Product Review Agent',
    shortName: 'Product Review',
    iconName: 'ShoppingBag',
    badgeColor: 'emerald',
    description: 'Deep-dive single product reviews with accurate specs, genuine user consensus pros/cons, verified images, and buying advice without fake testing claims.',
    responsibilities: [
      'Manufacturer specification extraction',
      'Objective pros, cons, and performance breakdown',
      'Alternative product recommendations',
      'Verified product pricing & image association',
      'Clear buying advice & FTC compliant disclosures'
    ],
    defaultRole: 'Technical Product Analyst & Hardware Reviewer',
    defaultTone: 'Analytical, honest, balanced, and consumer-focused',
    defaultSystemPrompt: 'You are the Product Review Agent. Perform rigorous product analysis based on verified specifications, consumer consensus, and technical benchmarks. Never claim personal lab testing unless verified data is provided.',
    defaultGoals: 'Deliver high-trust product reviews with 100% verified specifications and compliant affiliate links.',
    recommendedTools: ['PRODUCT_RESEARCH', 'IMAGE_VERIFIER', 'AFFILIATE_MAPPER', 'DISCLOSURE_GUARD', 'SCHEMA_GENERATOR'],
    defaultSchedule: '3_PER_WEEK'
  },

  PRODUCT_COMPARISON: {
    type: 'PRODUCT_COMPARISON',
    name: 'Product Comparison Agent',
    shortName: 'Product Comparison',
    iconName: 'Layers',
    badgeColor: 'amber',
    description: 'Side-by-side comparison showdowns (A vs B or A vs B vs C) with structured comparison tables, feature breakdowns, and verdict recommendations.',
    responsibilities: [
      'Side-by-side specification comparison tables',
      'Head-to-head feature analysis',
      'Pros & Cons breakdown per contender',
      'Target buyer suitability ("Best for X", "Who should skip")',
      'Multi-platform affiliate price comparison buttons'
    ],
    defaultRole: 'Head-to-Head Comparison Specialist',
    defaultTone: 'Objective, decisive, clear, and comparative',
    defaultSystemPrompt: 'You are the Product Comparison Agent. Compare products side-by-side with clear comparative criteria, detailed tables, clear winner selections for different buyer profiles, and multi-platform affiliate links.',
    defaultGoals: 'Produce top-ranking head-to-head comparison guides that convert commercial search intent into affiliate clicks.',
    recommendedTools: ['PRODUCT_RESEARCH', 'IMAGE_VERIFIER', 'AFFILIATE_MAPPER', 'SCHEMA_GENERATOR'],
    defaultSchedule: 'WEEKLY'
  },

  AFFILIATE_CONTENT: {
    type: 'AFFILIATE_CONTENT',
    name: 'Affiliate Content Agent',
    shortName: 'Affiliate Content',
    iconName: 'Zap',
    badgeColor: 'teal',
    description: 'High-converting buying guides, deal roundups, multi-platform price comparison boxes, and verified affiliate link integration.',
    responsibilities: [
      'High-commercial intent buying guide generation',
      'Multi-affiliate platform product mapping',
      'Deal & discount opportunity curation',
      'Dynamic affiliate CTAs & disclosure enforcement',
      'Multi-platform "Check Price on Amazon / Flipkart / Cuelinks" buttons'
    ],
    defaultRole: 'Commercial Monetization & Affiliate Strategist',
    defaultTone: 'Persuasive, helpful, value-driven, and trustworthy',
    defaultSystemPrompt: 'You are the Affiliate Content Agent. Focus on creating buying guides and curated deal roundups that connect consumers to verified multi-platform affiliate links (Amazon, Flipkart, Cuelinks, vCommission, Impact).',
    defaultGoals: 'Maximize affiliate conversion rates through verified pricing links and prominent CTA placement.',
    recommendedTools: ['AFFILIATE_MAPPER', 'DISCLOSURE_GUARD', 'PRODUCT_RESEARCH', 'ARTICLE_WRITER'],
    defaultSchedule: '3_PER_WEEK'
  },

  SEARCH_CONSOLE: {
    type: 'SEARCH_CONSOLE',
    name: 'Search Console Agent',
    shortName: 'Search Console',
    iconName: 'BarChart2',
    badgeColor: 'cyan',
    description: 'Continuous audit of Google Search Console queries, position 5-20 striking distance keywords, low CTR optimization, and content refresh blueprints.',
    responsibilities: [
      'Query CTR analysis & title hook optimization',
      'Striking distance keyword identification (Positions 5-20)',
      'Traffic decay detection & content refresh alerts',
      'Uncovered intent queries integration',
      'Actionable SEO recommendation generation'
    ],
    defaultRole: 'Google Search Console Intelligence Agent',
    defaultTone: 'Analytical, diagnostic, strategic, and metric-oriented',
    defaultSystemPrompt: 'You are the Search Console Agent. Audit Search Console performance metrics, isolate queries ranking on page 2 (striking distance), and provide step-by-step content updates to push them to Page 1.',
    defaultGoals: 'Audit GSC metrics weekly and boost CTR on top 20 pages by at least 2%.',
    recommendedTools: ['SEARCH_CONSOLE', 'KEYWORD_RESEARCH', 'INTERNAL_LINKER'],
    defaultSchedule: 'WEEKLY'
  },

  PINTEREST: {
    type: 'PINTEREST',
    name: 'Pinterest Agent',
    shortName: 'Pinterest',
    iconName: 'Share2',
    badgeColor: 'rose',
    description: 'Generates high-CTR Pin titles, descriptions, keyword hashtags, image visual concepts, and destination URLs.',
    responsibilities: [
      'High-intent Pinterest Pin titles',
      'Rich keyword-optimized Pin descriptions',
      'Image concept & text overlay recommendations',
      'Topical hashtag curation',
      'Canonical destination URL linking'
    ],
    defaultRole: 'Pinterest Visual Discovery & Traffic Agent',
    defaultTone: 'Inspiring, concise, descriptive, and click-worthy',
    defaultSystemPrompt: 'You are the Pinterest Agent. Generate compelling Pin packages from published website articles, optimizing titles and descriptions for Pinterest visual search intent.',
    defaultGoals: 'Generate optimized Pinterest packages for every published article.',
    recommendedTools: ['SOCIAL_PACKAGER', 'IMAGE_VERIFIER'],
    defaultSchedule: 'DAILY'
  },

  YOUTUBE_SHORTS: {
    type: 'YOUTUBE_SHORTS',
    name: 'YouTube Shorts Agent',
    shortName: 'YouTube Shorts',
    iconName: 'PlaySquare',
    badgeColor: 'red',
    description: 'Creates viral 30-60s vertical video scripts with hook lines, scene breakdowns, on-screen text, and pinned comment CTAs.',
    responsibilities: [
      'Pattern-interrupting hook generation',
      '30-60 second fast-paced video script',
      'Scene-by-scene visual & audio breakdown',
      'On-screen dynamic text overlays',
      'Title, description, hashtags & pinned comment CTA'
    ],
    defaultRole: 'Short-Form Video Scriptwriter & Producer',
    defaultTone: 'High-energy, punchy, engaging, and concise',
    defaultSystemPrompt: 'You are the YouTube Shorts Agent. Transform website reviews and buying guides into high-retention 30-60 second vertical video scripts with clear scene transitions and strong pinned-comment CTAs.',
    defaultGoals: 'Produce engaging short video scripts for all featured product buying guides.',
    recommendedTools: ['SOCIAL_PACKAGER'],
    defaultSchedule: 'DAILY'
  },

  INSTAGRAM_REELS: {
    type: 'INSTAGRAM_REELS',
    name: 'Instagram Reels Agent',
    shortName: 'Instagram Reels',
    iconName: 'Instagram',
    badgeColor: 'pink',
    description: 'Generates Instagram Reels scripts, visual scene plans, engaging captions, trending niche hashtags, and link-in-bio CTAs.',
    responsibilities: [
      'Catchy visual hook',
      'Multi-scene plan & audio cues',
      'High-engagement caption with line breaks',
      'Relevant niche & shopping hashtags',
      'Link in Bio CTA directives'
    ],
    defaultRole: 'Instagram Growth & Reel Content Creator',
    defaultTone: 'Trendy, engaging, visual, and community-focused',
    defaultSystemPrompt: 'You are the Instagram Reels Agent. Create eye-catching Reels concepts, captions, and scripts driving followers to the link-in-bio website guides.',
    defaultGoals: 'Generate social engagement and direct referral traffic to connected website reviews.',
    recommendedTools: ['SOCIAL_PACKAGER'],
    defaultSchedule: 'DAILY'
  },

  MEDIUM: {
    type: 'MEDIUM',
    name: 'Medium Agent',
    shortName: 'Medium',
    iconName: 'BookOpen',
    badgeColor: 'purple',
    description: 'Generates original supporting authority articles on Medium that reference the primary website without duplicate content penalties.',
    responsibilities: [
      'Original supporting thought-leadership companion articles',
      'Unique perspectives that do NOT copy the main article verbatim',
      'Contextual authority backlinks to primary website',
      'Medium topic tag suggestions',
      'Canonical publication attribution'
    ],
    defaultRole: 'Syndication & Authority Medium Contributor',
    defaultTone: 'Thoughtful, editorial, insightful, and authoritative',
    defaultSystemPrompt: 'You are the Medium Agent. Write original companion articles discussing consumer decision frameworks and industry trends, linking back to the primary website for full technical spec charts.',
    defaultGoals: 'Build off-site topical authority and high-relevance referral traffic.',
    recommendedTools: ['SOCIAL_PACKAGER', 'ARTICLE_WRITER'],
    defaultSchedule: 'WEEKLY'
  },

  CUSTOM: {
    type: 'CUSTOM',
    name: 'Custom Agent',
    shortName: 'Custom Agent',
    iconName: 'Sliders',
    badgeColor: 'neutral',
    description: 'Completely customizable agent tailored to your exact instructions, goals, output formats, tools, and schedule.',
    responsibilities: [
      'Custom instruction execution',
      'Tailored output formatting',
      'Configurable tool selection',
      'Custom schedule and automation',
      'Dedicated website & affiliate settings'
    ],
    defaultRole: 'Specialized Autonomous Growth Agent',
    defaultTone: 'Tailored to custom instructions',
    defaultSystemPrompt: 'You are a specialized Custom AI Growth Agent. Follow the exact custom instructions, goals, and output guidelines specified by the user.',
    defaultGoals: 'Fulfill user-defined custom automation tasks reliably.',
    recommendedTools: ['KEYWORD_RESEARCH', 'ARTICLE_WRITER', 'PRODUCT_RESEARCH', 'AFFILIATE_MAPPER'],
    defaultSchedule: 'WEEKLY'
  }
};
