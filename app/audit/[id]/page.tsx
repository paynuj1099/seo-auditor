'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuditResult } from '@/types/audit';
import { 
  Loader2, 
  Home, 
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import ScoreCircle from '@/components/audit/ScoreCircle';
import CategoryScoreCard from '@/components/audit/CategoryScoreCard';
import ChecksTable from '@/components/audit/ChecksTable';
import RecommendationsList from '@/components/audit/RecommendationsList';
import ScreenshotPreview from '@/components/audit/ScreenshotPreview';
import PageDetails from '@/components/audit/PageDetails';
import RadarChart from '@/components/audit/RadarChart';

export default function AuditResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromBrowserStorage = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const serialized = window.localStorage.getItem(`siteaudit-ai:audit:${params.id}`);
    if (!serialized) {
      return null;
    }

    try {
      return JSON.parse(serialized) as AuditResult;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await fetch(`/api/audit/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Audit not found');
        }

        const data = await response.json();
        setAudit(data);
        setError(null);
      } catch (err) {
        // Try localStorage as fallback
        const storedAudit = loadFromBrowserStorage();

        if (storedAudit) {
          console.log('Loaded audit from localStorage:', storedAudit.id);
          setAudit(storedAudit);
          setError(null);
          return;
        }

        console.error('Failed to load audit:', err);
        setError(err instanceof Error ? err.message : 'Failed to load audit');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-navy-600">Loading audit results...</p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Audit Not Found</h1>
          <p className="text-navy-600 mb-6">
            This audit doesn't exist or has expired.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="bg-white border-b border-navy-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-navy-600 hover:text-navy-900 transition-colors"
              >
                <Home className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-navy-900">Audit Report</h1>
                <p className="text-sm text-navy-600 truncate">{audit.url}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg hover:bg-navy-50 transition-colors text-sm font-medium"
              >
                Run New Audit
              </button>
              <a
                href={audit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg hover:bg-navy-50 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Site
              </a>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Audit Results Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Audit Results</h1>
          <p className="text-navy-600">
            This report grades your website based on key SEO factors, including On-Page Optimization, Technical SEO, Performance, and more. Get a clear <b>A+ to F- grade</b> that highlights your website’s strengths, weaknesses, and opportunities for improvement.

          </p>
        </div>

        {/* Overall Score & Category Scores Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 overflow-hidden">
          {/* Top Section: Score + Device Mockups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Left: Overall Score */}
            <div className="flex flex-col items-center justify-center">
              <ScoreCircle score={audit.scores.overall} size="large" showLetterGrade />
              <p className="text-xl font-semibold text-navy-600 mt-6">
                {audit.scores.overall >= 75 ? 'Your page could be better' : 'Your page needs improvement'}
              </p>
              <button
                onClick={() => {
                  document.getElementById('recommendations-section')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
                className="flex items-center gap-2 mt-4 px-5 py-2.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">Recommendations: {audit.recommendations.length}</span>
              </button>
            </div>

            {/* Right: Device Mockups */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-2xl">
                {/* Desktop Preview (background) */}
                <div className="relative z-0">
                  <div className="bg-white rounded-lg shadow-2xl border border-navy-200 overflow-hidden">
                    {/* Browser Chrome */}
                    <div className="bg-gray-200 px-3 py-1.5 flex items-center gap-2 border-b border-gray-300">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-2 py-0.5 text-xs text-navy-600 truncate ml-1">
                        {audit.url}
                      </div>
                    </div>
                    {/* Screen with Live Preview */}
                    <div className="bg-white overflow-hidden relative" style={{ height: '320px' }}>
                      <iframe
                        src={audit.url}
                        className="w-full h-full border-0"
                        style={{ 
                          transform: 'scale(0.25)',
                          transformOrigin: 'top left',
                          width: '400%',
                          height: '400%',
                          pointerEvents: 'none'
                        }}
                        title={`Live preview of ${audit.url}`}
                        sandbox="allow-same-origin allow-scripts"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Mobile Preview (foreground, overlapping) */}
                <div className="absolute bottom-0 right-0 z-10 transform translate-x-4 translate-y-4">
                  <div className="relative w-32 h-64 bg-gray-900 rounded-3xl p-1.5 shadow-2xl">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-gray-900 rounded-b-xl z-10"></div>
                    {/* Screen with Live Preview */}
                    <div className="w-full h-full bg-white rounded-[1.25rem] overflow-hidden relative">
                      <iframe
                        src={audit.url}
                        className="border-0"
                        scrolling="no"
                        style={{ 
                          transform: 'scale(0.22)',
                          transformOrigin: 'top left',
                          width: '455%',
                          height: '455%',
                          pointerEvents: 'none',
                          overflow: 'hidden'
                        }}
                        title={`Mobile preview of ${audit.url}`}
                        sandbox="allow-same-origin allow-scripts"
                      />
                    </div>
                    {/* Home indicator */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Scores with Radar Chart */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center overflow-x-auto">
            {/* Left: 5 Category Circles in single row */}
            <div className="flex flex-wrap lg:flex-nowrap justify-center gap-4 flex-shrink-0">
              <CategoryScoreCard
                title="On-Page SEO"
                score={audit.scores.seo}
                icon="search"
              />
              <CategoryScoreCard
                title="Technical"
                score={audit.scores.technical}
                icon="shield"
              />
              <CategoryScoreCard
                title="Links"
                score={audit.scores.links}
                icon="globe"
              />
              <CategoryScoreCard
                title="Usability"
                score={audit.scores.usability}
                icon="smartphone"
              />
              <CategoryScoreCard
                title="Performance"
                score={audit.scores.performance}
                icon="zap"
              />
            </div>
            
            {/* Right: Radar Chart */}
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="w-[350px] h-[200px]">
                <RadarChart scores={audit.scores} />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {audit.recommendations.length > 0 && (
          <div id="recommendations-section" className="bg-white rounded-xl shadow-lg p-8 mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-navy-900 mb-8">Recommendations</h2>
            <RecommendationsList recommendations={audit.recommendations} />
          </div>
        )}

        {/* All Checks */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-navy-900 mb-8">Detailed Checks</h2>
          <ChecksTable checks={audit.checks} />
        </div>

        {/* Page Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-navy-900 mb-8">Page Details</h2>
          <PageDetails details={audit.pageDetails} performance={audit.performance} />
        </div>

        {/* New Audit CTA */}
        <div className="text-center py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg shadow-lg"
          >
            Run Another Audit
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-navy-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-navy-600 text-sm">
            <p>© {new Date().getFullYear()} SiteAudit AI. Free website auditing platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
