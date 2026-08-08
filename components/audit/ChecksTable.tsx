'use client';

import { useState } from 'react';
import { AuditCheck } from '@/types/audit';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ChevronDown, ChevronRight, X } from 'lucide-react';

interface ChecksTableProps {
  checks: AuditCheck[];
}

export default function ChecksTable({ checks }: ChecksTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-navy-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'info':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-navy-100 text-navy-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-navy-100 text-navy-700';
      default:
        return 'bg-navy-100 text-navy-700';
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-2">
      {checks.map((check) => {
        const isExpanded = expandedId === check.id;
        return (
          <div key={check.id} className="border border-navy-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => toggleExpanded(check.id)}
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
                <div className="flex-shrink-0">{getStatusIcon(check.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-navy-900">{check.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(check.status)}`}>
                      {check.status}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-navy-500">Impact</div>
                  <div className="font-semibold text-navy-900">-{check.scoreImpact}</div>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 pt-2 bg-navy-25 border-t border-navy-200">
                <div className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900 mb-1">What is this?</h4>
                    <p className="text-sm text-navy-700">{check.description}</p>
                  </div>

                  {/* Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900 mb-1">Current Status</h4>
                    <div className="flex items-start gap-2">
                      <span className={`font-medium ${getStatusColor(check.status)}`}>
                        {check.status === 'passed' && '✓ Passed'}
                        {check.status === 'warning' && '⚠ Warning'}
                        {check.status === 'failed' && '✗ Failed'}
                        {check.status === 'info' && 'ℹ Info'}
                      </span>
                      <span className="text-sm text-navy-700">—</span>
                      <p className="text-sm text-navy-700 flex-1">{check.details}</p>
                    </div>
                  </div>

                  {/* Severity */}
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900 mb-1">Severity</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSeverityBadge(check.severity)}`}>
                      {check.severity.toUpperCase()}
                    </span>
                  </div>

                  {/* Recommendation */}
                  {check.recommendation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        How to Fix
                      </h4>
                      <p className="text-sm text-blue-800">{check.recommendation}</p>
                    </div>
                  )}

                  {/* Documentation Link */}
                  {check.documentationUrl && (
                    <div>
                      <a
                        href={check.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 underline"
                      >
                        Learn more about this check →
                      </a>
                    </div>
                  )}

                  {/* Category */}
                  <div className="text-xs text-navy-500 border-t border-navy-200 pt-3">
                    Category: <span className="font-medium text-navy-700">{getCategoryLabel(check.category)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
