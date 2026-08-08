import Navigation from '@/components/landing/Navigation';
import AuditForm from '@/components/landing/AuditForm';
import { 
  Search, 
  Zap, 
  CheckCircle, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Globe, 
  TrendingUp,
  Eye,
  Gauge
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-navy-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-navy-900 mb-6 leading-tight">
              Audit Your Website.
              <br />
              <span className="text-primary-600">Fix What Matters.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-navy-600 mb-12 max-w-3xl mx-auto">
              Get a complete SEO, performance, accessibility, technical, and mobile website audit in seconds.
            </p>
            <div id="audit">
              <AuditForm />
            </div>
          </div>

          {/* Preview Cards */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-navy-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Overall Score</h3>
              <p className="text-navy-600">Get an instant health score for your website</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-navy-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Visual Preview</h3>
              <p className="text-navy-600">Desktop and mobile screenshots included</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-navy-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-2">Actionable Tips</h3>
              <p className="text-navy-600">Prioritized recommendations to improve</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Comprehensive Website Analysis</h2>
            <p className="text-xl text-navy-600 max-w-2xl mx-auto">
              Our audit checks everything that matters for a high-quality website
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* On-Page SEO */}
            <div className="p-8 bg-navy-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-4">On-Page SEO</h3>
              <p className="text-navy-600 mb-4">
                Comprehensive SEO checks including titles, meta descriptions, headings, canonical URLs, and more.
              </p>
              <ul className="space-y-2 text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Title and meta tags</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Heading structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Image alt text</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Structured data</span>
                </li>
              </ul>
            </div>

            {/* Performance */}
            <div className="p-8 bg-navy-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-4">Performance</h3>
              <p className="text-navy-600 mb-4">
                Analyze page speed, resource counts, compression, and caching to optimize load times.
              </p>
              <ul className="space-y-2 text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Response time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Page size analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Compression check</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Resource optimization</span>
                </li>
              </ul>
            </div>

            {/* Usability */}
            <div className="p-8 bg-navy-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-4">Usability</h3>
              <p className="text-navy-600 mb-4">
                Verify mobile-friendliness with viewport checks and mobile usability analysis.
              </p>
              <ul className="space-y-2 text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Viewport configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Tap target sizes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Font sizes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mobile preview</span>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div className="p-8 bg-navy-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-4">Links</h3>
              <p className="text-navy-600 mb-4">
                Analyze backlinks, internal/external link structure, and anchor text quality.
              </p>
              <ul className="space-y-2 text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Internal link structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>External links</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Anchor text quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Nofollow usage</span>
                </li>
              </ul>
            </div>

            {/* Technical */}
            <div className="p-8 bg-navy-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-4">Technical</h3>
              <p className="text-navy-600 mb-4">
                Check technical foundations including HTTPS, canonicals, and indexability.
              </p>
              <ul className="space-y-2 text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>HTTPS & Security</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Robots.txt & Sitemap</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Canonical URLs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Indexability</span>
                </li>
              </ul>
            </div>

            {/* Additional Categories (collapsed into one card) */}
            <div className="p-8 bg-navy-50 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-4">Plus More</h3>
              <p className="text-navy-600 mb-4">
                Additional checks for accessibility, mobile experience, and best practices.
              </p>
              <ul className="space-y-2 text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Accessibility (ARIA, labels)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mobile responsiveness</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Security headers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Modern HTML & best practices</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-navy-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">How It Works</h2>
            <p className="text-xl text-navy-600">Simple, fast, and comprehensive</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Enter Your URL</h3>
              <p className="text-navy-600">
                Enter any publicly accessible website URL into the audit form above.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Run Your Audit</h3>
              <p className="text-navy-600">
                Our system checks SEO, performance, accessibility, technical SEO, and mobile experience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-3">Fix What Matters</h3>
              <p className="text-navy-600">
                Get a prioritized list of issues and actionable recommendations to improve your website.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-navy-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-navy-900 mb-2">Is the audit free?</h3>
              <p className="text-navy-600">
                Yes. The tool is currently free and does not require an account.
              </p>
            </div>

            <div className="bg-navy-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-navy-900 mb-2">Do I need to create an account?</h3>
              <p className="text-navy-600">
                No. You can audit a website without signing up or providing any personal information.
              </p>
            </div>

            <div className="bg-navy-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-navy-900 mb-2">What does the audit check?</h3>
              <p className="text-navy-600">
                Our audit analyzes SEO (titles, meta tags, headings, links), technical SEO (HTTPS, canonicals, sitemaps), 
                performance (response time, compression), accessibility (alt text, labels, ARIA), mobile experience, 
                and best practices.
              </p>
            </div>

            <div className="bg-navy-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-navy-900 mb-2">Why can't some websites be audited?</h3>
              <p className="text-navy-600">
                Some websites block automated crawlers or browsers. Additionally, we block access to private 
                IP addresses and localhost for security reasons.
              </p>
            </div>

            <div className="bg-navy-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-navy-900 mb-2">Is this a complete SEO audit?</h3>
              <p className="text-navy-600">
                This is an automated website audit designed to identify common technical and SEO issues. 
                For a comprehensive audit, manual review and additional tools may be needed.
              </p>
            </div>

            <div className="bg-navy-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-navy-900 mb-2">Can I export my report?</h3>
              <p className="text-navy-600">
                Yes. The report can be printed or saved as a PDF using your browser's print function.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Improve Your Website?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Get your free audit report in seconds. No signup required.
          </p>
          <a
            href="#audit"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-navy-50 transition-colors font-semibold text-lg shadow-xl"
          >
            Audit Your Website Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold">SiteAudit AI</span>
              </div>
              <p className="text-navy-400">Free website auditing platform</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-navy-400">
                © {new Date().getFullYear()} SiteAudit AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
