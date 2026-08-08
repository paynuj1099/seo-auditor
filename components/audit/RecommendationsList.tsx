'use client';

import { useState } from 'react';
import { Recommendation } from '@/types/audit';
import { ChevronDown, ChevronRight, AlertTriangle, Lightbulb, Target } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'High Priority', icon: '🔴' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Priority', icon: '🟡' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Priority', icon: '🟢' };
      default:
        return { bg: 'bg-navy-100', text: 'text-navy-700', label: 'Low Priority', icon: '⚪' };
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      seo: 'On-Page SEO',
      performance: 'Performance',
      accessibility: 'On-Page SEO',      // Merged into SEO
      technical: 'Technical',
      mobile: 'Usability',               // Merged into Usability
      usability: 'Usability',
      links: 'Links',
      bestPractices: 'Technical',        // Merged into Technical
    };
    return labels[category] || category;
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-2">
      {recommendations.map((recommendation) => {
        const badge = getPriorityBadge(recommendation.priority);
        const isExpanded = expandedId === recommendation.id;
        
        return (
          <div key={recommendation.id} className="border border-navy-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => toggleExpanded(recommendation.id)}
              className="w-full p-4 hover:bg-navy-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-navy-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-navy-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-navy-900">{recommendation.title}</h3>
                    <span className="text-xs text-navy-500 px-2 py-0.5 bg-navy-100 rounded">
                      {getCategoryLabel(recommendation.category)}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 rounded-md text-sm font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-2 bg-navy-25 border-t border-navy-200">
                <div className="space-y-4">
                  {/* Problem */}
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      The Problem
                    </h4>
                    <p className="text-sm text-navy-700 pl-6">{recommendation.problem}</p>
                  </div>

                  {/* Impact */}
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-600" />
                      Why It Matters
                    </h4>
                    <p className="text-sm text-navy-700 pl-6">{recommendation.impact}</p>
                  </div>

                  {/* Solution */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      How to Fix It
                    </h4>
                    <p className="text-sm text-blue-800 pl-6">{recommendation.solution}</p>
                  </div>

                  {/* Related Checks */}
                  {recommendation.relatedChecks && recommendation.relatedChecks.length > 0 && (
                    <div className="pt-2 border-t border-navy-200">
                      <h4 className="text-xs font-semibold text-navy-600 mb-2">Related Checks</h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.relatedChecks.map((checkId, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-1 bg-navy-100 text-navy-600 rounded"
                          >
                            {checkId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
