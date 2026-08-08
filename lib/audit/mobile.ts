import { CheerioAPI } from 'cheerio';
import { MobileAnalysisResult, AuditCheck } from '@/types/audit';

/**
 * Analyze mobile experience factors
 */
export function analyzeMobile($: CheerioAPI): MobileAnalysisResult {
  // Viewport check
  const viewportMeta = $('meta[name="viewport"]');
  const hasViewport = viewportMeta.length > 0;
  const viewportContent = viewportMeta.attr('content');

  // Check for mobile-friendly viewport settings
  const hasMobileFriendlyViewport = viewportContent?.includes('width=device-width') || false;

  // Basic mobile checks from HTML
  const issues: string[] = [];

  // Check for fixed width layouts
  const hasFixedWidth = $('[style*="width:"][style*="px"]').length > 10;
  if (hasFixedWidth) {
    issues.push('Multiple elements with fixed pixel widths detected');
  }

  // Check for small font sizes
  const hasSmallFonts = $('[style*="font-size"]').filter((_, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/font-size:\s*(\d+)px/);
    if (match) {
      const size = parseInt(match[1], 10);
      return size < 12;
    }
    return false;
  }).length > 5;

  if (hasSmallFonts) {
    issues.push('Small font sizes detected that may be hard to read on mobile');
  }

  // Check for tables without responsive handling
  const hasComplexTables = $('table').length > 3;
  if (hasComplexTables) {
    issues.push('Multiple tables detected - ensure they are mobile-responsive');
  }

  // Check tap target sizes (buttons, links)
  let smallClickTargets = 0;
  $('a, button').each((_, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/height:\s*(\d+)px/);
    if (style.includes('height:') && match && parseInt(match[1], 10) < 44) {
      smallClickTargets++;
    }
  });

  const tapTargetsAdequate = smallClickTargets < 5;
  if (!tapTargetsAdequate) {
    issues.push('Some tap targets may be too small for mobile users');
  }

  // Determine if mobile friendly based on checks
  const isMobileFriendly = hasViewport && hasMobileFriendlyViewport && issues.length < 2;

  return {
    hasViewport,
    viewportContent,
    hasHorizontalOverflow: false, // Would need browser rendering to detect
    isMobileFriendly,
    fontSizeReadable: !hasSmallFonts,
    tapTargetsAdequate,
    issues,
  };
}

/**
 * Generate mobile experience audit checks
 */
export function generateMobileChecks(mobileData: MobileAnalysisResult): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // Viewport check
  if (!mobileData.hasViewport) {
    checks.push({
      id: 'mobile-viewport',
      category: 'mobile',
      name: 'Viewport Configuration',
      description: 'Viewport meta tag missing',
      status: 'failed',
      severity: 'critical',
      scoreImpact: 25,
      details: 'No viewport meta tag found.',
      recommendation: 'Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">',
    });
  } else if (!mobileData.viewportContent?.includes('width=device-width')) {
    checks.push({
      id: 'mobile-viewport',
      category: 'mobile',
      name: 'Viewport Configuration',
      description: 'Viewport not optimized for mobile',
      status: 'warning',
      severity: 'high',
      scoreImpact: 8,
      details: 'Viewport is configured but may not be mobile-optimized.',
      recommendation: 'Set viewport width to device-width for responsive design.',
    });
  } else {
    checks.push({
      id: 'mobile-viewport',
      category: 'mobile',
      name: 'Viewport Configuration',
      description: 'Viewport properly configured',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Viewport is configured for mobile devices.',
      recommendation: '',
    });
  }

  // Font size check
  if (!mobileData.fontSizeReadable) {
    checks.push({
      id: 'mobile-font-size',
      category: 'mobile',
      name: 'Font Size',
      description: 'Font sizes may be too small',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 5,
      details: 'Small font sizes detected that may be difficult to read on mobile.',
      recommendation: 'Use font sizes of at least 16px for body text on mobile.',
    });
  } else {
    checks.push({
      id: 'mobile-font-size',
      category: 'mobile',
      name: 'Font Size',
      description: 'Font sizes are readable',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Font sizes appear adequate for mobile.',
      recommendation: '',
    });
  }

  // Tap targets check
  if (!mobileData.tapTargetsAdequate) {
    checks.push({
      id: 'mobile-tap-targets',
      category: 'mobile',
      name: 'Tap Targets',
      description: 'Some tap targets may be too small',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 6,
      details: 'Some interactive elements may be difficult to tap on mobile.',
      recommendation: 'Ensure tap targets are at least 44x44 pixels.',
    });
  } else {
    checks.push({
      id: 'mobile-tap-targets',
      category: 'mobile',
      name: 'Tap Targets',
      description: 'Tap targets appear adequate',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Interactive elements appear appropriately sized.',
      recommendation: '',
    });
  }

  // Mobile friendliness overall
  if (!mobileData.isMobileFriendly) {
    checks.push({
      id: 'mobile-friendly',
      category: 'mobile',
      name: 'Mobile Friendly',
      description: 'Page may not be mobile-friendly',
      status: 'warning',
      severity: 'high',
      scoreImpact: 10,
      details: `${mobileData.issues.length} mobile usability issues detected.`,
      recommendation: 'Review mobile usability and implement responsive design.',
    });
  } else {
    checks.push({
      id: 'mobile-friendly',
      category: 'mobile',
      name: 'Mobile Friendly',
      description: 'Page appears mobile-friendly',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Page appears to be mobile-friendly.',
      recommendation: '',
    });
  }

  // Add specific issues as individual checks
  mobileData.issues.forEach((issue, index) => {
    checks.push({
      id: `mobile-issue-${index}`,
      category: 'mobile',
      name: 'Mobile Issue',
      description: issue,
      status: 'info',
      severity: 'medium',
      scoreImpact: 2,
      details: issue,
      recommendation: 'Review and address this mobile usability issue.',
    });
  });

  return checks;
}
