import { AuditCheck, Recommendation } from '@/types/audit';

/**
 * Generate prioritized recommendations from audit checks
 */
export function generateRecommendations(checks: AuditCheck[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const recommendationMap = new Map<string, Recommendation>();

  // Group related checks into recommendations
  checks.forEach(check => {
    // Skip passed and info checks
    if (check.status === 'passed' || check.status === 'info') {
      return;
    }

    // Create or update recommendation
    const recId = generateRecommendationId(check);
    
    if (!recommendationMap.has(recId)) {
      const priority = getPriority(check.severity, check.status);
      const recommendation: Recommendation = {
        id: recId,
        priority,
        title: generateRecommendationTitle(check),
        problem: check.details,
        impact: generateImpactDescription(check),
        solution: check.recommendation,
        category: check.category,
        relatedChecks: [check.id],
      };
      recommendationMap.set(recId, recommendation);
    } else {
      const existing = recommendationMap.get(recId)!;
      existing.relatedChecks.push(check.id);
    }
  });

  // Convert map to array and sort by priority
  recommendations.push(...Array.from(recommendationMap.values()));

  // Sort by priority (high -> medium -> low) and then by score impact
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Within same priority, sort by related checks count (more issues = higher priority)
    return b.relatedChecks.length - a.relatedChecks.length;
  });

  return recommendations;
}

/**
 * Generate recommendation ID from check
 */
function generateRecommendationId(check: AuditCheck): string {
  return `rec-${check.id}`;
}

/**
 * Generate recommendation title
 */
function generateRecommendationTitle(check: AuditCheck): string {
  const prefixes: Record<string, string> = {
    failed: 'Fix:',
    warning: 'Improve:',
    info: 'Consider:',
    passed: '',
  };

  return `${prefixes[check.status]} ${check.name}`;
}

/**
 * Generate impact description
 */
function generateImpactDescription(check: AuditCheck): string {
  const impacts: Record<string, Record<string, string>> = {
    seo: {
      critical: 'This issue can severely impact your search engine rankings and visibility.',
      high: 'This issue can significantly affect your search engine performance.',
      medium: 'This issue may reduce your search engine optimization effectiveness.',
      low: 'This issue has a minor impact on SEO but should be addressed for best practices.',
    },
    performance: {
      critical: 'This issue severely impacts page load speed and user experience.',
      high: 'This issue significantly affects page performance and user experience.',
      medium: 'This issue may slow down your website and affect user experience.',
      low: 'This issue has a minor impact on performance but can be optimized.',
    },
    accessibility: {
      critical: 'This issue makes your website inaccessible to many users.',
      high: 'This issue significantly impacts accessibility for users with disabilities.',
      medium: 'This issue may affect accessibility for some users.',
      low: 'This issue has a minor impact on accessibility but should be improved.',
    },
    technical: {
      critical: 'This is a critical technical issue that affects website functionality.',
      high: 'This technical issue can significantly affect your website.',
      medium: 'This technical issue should be addressed for better website quality.',
      low: 'This is a minor technical issue that can be optimized.',
    },
    bestPractices: {
      critical: 'This violates critical web development best practices.',
      high: 'This violates important web development best practices.',
      medium: 'This goes against recommended web development practices.',
      low: 'This is a minor best practice consideration.',
    },
    mobile: {
      critical: 'This issue makes your website unusable on mobile devices.',
      high: 'This issue significantly affects mobile user experience.',
      medium: 'This issue may impact mobile usability.',
      low: 'This is a minor mobile usability consideration.',
    },
  };

  return impacts[check.category]?.[check.severity] || 'This issue affects website quality.';
}

/**
 * Get priority based on severity and status
 */
function getPriority(severity: string, status: string): 'high' | 'medium' | 'low' {
  if (status === 'failed') {
    if (severity === 'critical' || severity === 'high') {
      return 'high';
    } else if (severity === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  if (status === 'warning') {
    if (severity === 'critical' || severity === 'high') {
      return 'high';
    } else if (severity === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  return 'low';
}

/**
 * Format recommendations for display
 */
export function formatRecommendationsForDisplay(
  recommendations: Recommendation[]
): {
  high: Recommendation[];
  medium: Recommendation[];
  low: Recommendation[];
} {
  return {
    high: recommendations.filter(r => r.priority === 'high'),
    medium: recommendations.filter(r => r.priority === 'medium'),
    low: recommendations.filter(r => r.priority === 'low'),
  };
}
