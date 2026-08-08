// Core Audit Types

export type AuditStatus = 'passed' | 'warning' | 'failed' | 'info';
export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AuditCategory = 'seo' | 'performance' | 'accessibility' | 'technical' | 'bestPractices' | 'mobile' | 'usability' | 'links';

export interface AuditCheck {
  id: string;
  category: AuditCategory;
  name: string;
  description: string;
  status: AuditStatus;
  severity: AuditSeverity;
  scoreImpact: number;
  details: string;
  recommendation: string;
  documentationUrl?: string;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  problem: string;
  impact: string;
  solution: string;
  category: AuditCategory;
  relatedChecks: string[];
}

export interface PerformanceMetrics {
  responseTime?: number;
  timeToFirstByte?: number;
  htmlSize?: number;
  pageSize?: number;
  resourceCount?: number;
  imageCount?: number;
  scriptCount?: number;
  stylesheetCount?: number;
  compressionEnabled?: boolean;
  cacheHeaders?: boolean;
}

export interface PageDetails {
  url: string;
  finalUrl: string;
  httpStatus: number;
  contentType: string;
  responseTime: number;
  pageSize: number;
  htmlSize: number;
  linkCount: number;
  imageCount: number;
  scriptCount: number;
  stylesheetCount: number;
  isHttps: boolean;
  hasRobotsTxt?: boolean;
  hasSitemap?: boolean;
  title?: string;
  metaDescription?: string;
}

export interface ScreenshotResult {
  desktop?: string;
  mobile?: string;
  desktopError?: string;
  mobileError?: string;
}

export interface AuditScores {
  overall: number;
  seo: number;          // Includes accessibility checks
  performance: number;
  technical: number;    // Includes best practices
  usability: number;    // Includes mobile checks
  links: number;
}

export interface AuditSummary {
  passed: number;
  warnings: number;
  failed: number;
  critical: number;
}

export interface AuditResult {
  id: string;
  url: string;
  createdAt: string;
  status: 'completed' | 'partial' | 'failed';
  error?: string;
  
  scores: AuditScores;
  summary: AuditSummary;
  
  checks: AuditCheck[];
  recommendations: Recommendation[];
  
  screenshots: ScreenshotResult;
  performance: PerformanceMetrics;
  pageDetails: PageDetails;
}

// Crawler Types

export interface CrawlerResult {
  html: string;
  $ : any; // cheerio instance
  url: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  responseTime: number;
  pageSize: number;
  htmlSize: number;
}

// SEO Analysis Types

export interface SEOAnalysisResult {
  title?: string;
  titleLength?: number;
  metaDescription?: string;
  metaDescriptionLength?: number;
  canonical?: string;
  robots?: string;
  h1Count: number;
  h1Text: string[];
  h2Count: number;
  h3Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasStructuredData: boolean;
  lang?: string;
  viewport?: string;
}

// Mobile Analysis Types

export interface MobileAnalysisResult {
  hasViewport: boolean;
  viewportContent?: string;
  hasHorizontalOverflow: boolean;
  isMobileFriendly: boolean;
  fontSizeReadable: boolean;
  tapTargetsAdequate: boolean;
  issues: string[];
}

// Accessibility Analysis Types

export interface AccessibilityAnalysisResult {
  imagesWithoutAlt: number;
  hasLang: boolean;
  hasViewport: boolean;
  formsMissingLabels: number;
  headingStructureValid: boolean;
  hasSkipLink: boolean;
  colorContrastIssues?: number;
  ariaIssues: string[];
}

// Technical Analysis Types

export interface TechnicalAnalysisResult {
  isHttps: boolean;
  hasCanonical: boolean;
  hasRobotsMeta: boolean;
  robotsMetaContent?: string;
  hasViewport: boolean;
  hasLang: boolean;
  hasStructuredData: boolean;
  hasOpenGraph: boolean;
  securityHeaders: Record<string, boolean>;
  hasCompression: boolean;
  redirectCount: number;
  hasSitemap?: boolean;
  hasRobotsTxt?: boolean;
}
