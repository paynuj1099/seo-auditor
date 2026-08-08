import type { CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { AuditCheck } from '@/types/audit';

/**
 * Analyze best practices
 */
export function analyzeBestPractices(
  $: CheerioAPI,
  url: string,
  headers: Record<string, string>
): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // HTTPS check
  const isHttps = url.startsWith('https://');
  if (!isHttps) {
    checks.push({
      id: 'bp-https',
      category: 'bestPractices',
      name: 'HTTPS',
      description: 'Not using HTTPS',
      status: 'failed',
      severity: 'critical',
      scoreImpact: 15,
      details: 'Website is not served over HTTPS.',
      recommendation: 'Implement HTTPS for security and SEO benefits.',
    });
  } else {
    checks.push({
      id: 'bp-https',
      category: 'bestPractices',
      name: 'HTTPS',
      description: 'Using HTTPS',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Website is served over HTTPS.',
      recommendation: '',
    });
  }

  // Check for console errors (can't detect from HTML alone)
  // This would require browser rendering

  // Check for deprecated HTML
  const deprecatedElements = $('marquee, blink, center, font, frame, frameset').length;
  if (deprecatedElements > 0) {
    checks.push({
      id: 'bp-deprecated-html',
      category: 'bestPractices',
      name: 'Deprecated HTML',
      description: 'Deprecated HTML elements found',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 5,
      details: `${deprecatedElements} deprecated HTML elements detected.`,
      recommendation: 'Remove deprecated HTML elements and use modern alternatives.',
    });
  } else {
    checks.push({
      id: 'bp-deprecated-html',
      category: 'bestPractices',
      name: 'Deprecated HTML',
      description: 'No deprecated HTML found',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'No deprecated HTML elements detected.',
      recommendation: '',
    });
  }

  // Check for inline styles (excessive use is not a best practice)
  const elementsWithInlineStyles = $('[style]').length;
  if (elementsWithInlineStyles > 50) {
    checks.push({
      id: 'bp-inline-styles',
      category: 'bestPractices',
      name: 'Inline Styles',
      description: 'Excessive inline styles',
      status: 'warning',
      severity: 'low',
      scoreImpact: 3,
      details: `${elementsWithInlineStyles} elements have inline styles.`,
      recommendation: 'Consider moving styles to CSS files for better maintainability.',
    });
  }

  // Check for document type
  const hasDoctype = $.root().toString().toLowerCase().includes('<!doctype html>');
  if (!hasDoctype) {
    checks.push({
      id: 'bp-doctype',
      category: 'bestPractices',
      name: 'Document Type',
      description: 'DOCTYPE missing or invalid',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 4,
      details: 'No HTML5 DOCTYPE declaration found.',
      recommendation: 'Add <!DOCTYPE html> at the beginning of the document.',
    });
  } else {
    checks.push({
      id: 'bp-doctype',
      category: 'bestPractices',
      name: 'Document Type',
      description: 'DOCTYPE declared',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'HTML5 DOCTYPE is declared.',
      recommendation: '',
    });
  }

  // Check for character encoding
  const hasCharset = 
    $('meta[charset]').length > 0 ||
    $('meta[http-equiv="Content-Type"]').length > 0;
  
  if (!hasCharset) {
    checks.push({
      id: 'bp-charset',
      category: 'bestPractices',
      name: 'Character Encoding',
      description: 'Character encoding not specified',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 4,
      details: 'No character encoding meta tag found.',
      recommendation: 'Add <meta charset="UTF-8"> to specify character encoding.',
    });
  } else {
    checks.push({
      id: 'bp-charset',
      category: 'bestPractices',
      name: 'Character Encoding',
      description: 'Character encoding specified',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Character encoding is specified.',
      recommendation: '',
    });
  }

  // Check for favicon
  const hasFavicon = 
    $('link[rel="icon"]').length > 0 ||
    $('link[rel="shortcut icon"]').length > 0 ||
    $('link[rel="apple-touch-icon"]').length > 0;

  if (!hasFavicon) {
    checks.push({
      id: 'bp-favicon',
      category: 'bestPractices',
      name: 'Favicon',
      description: 'Favicon not found',
      status: 'info',
      severity: 'low',
      scoreImpact: 1,
      details: 'No favicon link detected.',
      recommendation: 'Add a favicon for better user experience and branding.',
    });
  } else {
    checks.push({
      id: 'bp-favicon',
      category: 'bestPractices',
      name: 'Favicon',
      description: 'Favicon present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Favicon is configured.',
      recommendation: '',
    });
  }

  // Check for mixed content warnings (HTTP resources on HTTPS page)
  if (isHttps) {
    const httpResources = $('script[src^="http:"], link[href^="http:"], img[src^="http:"]').length;
    if (httpResources > 0) {
      checks.push({
        id: 'bp-mixed-content',
        category: 'bestPractices',
        name: 'Mixed Content',
        description: 'Mixed HTTP/HTTPS content detected',
        status: 'warning',
        severity: 'high',
        scoreImpact: 8,
        details: `${httpResources} HTTP resources found on HTTPS page.`,
        recommendation: 'Use HTTPS for all resources to avoid security warnings.',
      });
    } else {
      checks.push({
        id: 'bp-mixed-content',
        category: 'bestPractices',
        name: 'Mixed Content',
        description: 'No mixed content detected',
        status: 'passed',
        severity: 'low',
        scoreImpact: 0,
        details: 'All resources use HTTPS.',
        recommendation: '',
      });
    }
  }

  // Check for compression
  const hasCompression = 
    headers['content-encoding']?.includes('gzip') ||
    headers['content-encoding']?.includes('br') ||
    headers['content-encoding']?.includes('deflate') ||
    false;

  if (!hasCompression) {
    checks.push({
      id: 'bp-compression',
      category: 'bestPractices',
      name: 'Compression',
      description: 'Compression not enabled',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 6,
      details: 'Response is not compressed.',
      recommendation: 'Enable gzip or brotli compression on the server.',
    });
  } else {
    checks.push({
      id: 'bp-compression',
      category: 'bestPractices',
      name: 'Compression',
      description: 'Compression enabled',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Response is compressed.',
      recommendation: '',
    });
  }

  // Check for modern image formats
  const images = $('img[src]');
  const imageFormats = images.map((_: number, el: Element) => {
    const src = $(el).attr('src') || '';
    const ext = src.split('.').pop()?.toLowerCase();
    return ext;
  }).get();

  const hasModernFormats = imageFormats.some((fmt: string | undefined) => fmt === 'webp' || fmt === 'avif');
  const hasOnlyOldFormats = imageFormats.length > 0 && !hasModernFormats;

  if (hasOnlyOldFormats && images.length > 5) {
    checks.push({
      id: 'bp-image-formats',
      category: 'bestPractices',
      name: 'Image Formats',
      description: 'Consider modern image formats',
      status: 'info',
      severity: 'low',
      scoreImpact: 2,
      details: 'No modern image formats (WebP, AVIF) detected.',
      recommendation: 'Consider using WebP or AVIF for better compression.',
    });
  } else if (hasModernFormats) {
    checks.push({
      id: 'bp-image-formats',
      category: 'bestPractices',
      name: 'Image Formats',
      description: 'Using modern image formats',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Modern image formats detected.',
      recommendation: '',
    });
  }

  return checks;
}
