import type { CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { AccessibilityAnalysisResult, AuditCheck } from '@/types/audit';

/**
 * Analyze accessibility factors
 */
export function analyzeAccessibility($: CheerioAPI): AccessibilityAnalysisResult {
  // Images without alt
  const images = $('img');
  let imagesWithoutAlt = 0;
  images.each((_: number, el: Element) => {
    const alt = $(el).attr('alt');
    if (alt === undefined) {
      imagesWithoutAlt++;
    }
  });

  // Language attribute
  const hasLang = Boolean($('html').attr('lang'));

  // Viewport
  const hasViewport = $('meta[name="viewport"]').length > 0;

  // Form labels
  const forms = $('input, select, textarea').not('[type="hidden"]').not('[type="submit"]').not('[type="button"]');
  let formsMissingLabels = 0;
  forms.each((_: number, el: Element) => {
    const id = $(el).attr('id');
    const ariaLabel = $(el).attr('aria-label');
    const ariaLabelledby = $(el).attr('aria-labelledby');
    const title = $(el).attr('title');
    
    const hasLabel = id && $(`label[for="${id}"]`).length > 0;
    const hasAriaLabel = Boolean(ariaLabel || ariaLabelledby || title);
    
    if (!hasLabel && !hasAriaLabel) {
      formsMissingLabels++;
    }
  });

  // Heading structure
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const h4Count = $('h4').length;
  const h5Count = $('h5').length;
  const h6Count = $('h6').length;
  
  // Valid if starts with H1 and doesn't skip levels
  const headingStructureValid = h1Count >= 1 && h1Count <= 1;

  // Skip link
  const hasSkipLink = $('a[href^="#"]').first().text().toLowerCase().includes('skip');

  // ARIA issues (basic detection)
  const ariaIssues: string[] = [];
  
  // Check for ARIA roles on inappropriate elements
  $('[role="button"]').each((_: number, el: Element) => {
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'div' || tagName === 'span') {
      ariaIssues.push('role="button" used on non-interactive element');
      return false; // break after first finding
    }
  });

  // Check for missing button labels
  $('button').each((_: number, el: Element) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr('aria-label');
    if (!text && !ariaLabel) {
      ariaIssues.push('Button without accessible label');
      return false;
    }
  });

  return {
    imagesWithoutAlt,
    hasLang,
    hasViewport,
    formsMissingLabels,
    headingStructureValid,
    hasSkipLink,
    ariaIssues,
  };
}

/**
 * Generate accessibility audit checks
 */
export function generateAccessibilityChecks(a11yData: AccessibilityAnalysisResult): AuditCheck[] {
  const checks: AuditCheck[] = [];

  // Images alt text
  if (a11yData.imagesWithoutAlt > 0) {
    const severity: 'critical' | 'high' = a11yData.imagesWithoutAlt > 10 ? 'critical' : 'high';
    checks.push({
      id: 'a11y-images-alt',
      category: 'accessibility',
      name: 'Image Alt Text',
      description: 'Images missing alt attributes',
      status: 'failed',
      severity,
      scoreImpact: Math.min(a11yData.imagesWithoutAlt * 3, 20),
      details: `${a11yData.imagesWithoutAlt} images are missing alt attributes.`,
      recommendation: 'Add alt attributes to all images. Use descriptive text for meaningful images and empty alt="" for decorative images.',
    });
  } else {
    checks.push({
      id: 'a11y-images-alt',
      category: 'accessibility',
      name: 'Image Alt Text',
      description: 'All images have alt attributes',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'All images have alt attributes.',
      recommendation: '',
    });
  }

  // Language attribute
  if (!a11yData.hasLang) {
    checks.push({
      id: 'a11y-lang',
      category: 'accessibility',
      name: 'HTML Language',
      description: 'HTML language attribute missing',
      status: 'failed',
      severity: 'high',
      scoreImpact: 15,
      details: 'The html element does not have a lang attribute.',
      recommendation: 'Add a lang attribute to the html element (e.g., <html lang="en">).',
    });
  } else {
    checks.push({
      id: 'a11y-lang',
      category: 'accessibility',
      name: 'HTML Language',
      description: 'HTML language attribute present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'HTML language attribute is set.',
      recommendation: '',
    });
  }

  // Viewport
  if (!a11yData.hasViewport) {
    checks.push({
      id: 'a11y-viewport',
      category: 'accessibility',
      name: 'Viewport Meta Tag',
      description: 'Viewport meta tag missing',
      status: 'failed',
      severity: 'high',
      scoreImpact: 7,
      details: 'No viewport meta tag found.',
      recommendation: 'Add a viewport meta tag for responsive design and accessibility.',
    });
  } else {
    checks.push({
      id: 'a11y-viewport',
      category: 'accessibility',
      name: 'Viewport Meta Tag',
      description: 'Viewport meta tag present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Viewport meta tag is configured.',
      recommendation: '',
    });
  }

  // Form labels
  if (a11yData.formsMissingLabels > 0) {
    checks.push({
      id: 'a11y-form-labels',
      category: 'accessibility',
      name: 'Form Labels',
      description: 'Form inputs missing labels',
      status: 'failed',
      severity: 'high',
      scoreImpact: Math.min(a11yData.formsMissingLabels * 5, 20),
      details: `${a11yData.formsMissingLabels} form inputs are missing accessible labels.`,
      recommendation: 'Associate labels with form inputs using for/id attributes or aria-label.',
    });
  }

  // Heading structure
  if (!a11yData.headingStructureValid) {
    checks.push({
      id: 'a11y-heading-structure',
      category: 'accessibility',
      name: 'Heading Structure',
      description: 'Heading structure issues',
      status: 'warning',
      severity: 'medium',
      scoreImpact: 10,
      details: 'Page should have one H1 and proper heading hierarchy.',
      recommendation: 'Use a single H1 and maintain proper heading order (H1 → H2 → H3).',
    });
  } else {
    checks.push({
      id: 'a11y-heading-structure',
      category: 'accessibility',
      name: 'Heading Structure',
      description: 'Heading structure is good',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Page has proper heading structure.',
      recommendation: '',
    });
  }

  // Skip link
  if (!a11yData.hasSkipLink) {
    checks.push({
      id: 'a11y-skip-link',
      category: 'accessibility',
      name: 'Skip Link',
      description: 'Skip navigation link not found',
      status: 'info',
      severity: 'low',
      scoreImpact: 2,
      details: 'No skip navigation link detected.',
      recommendation: 'Add a skip navigation link for keyboard users.',
    });
  } else {
    checks.push({
      id: 'a11y-skip-link',
      category: 'accessibility',
      name: 'Skip Link',
      description: 'Skip navigation link present',
      status: 'passed',
      severity: 'low',
      scoreImpact: 0,
      details: 'Skip navigation link detected.',
      recommendation: '',
    });
  }

  // ARIA issues
  if (a11yData.ariaIssues.length > 0) {
    checks.push({
      id: 'a11y-aria',
      category: 'accessibility',
      name: 'ARIA Usage',
      description: 'ARIA usage issues detected',
      status: 'warning',
      severity: 'medium',
      scoreImpact: Math.min(a11yData.ariaIssues.length * 3, 12),
      details: `${a11yData.ariaIssues.length} ARIA issues found.`,
      recommendation: 'Review ARIA implementation for proper usage.',
    });
  }

  // Add disclaimer check
  checks.push({
    id: 'a11y-disclaimer',
    category: 'accessibility',
    name: 'Accessibility Note',
    description: 'Automated screening only',
    status: 'info',
    severity: 'low',
    scoreImpact: 0,
    details: 'This is an automated accessibility screening and is not a complete WCAG audit.',
    recommendation: 'Consider a manual accessibility audit and user testing for complete compliance.',
  });

  return checks;
}
