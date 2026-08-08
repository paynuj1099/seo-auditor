import * as cheerio from 'cheerio';
import { CrawlerResult } from '@/types/audit';
import { validateSSRF, revalidateAfterRedirect } from '../security/ssrf';

const MAX_REDIRECTS = 5;
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Fetch and parse a website
 */
export async function crawlWebsite(url: string): Promise<CrawlerResult> {
  const startTime = Date.now();
  let finalUrl = url;
  let redirectCount = 0;

  try {
    // Initial SSRF validation
    const ssrfCheck = await validateSSRF(url);
    if (!ssrfCheck.safe) {
      throw new Error(ssrfCheck.reason || 'URL validation failed');
    }

    // Fetch the website
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'SiteAuditAI-Bot/1.0 (Website Audit Tool)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Get final URL after redirects
    finalUrl = response.url;

    // Revalidate final URL for SSRF
    const finalSsrfCheck = await revalidateAfterRedirect(finalUrl);
    if (!finalSsrfCheck.safe) {
      throw new Error('Redirect to unsafe URL detected');
    }

    // Check response status
    if (!response.ok && response.status !== 404) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('URL does not return HTML content');
    }

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
      throw new Error('Response size exceeds maximum allowed size');
    }

    // Read response with size limit
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Unable to read response body');
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > MAX_RESPONSE_SIZE) {
        reader.cancel();
        throw new Error('Response size exceeds maximum allowed size');
      }

      chunks.push(value);
    }

    // Combine chunks and decode
    const allChunks = new Uint8Array(totalSize);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    const html = new TextDecoder('utf-8').decode(allChunks);
    const htmlSize = Buffer.from(html).length;

    // Parse HTML with Cheerio
    const $ = cheerio.load(html);

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Extract headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      html,
      $,
      url,
      finalUrl,
      status: response.status,
      headers,
      responseTime,
      pageSize: totalSize,
      htmlSize,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - the website took too long to respond');
      }
      throw error;
    }
    throw new Error('Failed to crawl website');
  }
}

/**
 * Check if robots.txt exists
 */
export async function checkRobotsTxt(baseUrl: string): Promise<boolean> {
  try {
    const url = new URL('/robots.txt', baseUrl);
    const response = await fetch(url.toString(), {
      method: 'HEAD',
      headers: {
        'User-Agent': 'SiteAuditAI-Bot/1.0',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if sitemap.xml exists
 */
export async function checkSitemap(baseUrl: string): Promise<boolean> {
  try {
    const url = new URL('/sitemap.xml', baseUrl);
    const response = await fetch(url.toString(), {
      method: 'HEAD',
      headers: {
        'User-Agent': 'SiteAuditAI-Bot/1.0',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
