import { CheerioAPI } from 'cheerio';
import { TechnicalAnalysisResult, AuditCheck } from '@/types/audit';

/**
 * Analyze technical SEO factors
 */
export function analyzeTechnical(
  $: CheerioAPI,
  url: string,
  status: number,
  headers: Record<string, string>,
  hasRobotsTxt?: boolean,
  hasSitemap?: boolean
): TechnicalAnalysisResult {
  // HTTPS
  const isHttps = url.startsWith('https://');

  // Canonical
  const hasCanonical = $('link[rel="canonical"]').length > 0;

  // Robots meta
  const robotsMeta = $('meta[name="robots"]');
  const hasRobotsMeta = robotsMeta.length > 0;
  const robotsMetaContent = robotsMeta.attr('content');

  // Viewport
  const hasViewport = $('meta[name="viewport"]').length > 0;

  // Language
  const hasLang = Boolean($('html').attr('lang'));

  // Structured data
  const hasStructuredData = 
    $('script[type="application/ld+json"]').length > 0 ||
    $('[itemscope]').length > 0;

  // Open Graph
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;

  // Security headers
  const securityHeaders = {
    'strict-transport-security': Boolean(headers['strict-transport-security']),
    'x-content-type-options': Boolean(headers['x-content-type-options']),
    'x-frame-options': Boolean(headers['x-frame-options']),
    'x-xss-protection': Boolean(headers['x-xss-protection']),
    'content-security-policy': Boolean(headers['content-security-policy']),
  };

  // Compression
  const hasCompression = 
    headers['content-encoding']?.includes('gzip') ||
    headers['content-encoding']?.includes('br') ||
    headers['content-encoding']?.includes('deflate') ||
    false;

  return {
    isHttps,
    hasCanonical,
    hasRobotsMeta,
    robotsMetaContent,
    hasViewport,
    hasLang,
    hasStructuredData,
    hasOpenGraph,
    securityHeaders,
    hasCompression,
    redirectCount: 0, // Would need to track redirects during crawling
    hasSitemap,
    hasRobotsTxt,
  };
}

/**
 * Generate technical SEO audit checks
 */
export function generateTechnicalChecks(techData: TechnicalAnalysisResult, status: number): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // HTTPS check
  if (!techData.isHttps) {
    checks.push({
      id: 'tech-https',
      category: 'technical',
      name: 'HTTPS',
      description: 'Website not using HTTPS',
      status: 'failed',
      severity: 'critical',
      scoreImpact: 30,
      details: 'The website is not served over HTTPS.',
      recommendation: 'Implement HTTPS to secure data transmission and improve SEO.',
    });
  } else {
    checks.push({
      id: 'tech-https',
      category: 'technical',
      name: 'HTTPS',
      description: 'Website using HTTPS',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Website is served over HTTPS.',
      recommendation: '',
    });
  }

  // HTTP status check
  if (status === 404) {
    checks.push({
      id: 'tech-status',
      category: 'technical',
      name: 'HTTP Status',
      description: 'Page returns 404',
      status: 'failed',
      severity: 'critical',
      scoreImpact: 30,
      details: 'The page returns a 404 Not Found status.',
      recommendation: 'Ensure the page exists and returns a 200 status code.',
    });
  } else if (status >= 500) {
    checks.push({
      id: 'tech-status',
      category: 'technical',
      name: 'HTTP Status',
      description: 'Server error',
      status: 'failed',
      severity: 'critical',
      scoreImpact: 30,
      details: `The page returns a ${status} server error.`,
      recommendation: 'Fix server errors to ensure the page loads correctly.',
    });
  } else if (status >= 300 && status < 400) {
    checks.push({
      id: 'tech-status',
      category: 'technical',
      name: 'HTTP Status',
      description: 'Page redirects',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 5,
      details: `The page returns a ${status} redirect.`,
      recommendation: 'Direct links are better than redirects for SEO.',
    });
  } else if (status === 200) {
    checks.push({
      id: 'tech-status',
      category: 'technical',
      name: 'HTTP Status',
      description: 'Page returns 200 OK',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Page returns successful status code.',
      recommendation: '',
    });
  }

  // Canonical check
  if (!techData.hasCanonical) {
    checks.push({
      id: 'tech-canonical',
      category: 'technical',
      name: 'Canonical URL',
      description: 'Canonical URL missing',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 6,
      details: 'No canonical URL specified.',
      recommendation: 'Add a canonical URL to prevent duplicate content issues.',
    });
  } else {
    checks.push({
      id: 'tech-canonical',
      category: 'technical',
      name: 'Canonical URL',
      description: 'Canonical URL present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Canonical URL is specified.',
      recommendation: '',
    });
  }

  // Robots meta check
  if (techData.hasRobotsMeta) {
    const content = techData.robotsMetaContent?.toLowerCase() || '';
    if (content.includes('noindex')) {
      checks.push({
        id: 'tech-robots-meta',
        category: 'technical',
        name: 'Robots Meta',
        description: 'Page set to noindex',
        status: 'warning',
        severity: 'high',
        scoreImpact: 15,
        details: 'The page has noindex directive.',
        recommendation: 'Remove noindex if you want this page to appear in search results.',
      });
    } else {
      checks.push({
        id: 'tech-robots-meta',
        category: 'technical',
        name: 'Robots Meta',
        description: 'Robots meta tag configured',
        status: 'passed',
        severity: 'low',
        scoreImpact: 0,
        details: 'Robots meta tag allows indexing.',
        recommendation: '',
      });
    }
  }

  // Viewport check
  if (!techData.hasViewport) {
    checks.push({
      id: 'tech-viewport',
      category: 'technical',
      name: 'Viewport',
      description: 'Viewport meta tag missing',
      status: 'failed',
      severity: 'high',
      scoreImpact: 8,
      details: 'No viewport meta tag found.',
      recommendation: 'Add viewport meta tag for mobile responsiveness.',
    });
  } else {
    checks.push({
      id: 'tech-viewport',
      category: 'technical',
      name: 'Viewport',
      description: 'Viewport configured',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Viewport meta tag is configured.',
      recommendation: '',
    });
  }

  // Language check
  if (!techData.hasLang) {
    checks.push({
      id: 'tech-lang',
      category: 'technical',
      name: 'Language',
      description: 'HTML language not set',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 5,
      details: 'HTML lang attribute is missing.',
      recommendation: 'Add lang attribute to html element.',
    });
  } else {
    checks.push({
      id: 'tech-lang',
      category: 'technical',
      name: 'Language',
      description: 'HTML language set',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'HTML language is specified.',
      recommendation: '',
    });
  }

  // Robots.txt check
  if (techData.hasRobotsTxt === false) {
    checks.push({
      id: 'tech-robots-txt',
      category: 'technical',
      name: 'Robots.txt',
      description: 'Robots.txt not found',
      status: 'info',
      severity: 'low',
      scoreImpact: 2,
      details: 'No robots.txt file detected.',
      recommendation: 'Consider adding a robots.txt file.',
    });
  } else if (techData.hasRobotsTxt) {
    checks.push({
      id: 'tech-robots-txt',
      category: 'technical',
      name: 'Robots.txt',
      description: 'Robots.txt present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Robots.txt file exists.',
      recommendation: '',
    });
  }

  // Sitemap check
  if (techData.hasSitemap === false) {
    checks.push({
      id: 'tech-sitemap',
      category: 'technical',
      name: 'Sitemap',
      description: 'Sitemap not found',
      status: 'info',
      severity: 'low',
      scoreImpact: 3,
      details: 'No sitemap.xml file detected at /sitemap.xml.',
      recommendation: 'Add an XML sitemap to help search engines discover your content.',
    });
  } else if (techData.hasSitemap) {
    checks.push({
      id: 'tech-sitemap',
      category: 'technical',
      name: 'Sitemap',
      description: 'Sitemap present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Sitemap.xml file exists.',
      recommendation: '',
    });
  }

  // Security headers
  const missingSecurityHeaders = Object.entries(techData.securityHeaders)
    .filter(([_, present]) => !present)
    .map(([name]) => name);

  if (missingSecurityHeaders.length > 0) {
    checks.push({
      id: 'tech-security-headers',
      category: 'technical',
      name: 'Security Headers',
      description: 'Security headers missing',
      status: 'warning',
      severity: 'medium',
      scoreImpact: Math.min(missingSecurityHeaders.length * 2, 8),
      details: `Missing: ${missingSecurityHeaders.join(', ')}`,
      recommendation: 'Add security headers to protect against common vulnerabilities.',
    });
  } else {
    checks.push({
      id: 'tech-security-headers',
      category: 'technical',
      name: 'Security Headers',
      description: 'Security headers configured',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Security headers are configured.',
      recommendation: '',
    });
  }

  return checks;
}
