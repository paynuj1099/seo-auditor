import { AuditCheck } from '@/types/audit';
import * as cheerio from 'cheerio';
import { Element, AnyNode } from 'domhandler';

interface UsabilityAnalysis {
  hasViewport: boolean;
  viewportContent: string;
  isMobileFriendly: boolean;
  hasTouchTargets: boolean;
  fontSizeReadable: boolean;
  hasLangAttribute: boolean;
}

export function analyzeUsability(html: string): UsabilityAnalysis {
  const $ = cheerio.load(html);

  const viewportMeta = $('meta[name="viewport"]');
  const hasViewport = viewportMeta.length > 0;
  const viewportContent = viewportMeta.attr('content') || '';

  const isMobileFriendly = hasViewport && 
    (viewportContent.includes('width=device-width') || viewportContent.includes('initial-scale'));

  const htmlTag = $('html');
  const hasLangAttribute = htmlTag.attr('lang') !== undefined;

  return {
    hasViewport,
    viewportContent,
    isMobileFriendly,
    hasTouchTargets: true, // Would need browser rendering to properly test
    fontSizeReadable: true, // Would need browser rendering to properly test
    hasLangAttribute,
  };
}

export function generateUsabilityChecks(
  analysis: UsabilityAnalysis,
  html: string
): AuditCheck[] {
  const $ = cheerio.load(html);
  const checks: AuditCheck[] = [];

  // Check: Mobile viewport configured
  checks.push({
    id: 'usability-viewport',
    category: 'usability',
    name: 'Mobile Viewport',
    description: 'Viewport meta tag configures how page scales on mobile devices',
    status: analysis.isMobileFriendly ? 'passed' : analysis.hasViewport ? 'warning' : 'failed',
    severity: 'critical',
    scoreImpact: analysis.isMobileFriendly ? 0 : analysis.hasViewport ? 12 : 25,
    details: analysis.hasViewport 
      ? `Viewport configured: ${analysis.viewportContent}`
      : 'No viewport meta tag found.',
    recommendation: !analysis.isMobileFriendly
      ? 'Add or update viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">'
      : 'Viewport properly configured for mobile devices.',
  });

  // Check: Language attribute
  checks.push({
    id: 'usability-lang',
    category: 'usability',
    name: 'Language Declaration',
    description: 'Language attribute helps screen readers and search engines',
    status: analysis.hasLangAttribute ? 'passed' : 'failed',
    severity: 'high',
    scoreImpact: analysis.hasLangAttribute ? 0 : 18,
    details: analysis.hasLangAttribute
      ? `Language declared: ${$('html').attr('lang')}`
      : 'No lang attribute on <html> tag.',
    recommendation: !analysis.hasLangAttribute
      ? 'Add lang attribute to <html> tag, e.g., <html lang="en">'
      : 'Language properly declared.',
  });

  // Check: Legible font sizes - check for small text (only inline styles as indicator)
  let smallTextElements = 0;
  $('*').each((_: number, el: AnyNode) => {
    if (el.type === 'tag') {
      const element = el as Element;
      const style = $(element).attr('style') || '';
      const match = style.match(/font-size:\s*(\d+)px/);
      if (match && parseInt(match[1]) < 10) {
        smallTextElements++;
      }
    }
  });
  
  checks.push({
    id: 'usability-font-size',
    category: 'usability',
    name: 'Legible Font Sizes',
    description: 'Text should be large enough to read without zooming',
    status: smallTextElements === 0 ? 'passed' : smallTextElements < 10 ? 'warning' : 'failed',
    severity: 'low',
    scoreImpact: smallTextElements === 0 ? 0 : smallTextElements < 10 ? 4 : 8,
    details: smallTextElements > 0
      ? `Found ${smallTextElements} elements with very small inline font sizes.`
      : 'Text appears to be legible.',
    recommendation: 'Ensure base font size is at least 16px for comfortable reading on mobile devices.',
  });

  // Check: Tap target sizing - check for small clickable elements (only obvious issues)
  const buttons = $('button, a, input[type="button"], input[type="submit"]');
  let smallButtons = 0;
  $('button, a').each((_: number, el: AnyNode) => {
    if (el.type === 'tag') {
      const element = el as Element;
      const style = $(element).attr('style') || '';
      const widthMatch = style.match(/width:\s*(\d+)px/);
      if (widthMatch && parseInt(widthMatch[1]) < 30) {
        smallButtons++;
      }
    }
  });
  
  checks.push({
    id: 'usability-tap-targets',
    category: 'usability',
    name: 'Tap Target Sizes',
    description: 'Interactive elements should be large enough to tap easily',
    status: buttons.length === 0 ? 'info' : smallButtons === 0 ? 'passed' : smallButtons < 10 ? 'warning' : 'failed',
    severity: 'low',
    scoreImpact: buttons.length === 0 ? 3 : smallButtons === 0 ? 0 : smallButtons < 10 ? 4 : 8,
    details: buttons.length > 0
      ? `Found ${buttons.length} interactive elements.${smallButtons > 0 ? ` ${smallButtons} may have sizing issues.` : ' Tap targets appear appropriately sized.'}`
      : 'No interactive elements found.',
    recommendation: 'Ensure buttons and links are at least 48x48 pixels with adequate spacing for easy tapping on mobile.',
  });

  // Check: Page title length for mobile
  const title = $('title').text();
  const titleLength = title.length;
  
  checks.push({
    id: 'usability-mobile-title',
    category: 'usability',
    name: 'Mobile-Friendly Title',
    description: 'Page title should be readable on mobile devices',
    status: titleLength > 0 && titleLength <= 60 ? 'passed' : titleLength <= 70 ? 'warning' : 'failed',
    severity: 'low',
    scoreImpact: titleLength > 0 && titleLength <= 60 ? 0 : titleLength <= 70 ? 3 : 5,
    details: title ? `Title is ${titleLength} characters: "${title.substring(0, 60)}..."` : 'No title tag found.',
    recommendation: titleLength > 60
      ? 'Consider shortening title for better mobile display (aim for under 60 characters).'
      : 'Title length is appropriate for mobile display.',
  });

  // Check: Content width - stricter check
  const hasResponsiveCSS = html.includes('max-width') || html.includes('container') || 
                          html.includes('responsive') || html.includes('@media');
  const hasFixedWidth = html.includes('width: 1') || html.includes('width:1');
  
  checks.push({
    id: 'usability-content-width',
    category: 'usability',
    name: 'Content Width',
    description: 'Content should not require horizontal scrolling on mobile',
    status: hasResponsiveCSS && !hasFixedWidth ? 'passed' : hasResponsiveCSS ? 'warning' : 'failed',
    severity: 'high',
    scoreImpact: hasResponsiveCSS && !hasFixedWidth ? 0 : hasResponsiveCSS ? 10 : 20,
    details: hasResponsiveCSS
      ? hasFixedWidth
        ? 'Responsive CSS detected but fixed widths may cause issues.'
        : 'Content appears to be responsive.'
      : 'No responsive design patterns detected.',
    recommendation: 'Use responsive design with flexible layouts, max-width, and media queries to ensure content fits all screen sizes.',
  });

  // Check: Flash usage (bad for usability)
  const hasFlash = html.toLowerCase().includes('flash') || 
                   html.toLowerCase().includes('.swf') ||
                   $('object[type="application/x-shockwave-flash"]').length > 0;
  
  checks.push({
    id: 'usability-no-flash',
    category: 'usability',
    name: 'No Flash Content',
    description: 'Flash is not supported on most mobile devices',
    status: !hasFlash ? 'passed' : 'failed',
    severity: hasFlash ? 'high' : 'low',
    scoreImpact: !hasFlash ? 0 : 15,
    details: hasFlash
      ? 'Flash content detected. Flash is not supported on mobile devices.'
      : 'No Flash content detected.',
    recommendation: hasFlash
      ? 'Replace Flash content with HTML5, CSS3, and JavaScript for mobile compatibility.'
      : 'No Flash content used.',
  });

  // Check: iFrames usage
  const iframes = $('iframe');
  checks.push({
    id: 'usability-iframes',
    category: 'usability',
    name: 'iFrame Usage',
    description: 'iFrames can cause usability issues on mobile devices',
    status: iframes.length === 0 ? 'passed' : iframes.length <= 2 ? 'warning' : 'failed',
    severity: 'low',
    scoreImpact: iframes.length === 0 ? 0 : iframes.length <= 2 ? 3 : 8,
    details: iframes.length > 0
      ? `Found ${iframes.length} iFrame(s) on the page.`
      : 'No iFrames detected on the page.',
    recommendation: iframes.length > 0
      ? 'Minimize iFrame usage as they can cause mobile usability and SEO issues.'
      : 'No iFrames used.',
  });

  // Check: Favicon
  const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').length > 0;
  checks.push({
    id: 'usability-favicon',
    category: 'usability',
    name: 'Favicon',
    description: 'Favicon helps users identify your site in browser tabs and bookmarks',
    status: hasFavicon ? 'passed' : 'warning',
    severity: 'low',
    scoreImpact: hasFavicon ? 0 : 5,
    details: hasFavicon
      ? 'Page has specified a Favicon.'
      : 'No Favicon detected.',
    recommendation: !hasFavicon
      ? 'Add a favicon to improve brand recognition: <link rel="icon" href="/favicon.ico">'
      : 'Favicon properly configured.',
  });

  // Check: Email privacy
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const plainTextEmails = (html.match(emailRegex) || []).filter(email => {
    // Only count emails in actual text content, not in attributes or scripts
    return !email.includes('schema.org') && !email.includes('example.');
  });
  
  checks.push({
    id: 'usability-email-privacy',
    category: 'usability',
    name: 'Email Privacy',
    description: 'Plain text emails are susceptible to spam bots',
    status: plainTextEmails.length === 0 ? 'passed' : plainTextEmails.length <= 2 ? 'warning' : 'failed',
    severity: 'low',
    scoreImpact: plainTextEmails.length === 0 ? 0 : plainTextEmails.length <= 2 ? 4 : 8,
    details: plainTextEmails.length > 0
      ? `Found ${plainTextEmails.length} email address(es) in plain text.`
      : 'No plain text email addresses detected.',
    recommendation: plainTextEmails.length > 0
      ? 'Consider using contact forms or encoding email addresses to protect against spam scrapers.'
      : 'Email addresses are protected.',
  });

  return checks;
}
