export type ApprovalMode = 'MANUAL' | 'SEMI_AUTOMATIC' | 'AUTOMATIC';
export type PublishingFrequency = 'DAILY' | '3_PER_WEEK' | 'WEEKLY' | 'CUSTOM';
export type CmsType = 'NATIVE' | 'WORDPRESS' | 'WEBHOOK' | 'CUSTOM';
export type ArticleStatus = 'IDEA' | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED' | 'REJECTED';
export type SocialPlatform = 'PINTEREST' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REELS' | 'MEDIUM';

export interface WebsiteData {
  id: string;
  name: string;
  slug: string;
  domainUrl: string;
  niche: string;
  subNiche?: string | null;
  targetCountry: string;
  targetLanguage: string;
  targetAudience?: string | null;
  brandVoice?: string | null;
  contentStyle?: string | null;
  primaryTopics?: string[] | string | null;
  topicsToAvoid?: string[] | string | null;
  monetization?: string[] | string | null;
  publishingFrequency: PublishingFrequency;
  approvalMode: ApprovalMode;
  cmsType: CmsType;
  cmsConfig?: any;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  articlesCount: number;
  trafficCount: number;
  affiliateClicks: number;
  lastAgentRun?: Date | string | null;
  agent?: WebsiteAgentData | null;
  ownerId?: string | null;
  _count?: {
    articles?: number;
    topics?: number;
    activityLogs?: number;
  } | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface WebsiteAgentData {
  id: string;
  websiteId: string;
  agentName: string;
  role: string;
  tone: string;
  systemPrompt?: string | null;
  memoryState?: {
    brandVoice?: string;
    coveredTopics?: string[];
    reviewedProducts?: string[];
    affiliateRules?: string[];
    contentExclusions?: string[];
    targetAudience?: string;
    successfulTopics?: string[];
  } | string | null;
  customRules?: any;
  active: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TopicScoreBreakdown {
  searchOpportunity: number; // 0-25
  relevance: number; // 0-20
  buyerIntent: number; // 0-20
  affiliatePotential: number; // 0-15
  contentGap: number; // 0-10
  trendPotential: number; // 0-10
  total: number; // 0-100
}

export interface TopicOpportunityData {
  id: string;
  websiteId: string;
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'Informational' | 'Commercial Investigation' | 'Transactional' | 'Navigational';
  buyerIntent: 'High' | 'Medium' | 'Low';
  competitionEstimate: 'Low' | 'Medium' | 'High';
  contentOpportunity?: string;
  affiliatePotential: 'High' | 'Medium' | 'Low';
  suggestedArticleType: 'Review' | 'Buying Guide' | 'Comparison' | 'How-To' | 'Round-up';
  suggestedTitle: string;
  priorityScore: number; // 0-100
  scoreBreakdown?: TopicScoreBreakdown;
  status: 'DISCOVERED' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_DRAFT';
  createdAt?: Date | string;
}

export interface QualityValidationFlag {
  type: 'ERROR' | 'WARNING' | 'INFO';
  category: 'FACT_CHECK' | 'AFFILIATE_DISCLOSURE' | 'SEO_METADATA' | 'INTERNAL_LINKS' | 'READABILITY' | 'SCHEMA';
  message: string;
  suggestion?: string;
}

export interface QualityScoreData {
  overallScore: number; // 0-100
  seoScore: number;
  contentScore: number;
  affiliateScore: number;
  readabilityScore: number;
  originalityCheck: number;
  technicalScore: number;
  validationFlags: QualityValidationFlag[];
}

export interface AffiliateProductItem {
  name: string;
  url: string;
  affiliateUrl: string;
  merchant: string;
  price?: string;
  category?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
  cta: string;
}

export interface ContentArticleData {
  id: string;
  websiteId: string;
  topicId?: string | null;
  title: string;
  slug: string;
  category: string;
  tags: string[] | string;
  author: string;
  featuredImage?: string | null;
  introduction?: string | null;
  content: string;
  tables?: any[];
  pros?: string[];
  cons?: string[];
  faqs?: { question: string; answer: string }[];
  conclusion?: string | null;
  affiliateProducts?: AffiliateProductItem[];
  affiliateDisclosure?: string | null;
  internalLinks?: { suggestedLink: string; anchorText: string; targetArticle: string; reason: string }[];
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  schemaJson?: string | null;
  qualityScore: number;
  qualityBreakdown?: QualityScoreData;
  status: ArticleStatus;
  scheduledFor?: Date | string | null;
  publishedAt?: Date | string | null;
  publishedUrl?: string | null;
  externalCmsId?: string | null;
  views?: number;
  affiliateClicks?: number;
  versions?: ArticleVersionData[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ArticleVersionData {
  id: string;
  articleId: string;
  versionNumber: number;
  title: string;
  content: string;
  metaDescription?: string | null;
  changeSummary?: string | null;
  createdAt: Date | string;
}

export interface SEOpportunityData {
  id: string;
  websiteId: string;
  opportunityType: 'OPPORTUNITY_A' | 'OPPORTUNITY_B' | 'OPPORTUNITY_C' | 'OPPORTUNITY_D';
  title: string;
  targetUrl?: string | null;
  query?: string | null;
  metricSummary?: string | null;
  recommendation: string;
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
  createdAt?: Date | string;
}

export interface SearchConsoleMetricData {
  id: string;
  websiteId: string;
  query?: string | null;
  page?: string | null;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  country?: string | null;
  device?: string | null;
  date: Date | string;
}

export interface SocialPackageData {
  id: string;
  websiteId: string;
  articleId?: string | null;
  platform: SocialPlatform;
  title: string;
  bodyContent: string;
  mediaUrl?: string | null;
  tags?: string[] | string | null;
  hook?: string | null;
  cta?: string | null;
  sceneList?: { sceneNumber: number; visual: string; audio: string; onScreenText: string }[] | string | null;
  status: 'DRAFT' | 'READY' | 'PUBLISHED' | 'FAILED';
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
}

export interface AutomationScheduleData {
  id: string;
  websiteId: string;
  ruleName: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_PUBLISH';
  actionPayload?: any;
  isEnabled: boolean;
  lastRunAt?: Date | string | null;
  lastRunStatus?: string | null;
  nextRunAt?: Date | string | null;
}

export interface IntegrationCredentialData {
  id: string;
  websiteId: string;
  provider: string;
  displayName: string;
  status: 'CONNECTED' | 'REQUIRES_CONNECTION' | 'EXPIRED' | 'ERROR';
  credentialsJson?: any;
  configJson?: any;
  errorMessage?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AgentActivityLogData {
  id: string;
  websiteId: string;
  agentName: string;
  actionType: string;
  message: string;
  details?: any;
  status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'PENDING';
  createdAt: Date | string;
}
