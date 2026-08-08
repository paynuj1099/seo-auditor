import type { CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { SEOAnalysisResult, AuditCheck } from '@/types/audit';

/**
 * Analyze SEO factors of a webpage
 */
export function analyzeSEO($: CheerioAPI, url: string): SEOAnalysisResult {
  // Title
  const title = $('title').first().text().trim();
  const titleLength = title.length;

  // Meta description
  const metaDescription = $('meta[name="description"]').attr('content')?.trim();
  const metaDescriptionLength = metaDescription?.length || 0;

  // Canonical
  const canonical = $('link[rel="canonical"]').attr('href');

  // Robots meta
  const robots = $('meta[name="robots"]').attr('content');

  // Headings
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  const h1Text = h1Elements.map((_: number, el: Element) => $(el).text().trim()).get();
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  // Images
  const images = $('img');
  const imageCount = images.length;
  let imagesWithoutAlt = 0;
  images.each((_: number, el: Element) => {
    const alt = $(el).attr('alt');
    if (!alt || alt.trim() === '') {
      imagesWithoutAlt++;
    }
  });

  // Links
  const allLinks = $('a[href]');
  let internalLinks = 0;
  let externalLinks = 0;
  let brokenLinks = 0;

  allLinks.each((_: number, el: Element) => {
    const href = $(el).attr('href');
    if (!href) return;

    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const linkUrl = new URL(href, url);
      const pageUrl = new URL(url);

      if (linkUrl.hostname === pageUrl.hostname) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      brokenLinks++;
    }
  });

  // Open Graph
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;

  // Twitter Card
  const hasTwitterCard = $('meta[name^="twitter:"]').length > 0;

  // Structured Data
  const hasStructuredData = 
    $('script[type="application/ld+json"]').length > 0 ||
    $('[itemscope]').length > 0;

  // Language
  const lang = $('html').attr('lang');

  // Viewport
  const viewport = $('meta[name="viewport"]').attr('content');

  return {
    title,
    titleLength,
    metaDescription,
    metaDescriptionLength,
    canonical,
    robots,
    h1Count,
    h1Text,
    h2Count,
    h3Count,
    imageCount,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    brokenLinks,
    hasOpenGraph,
    hasTwitterCard,
    hasStructuredData,
    lang,
    viewport,
  };
}

/**
 * Generate SEO audit checks
 */
export function generateSEOChecks(seoData: SEOAnalysisResult): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // Title check
  if (!seoData.title) {
    checks.push({
      id: 'seo-title-missing',
      category: 'seo',
      name: 'Title Tag',
      description: 'Page title is missing',
      status: 'failed',
      severity: 'critical',
      scoreImpact: 25,
      details: 'The page does not have a title tag.',
      recommendation: 'Add a unique, descriptive title tag (50-60 characters recommended).',
    });
  } else if ((seoData.titleLength ?? 0) < 30) {
    checks.push({
      id: 'seo-title-short',
      category: 'seo',
      name: 'Title Tag',
      description: 'Page title is too short',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 8,
      details: `Title is only ${seoData.titleLength} characters.`,
      recommendation: 'Use a more descriptive title (50-60 characters recommended).',
    });
  } else if ((seoData.titleLength ?? 0) > 60) {
    checks.push({
      id: 'seo-title-long',
      category: 'seo',
      name: 'Title Tag',
      description: 'Page title may be too long',
      status: 'warning',
      severity: 'low',
      scoreImpact: 2,
      details: `Title is ${seoData.titleLength} characters. It may be truncated in search results.`,
      recommendation: 'Consider shortening to 50-60 characters.',
    });
  } else {
    checks.push({
      id: 'seo-title',
      category: 'seo',
      name: 'Title Tag',
      description: 'Page has a good title',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: `Title present (${seoData.titleLength ?? 0} characters).`,
      recommendation: '',
    });
  }

  // Meta description check
  if (!seoData.metaDescription) {
    checks.push({
      id: 'seo-meta-description',
      category: 'seo',
      name: 'Meta Description',
      description: 'Meta description is missing',
      status: 'failed',
      severity: 'high',
      scoreImpact: 22,
      details: 'The page does not have a meta description.',
      recommendation: 'Add a unique meta description (150-160 characters recommended).',
    });
  } else if ((seoData.metaDescriptionLength ?? 0) < 120) {
    checks.push({
      id: 'seo-meta-description-short',
      category: 'seo',
      name: 'Meta Description',
      description: 'Meta description is short',
      status: 'warning',
      severity: 'low',
      scoreImpact: 10,
      details: `Meta description is ${seoData.metaDescriptionLength} characters.`,
      recommendation: 'Use a more descriptive meta description (150-160 characters recommended).',
    });
  } else if ((seoData.metaDescriptionLength ?? 0) > 160) {
    checks.push({
      id: 'seo-meta-description-long',
      category: 'seo',
      name: 'Meta Description',
      description: 'Meta description may be too long',
      status: 'warning',
      severity: 'low',
      scoreImpact: 2,
      details: `Meta description is ${seoData.metaDescriptionLength} characters.`,
      recommendation: 'Consider shortening to 150-160 characters.',
    });
  } else {
    checks.push({
      id: 'seo-meta-description',
      category: 'seo',
      name: 'Meta Description',
      description: 'Meta description is good',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: `Meta description present (${seoData.metaDescriptionLength ?? 0} characters).`,
      recommendation: '',
    });
  }

  // H1 check
  if (seoData.h1Count === 0) {
    checks.push({
      id: 'seo-h1-missing',
      category: 'seo',
      name: 'H1 Heading',
      description: 'No H1 heading found',
      status: 'failed',
      severity: 'high',
      scoreImpact: 20,
      details: 'The page does not have an H1 heading.',
      recommendation: 'Add a single H1 heading that describes the main content.',
    });
  } else if (seoData.h1Count > 1) {
    checks.push({
      id: 'seo-h1-multiple',
      category: 'seo',
      name: 'H1 Heading',
      description: 'Multiple H1 headings found',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 12,
      details: `Page has ${seoData.h1Count} H1 headings.`,
      recommendation: 'Use only one H1 heading per page.',
    });
  } else {
    checks.push({
      id: 'seo-h1',
      category: 'seo',
      name: 'H1 Heading',
      description: 'H1 heading is present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Page has a single H1 heading.',
      recommendation: '',
    });
  }

  // Canonical check
  if (!seoData.canonical) {
    checks.push({
      id: 'seo-canonical',
      category: 'seo',
      name: 'Canonical URL',
      description: 'Canonical URL is missing',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 8,
      details: 'No canonical URL specified.',
      recommendation: 'Add a canonical URL to prevent duplicate content issues.',
    });
  } else {
    checks.push({
      id: 'seo-canonical',
      category: 'seo',
      name: 'Canonical URL',
      description: 'Canonical URL is present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Canonical URL specified.',
      recommendation: '',
    });
  }

  // Images alt text
  if (seoData.imagesWithoutAlt > 0) {
    const severity: 'high' | 'medium' = seoData.imagesWithoutAlt > 5 ? 'high' : 'medium';
    checks.push({
      id: 'seo-images-alt',
      category: 'seo',
      name: 'Image Alt Text',
      description: 'Images missing alt text',
      status: 'warning',
      severity,
      scoreImpact: Math.min(seoData.imagesWithoutAlt, 10),
      details: `${seoData.imagesWithoutAlt} out of ${seoData.imageCount} images are missing alt text.`,
      recommendation: 'Add descriptive alt text to all images for SEO and accessibility.',
    });
  } else if (seoData.imageCount > 0) {
    checks.push({
      id: 'seo-images-alt',
      category: 'seo',
      name: 'Image Alt Text',
      description: 'All images have alt text',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'All images have alt attributes.',
      recommendation: '',
    });
  }

  // Open Graph
  if (!seoData.hasOpenGraph) {
    checks.push({
      id: 'seo-open-graph',
      category: 'seo',
      name: 'Open Graph',
      description: 'Open Graph tags missing',
      status: 'info',
      severity: 'low',
      scoreImpact: 2,
      details: 'No Open Graph metadata found.',
      recommendation: 'Add Open Graph tags for better social media sharing.',
    });
  } else {
    checks.push({
      id: 'seo-open-graph',
      category: 'seo',
      name: 'Open Graph',
      description: 'Open Graph tags present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Open Graph metadata configured.',
      recommendation: '',
    });
  }

  // Twitter Card
  if (!seoData.hasTwitterCard) {
    checks.push({
      id: 'seo-twitter-card',
      category: 'seo',
      name: 'Twitter Card',
      description: 'Twitter Card tags missing',
      status: 'info',
      severity: 'low',
      scoreImpact: 2,
      details: 'No Twitter Card metadata found.',
      recommendation: 'Add Twitter Card tags for better Twitter sharing.',
    });
  } else {
    checks.push({
      id: 'seo-twitter-card',
      category: 'seo',
      name: 'Twitter Card',
      description: 'Twitter Card tags present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Twitter Card metadata configured.',
      recommendation: '',
    });
  }

  // Structured Data
  if (!seoData.hasStructuredData) {
    checks.push({
      id: 'seo-structured-data',
      category: 'seo',
      name: 'Structured Data',
      description: 'Structured data not detected',
      status: 'info',
      severity: 'low',
      scoreImpact: 3,
      details: 'No JSON-LD or microdata found.',
      recommendation: 'Consider adding schema.org structured data for rich results.',
    });
  } else {
    checks.push({
      id: 'seo-structured-data',
      category: 'seo',
      name: 'Structured Data',
      description: 'Structured data present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Structured data detected.',
      recommendation: '',
    });
  }

  return checks;
}
