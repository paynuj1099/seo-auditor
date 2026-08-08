import { AuditCheck, AuditScores, AuditSummary, AuditCategory } from '@/types/audit';

/**
 * Calculate score for a category based on its checks
 */
function calculateCategoryScore(checks: AuditCheck[]): number {
  if (checks.length === 0) return 100;

  let totalDeduction = 0;

  checks.forEach(check => {
    // Only deduct points for failed or warning checks
    if (check.status === 'failed') {
      totalDeduction += check.scoreImpact;
    } else if (check.status === 'warning') {
      // Warnings deduct half the impact
      totalDeduction += check.scoreImpact * 0.5;
    }
    // Passed checks don't deduct anything
  });

  // Start with perfect score and subtract deductions
  const score = Math.max(0, 100 - totalDeduction);

  return Math.round(score);
}

/**
 * Calculate all audit scores
 */
export function calculateScores(checks: AuditCheck[]): AuditScores {
  // Group checks by category
  const checksByCategory = checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<AuditCategory, AuditCheck[]>);

  // Calculate category scores - merging related categories
  // SEO includes accessibility (alt text, ARIA, etc.)
  const seoChecks = [...(checksByCategory.seo || []), ...(checksByCategory.accessibility || [])];
  const seo = calculateCategoryScore(seoChecks);
  
  const performance = calculateCategoryScore(checksByCategory.performance || []);
  
  // Technical includes best practices (security, modern HTML)
  const technicalChecks = [...(checksByCategory.technical || []), ...(checksByCategory.bestPractices || [])];
  const technical = calculateCategoryScore(technicalChecks);
  
  // Usability includes mobile experience
  const usabilityChecks = [...(checksByCategory.usability || []), ...(checksByCategory.mobile || [])];
  const usability = calculateCategoryScore(usabilityChecks);
  
  const links = calculateCategoryScore(checksByCategory.links || []);

  // Calculate weighted overall score with updated weights
  const weights = {
    seo: 0.35,        // 25% + 10% (accessibility)
    performance: 0.20,
    technical: 0.20,  // 10% + 10% (best practices)
    usability: 0.20,  // 15% + 5% (mobile)
    links: 0.05,
  };

  const overall = Math.round(
    seo * weights.seo +
    performance * weights.performance +
    technical * weights.technical +
    usability * weights.usability +
    links * weights.links
  );

  return {
    overall,
    seo,
    performance,
    technical,
    usability,
    links,
  };
}

/**
 * Calculate audit summary
 */
export function calculateSummary(checks: AuditCheck[]): AuditSummary {
  let passed = 0;
  let warnings = 0;
  let failed = 0;
  let critical = 0;

  checks.forEach(check => {
    switch (check.status) {
      case 'passed':
        passed++;
        break;
      case 'warning':
        warnings++;
        break;
      case 'failed':
        failed++;
        break;
      case 'info':
        // Info checks don't count in summary
        break;
    }

    if (check.severity === 'critical') {
      critical++;
    }
  });

  return {
    passed,
    warnings,
    failed,
    critical,
  };
}

/**
 * Get score label and color
 */
export function getScoreLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 90) {
    return {
      label: 'Excellent',
      color: 'green',
      description: 'Your website has excellent technical foundations.',
    };
  } else if (score >= 75) {
    return {
      label: 'Good',
      color: 'blue',
      description: 'Your website has a solid technical foundation, but there are some areas for improvement.',
    };
  } else if (score >= 50) {
    return {
      label: 'Needs Improvement',
      color: 'yellow',
      description: 'Your website has several issues that should be addressed to improve quality.',
    };
  } else {
    return {
      label: 'Poor',
      color: 'red',
      description: 'Your website has significant issues that need immediate attention.',
    };
  }
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'passed':
      return 'green';
    case 'warning':
      return 'yellow';
    case 'failed':
      return 'red';
    case 'info':
      return 'blue';
    default:
      return 'gray';
  }
}
