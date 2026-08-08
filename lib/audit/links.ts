import { AuditCheck } from '@/types/audit';
import * as cheerio from 'cheerio';
import { Element } from 'domhandler';

interface LinksAnalysis {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  nofollowLinks: number;
  totalBacklinks: number;
}

export function analyzeLinks(html: string, url: string): LinksAnalysis {
  const $ = cheerio.load(html);
  const domain = new URL(url).hostname;
  
  let totalLinks = 0;
  let internalLinks = 0;
  let externalLinks = 0;
  let brokenLinks = 0;
  let nofollowLinks = 0;

  $('a[href]').each((_: number, el: Element) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#') || href === '') return;

    totalLinks++;

    const rel = $(el).attr('rel');
    if (rel && rel.includes('nofollow')) {
      nofollowLinks++;
    }

    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === domain) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      // Relative or malformed URL - treat as internal
      internalLinks++;
    }
  });

  return {
    totalLinks,
    internalLinks,
    externalLinks,
    brokenLinks,
    nofollowLinks,
    totalBacklinks: 0, // Would need external API for real backlink data
  };
}

export function generateLinksChecks(
  analysis: LinksAnalysis,
  html: string,
  url: string
): AuditCheck[] {
  const $ = cheerio.load(html);
  const checks: AuditCheck[] = [];

  // Check: Has sufficient internal linking - stricter threshold
  checks.push({
    id: 'links-internal',
    category: 'links',
    name: 'Internal Link Structure',
    description: 'Internal links help search engines discover and index pages',
    status: analysis.internalLinks >= 10 ? 'passed' : analysis.internalLinks >= 5 ? 'warning' : 'failed',
    severity: 'high',
    scoreImpact: analysis.internalLinks >= 10 ? 0 : analysis.internalLinks >= 5 ? 12 : 20,
    details: `Found ${analysis.internalLinks} internal links on this page.`,
    recommendation: analysis.internalLinks < 10
      ? 'Add more internal links (aim for 10+) to help search engines discover your content and improve site navigation.'
      : 'Good internal linking structure.',
  });

  // Check: External links present - make it fail if none
  checks.push({
    id: 'links-external',
    category: 'links',
    name: 'External Links',
    description: 'Linking to quality external resources can provide value to users',
    status: analysis.externalLinks >= 3 ? 'passed' : analysis.externalLinks > 0 ? 'warning' : 'failed',
    severity: 'medium',
    scoreImpact: analysis.externalLinks >= 3 ? 0 : analysis.externalLinks > 0 ? 10 : 15,
    details: `Found ${analysis.externalLinks} external links on this page.`,
    recommendation: analysis.externalLinks < 3
      ? 'Consider linking to relevant external resources (3+) to provide additional value to users and show trustworthiness.'
      : 'Page includes external links.',
  });

  // Check: Links use descriptive anchor text
  let emptyAnchors = 0;
  let genericAnchors = 0;
  const genericTerms = ['click here', 'read more', 'here', 'link', 'this'];

  $('a[href]').each((_: number, el: Element) => {
    const text = $(el).text().trim().toLowerCase();
    if (!text) {
      emptyAnchors++;
    } else if (genericTerms.includes(text)) {
      genericAnchors++;
    }
  });

  checks.push({
    id: 'links-anchor-text',
    category: 'links',
    name: 'Descriptive Anchor Text',
    description: 'Links should use descriptive anchor text rather than generic phrases',
    status: emptyAnchors === 0 && genericAnchors === 0 ? 'passed' : genericAnchors < 3 ? 'warning' : 'failed',
    severity: 'medium',
    scoreImpact: emptyAnchors === 0 && genericAnchors === 0 ? 0 : genericAnchors < 3 ? 10 : 15,
    details: `Found ${emptyAnchors} empty links and ${genericAnchors} links with generic anchor text.`,
    recommendation: emptyAnchors > 0 || genericAnchors > 0
      ? 'Use descriptive anchor text that tells users and search engines what to expect when clicking the link.'
      : 'Links use descriptive anchor text.',
  });

  // Check: Nofollow usage
  const nofollowPercentage = analysis.totalLinks > 0 
    ? (analysis.nofollowLinks / analysis.totalLinks) * 100 
    : 0;

  checks.push({
    id: 'links-nofollow',
    category: 'links',
    name: 'Nofollow Link Usage',
    description: 'Nofollow links tell search engines not to pass link equity',
    status: nofollowPercentage < 30 ? 'passed' : nofollowPercentage < 60 ? 'warning' : 'info',
    severity: 'low',
    scoreImpact: nofollowPercentage < 30 ? 0 : nofollowPercentage < 60 ? 3 : 5,
    details: `${analysis.nofollowLinks} of ${analysis.totalLinks} links (${nofollowPercentage.toFixed(1)}%) use nofollow.`,
    recommendation: nofollowPercentage > 60
      ? 'High percentage of nofollow links may limit SEO value. Review which links should pass authority.'
      : 'Nofollow usage is appropriate.',
  });

  // Check: Backlink building opportunity
  checks.push({
    id: 'links-backlinks',
    category: 'links',
    name: 'Link Building Strategy',
    description: 'Building quality backlinks improves search engine rankings',
    status: 'info',
    severity: 'high',
    scoreImpact: 0,
    details: 'Backlink analysis requires external tools and cannot be determined from page content alone.',
    recommendation: 'Develop a link building strategy to earn quality backlinks from authoritative websites in your industry.',
  });

  // Check: Friendly URLs
  let unfriendlyUrls = 0;
  $('a[href]').each((_: number, el: Element) => {
    const href = $(el).attr('href') || '';
    // Check for unfriendly patterns: query strings with session IDs, numeric IDs only, etc.
    if (href.includes('?id=') || href.includes('&id=') || 
        href.match(/\?.*sessionid/i) || href.match(/\d{5,}/) ||
        href.includes('%') && !href.includes('mailto:')) {
      unfriendlyUrls++;
    }
  });

  checks.push({
    id: 'links-friendly-urls',
    category: 'links',
    name: 'Friendly URLs',
    description: 'URLs should be readable and descriptive for users and search engines',
    status: unfriendlyUrls === 0 ? 'passed' : unfriendlyUrls < 3 ? 'warning' : 'failed',
    severity: 'low',
    scoreImpact: unfriendlyUrls === 0 ? 0 : unfriendlyUrls < 3 ? 3 : 8,
    details: unfriendlyUrls > 0
      ? `Found ${unfriendlyUrls} potentially unfriendly URL(s).`
      : 'Link URLs appear friendly (easily human or search engine readable).',
    recommendation: unfriendlyUrls > 0
      ? 'Use descriptive, keyword-rich URLs instead of query strings and numeric IDs (e.g., /about-us instead of /page?id=123).'
      : 'URLs are user-friendly.',
  });

  return checks;
}
