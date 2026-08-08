import { CheerioAPI } from 'cheerio';
import { PerformanceMetrics, AuditCheck } from '@/types/audit';

/**
 * Analyze performance metrics
 */
export function analyzePerformance(
  $: CheerioAPI,
  headers: Record<string, string>,
  htmlSize: number,
  pageSize: number,
  responseTime: number
): PerformanceMetrics {
  // Count resources
  const scripts = $('script[src]');
  const stylesheets = $('link[rel="stylesheet"]');
  const images = $('img[src]');

  const scriptCount = scripts.length;
  const stylesheetCount = stylesheets.length;
  const imageCount = images.length;
  const resourceCount = scriptCount + stylesheetCount + imageCount;

  // Check compression
  const compressionEnabled = 
    headers['content-encoding']?.includes('gzip') ||
    headers['content-encoding']?.includes('br') ||
    headers['content-encoding']?.includes('deflate') ||
    false;

  // Check cache headers
  const cacheHeaders = 
    Boolean(headers['cache-control']) ||
    Boolean(headers['expires']) ||
    Boolean(headers['etag']);

  return {
    responseTime,
    timeToFirstByte: responseTime, // Approximation
    htmlSize,
    pageSize,
    resourceCount,
    imageCount,
    scriptCount,
    stylesheetCount,
    compressionEnabled,
    cacheHeaders,
  };
}

/**
 * Generate performance audit checks
 */
export function generatePerformanceChecks(metrics: PerformanceMetrics): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // Response time check
  if (metrics.responseTime) {
    if (metrics.responseTime > 3000) {
      checks.push({
        id: 'perf-response-time',
        category: 'performance',
        name: 'Server Response Time',
        description: 'Slow server response',
        status: 'failed',
        severity: 'high',
        scoreImpact: 18,
        details: `Server response time is ${metrics.responseTime}ms.`,
        recommendation: 'Optimize server response time to under 600ms.',
      });
    } else if (metrics.responseTime > 1000) {
      checks.push({
        id: 'perf-response-time',
        category: 'performance',
        name: 'Server Response Time',
        description: 'Response time could be improved',
        status: 'warning',
        severity: 'medium',
        scoreImpact: 8,
        details: `Server response time is ${metrics.responseTime}ms.`,
        recommendation: 'Consider optimizing server response time to under 600ms.',
      });
    } else {
      checks.push({
        id: 'perf-response-time',
        category: 'performance',
        name: 'Server Response Time',
        description: 'Good server response time',
        status: 'passed',
        severity: 'low',
        scoreImpact: 0,
        details: `Server response time is ${metrics.responseTime}ms.`,
        recommendation: '',
      });
    }
  }

  // HTML size check
  if (metrics.htmlSize) {
    const htmlSizeKB = Math.round(metrics.htmlSize / 1024);
    if (metrics.htmlSize > 200 * 1024) {
      checks.push({
        id: 'perf-html-size',
        category: 'performance',
        name: 'HTML Size',
        description: 'HTML document is large',
        status: 'warning',
        severity: 'medium',
        scoreImpact: 8,
        details: `HTML size is ${htmlSizeKB}KB.`,
        recommendation: 'Consider reducing HTML size by removing unnecessary elements and whitespace.',
      });
    } else {
      checks.push({
        id: 'perf-html-size',
        category: 'performance',
        name: 'HTML Size',
        description: 'HTML size is reasonable',
        status: 'passed',
        severity: 'low',
        scoreImpact: 0,
        details: `HTML size is ${htmlSizeKB}KB.`,
        recommendation: '',
      });
    }
  }

  // Compression check
  if (metrics.compressionEnabled === false) {
    checks.push({
      id: 'perf-compression',
      category: 'performance',
      name: 'Compression',
      description: 'Text compression not enabled',
      status: 'failed',
      severity: 'high',
      scoreImpact: 15,
      details: 'Server is not sending compressed responses.',
      recommendation: 'Enable gzip or brotli compression on the server.',
    });
  } else {
    checks.push({
      id: 'perf-compression',
      category: 'performance',
      name: 'Compression',
      description: 'Text compression enabled',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Server sends compressed responses.',
      recommendation: '',
    });
  }

  // Cache headers check
  if (metrics.cacheHeaders === false) {
    checks.push({
      id: 'perf-cache-headers',
      category: 'performance',
      name: 'Cache Headers',
      description: 'Cache headers not configured',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 6,
      details: 'No cache control headers detected.',
      recommendation: 'Configure cache headers to improve repeat visit performance.',
    });
  } else {
    checks.push({
      id: 'perf-cache-headers',
      category: 'performance',
      name: 'Cache Headers',
      description: 'Cache headers configured',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Cache control headers present.',
      recommendation: '',
    });
  }

  // Resource count check
  if (metrics.resourceCount && metrics.resourceCount > 100) {
    checks.push({
      id: 'perf-resource-count',
      category: 'performance',
      name: 'Resource Count',
      description: 'High number of resources',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 8,
      details: `Page loads ${metrics.resourceCount} external resources.`,
      recommendation: 'Consider reducing the number of resources by bundling and lazy loading.',
    });
  } else if (metrics.resourceCount) {
    checks.push({
      id: 'perf-resource-count',
      category: 'performance',
      name: 'Resource Count',
      description: 'Reasonable resource count',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: `Page loads ${metrics.resourceCount} external resources.`,
      recommendation: '',
    });
  }

  // Script count check
  if (metrics.scriptCount && metrics.scriptCount > 20) {
    checks.push({
      id: 'perf-script-count',
      category: 'performance',
      name: 'JavaScript Files',
      description: 'Many JavaScript files',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 8,
      details: `Page loads ${metrics.scriptCount} JavaScript files.`,
      recommendation: 'Consider bundling JavaScript files to reduce requests.',
    });
  }

  // Image count check
  if (metrics.imageCount && metrics.imageCount > 50) {
    checks.push({
      id: 'perf-image-count',
      category: 'performance',
      name: 'Image Count',
      description: 'Many images on page',
      status: 'info',
      severity: 'low',
      scoreImpact: 3,
      details: `Page has ${metrics.imageCount} images.`,
      recommendation: 'Consider lazy loading images and using modern formats like WebP.',
    });
  }

  return checks;
}
