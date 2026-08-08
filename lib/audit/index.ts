function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

import { AuditResult, AuditCheck } from '@/types/audit';
import { crawlWebsite, checkRobotsTxt, checkSitemap } from './crawler';
import { analyzeSEO, generateSEOChecks } from './seo';
import { analyzePerformance, generatePerformanceChecks } from './performance';
import { analyzeAccessibility, generateAccessibilityChecks } from './accessibility';
import { analyzeTechnical, generateTechnicalChecks } from './technical';
import { analyzeMobile, generateMobileChecks } from './mobile';
import { analyzeBestPractices } from './best-practices';
import { analyzeLinks, generateLinksChecks } from './links';
import { analyzeUsability, generateUsabilityChecks } from './usability';
import { calculateScores, calculateSummary } from './scoring';
import { generateRecommendations } from './recommendations';

/**
 * Main audit orchestrator
 * Runs all audit checks and generates a comprehensive report
 */
export async function runAudit(url: string, options?: {
  includeScreenshots?: boolean;
}): Promise<AuditResult> {
  const auditId = generateId();
  const startTime = Date.now();

  try {
    // Step 1: Crawl the website
    const crawlResult = await crawlWebsite(url);
    const { $, finalUrl, status, headers, responseTime, pageSize, htmlSize } = crawlResult;

    // Step 2: Check for robots.txt and sitemap
    const hasRobotsTxt = await checkRobotsTxt(finalUrl);
    const hasSitemap = await checkSitemap(finalUrl);

    // Step 3: Run all analyses
    const seoData = analyzeSEO($, finalUrl);
    const perfData = analyzePerformance($, headers, htmlSize, pageSize, responseTime);
    const a11yData = analyzeAccessibility($);
    const techData = analyzeTechnical($, finalUrl, status, headers, hasRobotsTxt, hasSitemap);
    const mobileData = analyzeMobile($);
    const html = $.html();
    const linksData = analyzeLinks(html, finalUrl);
    const usabilityData = analyzeUsability(html);

    // Step 4: Generate checks
    const allChecks: AuditCheck[] = [
      ...generateSEOChecks(seoData),
      ...generatePerformanceChecks(perfData),
      ...generateAccessibilityChecks(a11yData),
      ...generateTechnicalChecks(techData, status),
      ...generateMobileChecks(mobileData),
      ...analyzeBestPractices($, finalUrl, headers),
      ...generateLinksChecks(linksData, html, finalUrl),
      ...generateUsabilityChecks(usabilityData, html),
    ];

    // Step 5: Calculate scores
    const scores = calculateScores(allChecks);
    const summary = calculateSummary(allChecks);

    // Step 6: Generate recommendations
    const recommendations = generateRecommendations(allChecks);

    // Step 7: Build page details
    const pageDetails = {
      url,
      finalUrl,
      httpStatus: status,
      contentType: headers['content-type'] || 'unknown',
      responseTime,
      pageSize,
      htmlSize,
      linkCount: seoData.internalLinks + seoData.externalLinks,
      imageCount: seoData.imageCount,
      scriptCount: perfData.scriptCount || 0,
      stylesheetCount: perfData.stylesheetCount || 0,
      isHttps: finalUrl.startsWith('https://'),
      hasRobotsTxt,
      hasSitemap,
      title: seoData.title,
      metaDescription: seoData.metaDescription,
    };

    // Step 8: Return result (screenshots will be added by the API route)
    const result: AuditResult = {
      id: auditId,
      url: finalUrl,
      createdAt: new Date().toISOString(),
      status: 'completed',
      scores,
      summary,
      checks: allChecks,
      recommendations,
      screenshots: {},
      performance: perfData,
      pageDetails,
    };

    return result;
  } catch (error) {
    // Return failed audit result
    const result: AuditResult = {
      id: auditId,
      url,
      createdAt: new Date().toISOString(),
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      scores: {
        overall: 0,
        seo: 0,
        performance: 0,
        technical: 0,
        usability: 0,
        links: 0,
      },
      summary: {
        passed: 0,
        warnings: 0,
        failed: 0,
        critical: 0,
      },
      checks: [],
      recommendations: [],
      screenshots: {},
      performance: {},
      pageDetails: {
        url,
        finalUrl: url,
        httpStatus: 0,
        contentType: 'unknown',
        responseTime: Date.now() - startTime,
        pageSize: 0,
        htmlSize: 0,
        linkCount: 0,
        imageCount: 0,
        scriptCount: 0,
        stylesheetCount: 0,
        isHttps: false,
      },
    };

    return result;
  }
}
