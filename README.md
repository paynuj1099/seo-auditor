# SEO Auditor

A comprehensive website auditing MVP built with Next.js and TypeScript. Analyzes websites across 8 critical categories and provides actionable recommendations with professional SEOptimer-style UI.

## Features

### 8 Audit Categories
- **SEO** - On-page optimization (title, meta, headings, structured data, canonical tags)
- **Performance** - Speed metrics (response time, compression, resource optimization)
- **Accessibility** - WCAG compliance (alt text, ARIA, forms, color contrast, heading structure)
- **Technical** - Technical SEO (HTTPS, robots.txt, sitemap, security headers, HTTP status)
- **Best Practices** - Modern web standards (deprecated HTML, inline styles, doctype)
- **Mobile** - Mobile optimization (viewport, responsive design, touch targets)
- **Usability** - User experience (viewport config, font sizes, tap targets, Flash, iFrames, Favicon)
- **Links** - Link analysis (internal/external links, anchor text, nofollow usage, backlinks, URL structure)

### Professional UI
- **Letter Grades** - A+ to F grading system with realistic score thresholds
- **Radar Chart** - Pentagon visualization of 5 main categories
- **Category Cards** - Circular progress indicators for all 8 categories
- **Device Mockups** - Browser and iPhone frames with real screenshots
- **Expandable Details** - Click to view detailed check information and how-to-fix instructions
- **Priority Badges** - High/Medium/Low priority recommendations with color coding
- **Smooth Scroll** - Clickable recommendations that scroll to details

### Scoring System
- **Deduction Model** - Start at 100, subtract points for failed checks
- **Weighted Categories** - SEO (25%), Performance (20%), Usability (15%), Accessibility (10%), Technical (10%), Best Practices (10%), Mobile (5%), Links (5%)
- **Realistic Grading** - A+ ≥95, A ≥90, B ≥75, C ≥60, D ≥45, F <45
- **Impact-Based** - Critical issues: 25-30 points, High: 15-22 points, Medium: 8-15 points, Low: 3-8 points

## Tech Stack

- **Next.js 14.2.5** - App Router, TypeScript, Server Components
- **Tailwind CSS** - Custom navy color scheme, responsive design
- **Playwright** - Chromium browser automation for screenshots
- **Cheerio** - Fast HTML parsing and DOM manipulation
- **Recharts** - Interactive radar charts
- **Lucide React** - Modern icon system
- **Zod** - Request validation

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and submit a URL such as `https://example.com`.

## Environment Variables

Copy `.env.example` to `.env.local` and adjust as needed.

- `NEXT_PUBLIC_APP_URL` - Canonical site URL used by robots/sitemap
- `RATE_LIMIT_MAX_REQUESTS` - Simple in-memory rate limit threshold
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds
- `SCREENSHOT_STORAGE_PATH` - Local screenshot output path
- `PLAYWRIGHT_TIMEOUT` - Browser navigation timeout
- `PLAYWRIGHT_MAX_SCREENSHOT_HEIGHT` - Safety cap for full-page screenshots

## Architecture

### Routes

- `app/page.tsx` - Landing page and audit form.
- `app/audit/[id]/page.tsx` - Audit report page.
- `app/api/audit/route.ts` - Audit API entry point.
- `app/api/audit/[id]/route.ts` - Fetch a stored audit result.
- `app/robots.ts` - Robots metadata.
- `app/sitemap.ts` - Sitemap metadata.

### Audit Engine

The audit pipeline lives in `lib/audit/` and is split into focused modules:

- **`index.ts`** - Main orchestrator that runs all audits and generates final report
- **`crawler.ts`** - Fetches HTML, headers, response time, and document metrics with SSRF protection
- **`seo.ts`** - Title, meta description, H1/H2/H3 headings, canonical tags, image alt text, structured data (JSON-LD, Open Graph), language attributes
- **`performance.ts`** - Response time analysis, compression detection, HTML size, resource count, JavaScript file optimization
- **`accessibility.ts`** - Image alt text, form labels, ARIA attributes, heading structure, language declaration
- **`technical.ts`** - HTTPS enforcement, HTTP status codes, robots.txt/sitemap, security headers (CSP, X-Frame-Options), robots meta tags
- **`mobile.ts`** - Viewport meta tag, responsive design, touch targets
- **`usability.ts`** - Viewport configuration, language attributes, font sizes (<10px), tap targets (<30px), content width, Flash detection, iFrame count, Favicon presence, email privacy (plain text emails)
- **`links.ts`** - Internal link count (≥10 recommended), external link count (≥3 recommended), anchor text quality, nofollow usage, backlink potential, URL friendliness (query params, underscores)
- **`best-practices.ts`** - HTTPS usage, deprecated HTML tags, inline styles, doctype declaration
- **`scoring.ts`** - Deduction-based scoring model with weighted categories and realistic grade thresholds
- **`recommendations.ts`** - Converts failed/warning checks into prioritized recommendations with problem/impact/solution details

### Screenshot System

Playwright captures two real screenshots per audit:

- **Desktop:** `1440 x 900` viewport (Chromium browser)
- **Mobile:** `390 x 844` viewport (iPhone 12 Pro user agent)

Screenshots are full-page captures with a safety cap on page height to avoid runaway resource usage. The storage layer currently writes locally to `public/screenshots/` with PNG format, but the code is structured so it can be swapped to Vercel Blob, AWS S3, or Cloudflare R2 later.

### UI Components

- **`ScoreCircle.tsx`** - Reusable circular score display with letter grades
- **`CategoryScoreCard.tsx`** - Individual category scores with circular progress
- **`RadarChart.tsx`** - Pentagon visualization using Recharts
- **`ChecksTable.tsx`** - Expandable accordion for detailed check results with status icons
- **`RecommendationsList.tsx`** - Expandable accordion for actionable recommendations with problem/impact/solution
- **`ScreenshotPreview.tsx`** - Loading states, error handling, image optimization
- **`PageDetails.tsx`** - URL, HTML size, load time, resource counts

## Security

The backend includes SSRF protection that blocks:

- `localhost`
- private IP ranges
- loopback addresses
- c URL is validated before fetch and revalidated after redirects. The crawler also applies request timeouts and size limits.

## Rate Limiting

The MVP uses a simple in-memory rate limiter. It is intentionally easy to replace with Upstash Redis, Redis, or Cloudflare rate limiting in production.

## loud metadata endpoints
- non-HTTP schemes

TheScoring Details

### Grade Thresholds
- **A+** - 95-100 (Excellent)
- **A** - 90-94 (Very Good)
- **B** - 75-89 (Good)
- **C** - 60-74 (Average)
- **D** - 45-59 (Below Average)
- **F** - 0-44 (Poor)

### Score Impact Guidelines
Failed checks deduct points based on severity:
- **Critical** - 25-30 points (e.g., no HTTPS, 404 errors)
- **High Priority** - 15-22 points (e.g., missing title, slow response time)
- **Medium Priority** - 8-15 points (e.g., missing meta description, no compression)
- **Low Priority** - 3-8 points (e.g., inline styles, missing alt text)

Warning status deducts 50% of the scoreImpact value.

### Category Weights
Final overall score is calculated as weighted average:
- SEO: 25%
- Performance: 20%
- Usability: 15%
- ADeployment Notes

- Vercel works well for the landing page and API routes
- Playwright screenshot generation can be sensitive in serverless environments
- For production scale, a dedicated worker for screenshot jobs is recommended
- Railway or Render are good options when you want a long-lived Node process for browser work

## Future SaaS Enhancements

The project is intentionally structured for easy expansion:

- **Authentication** - NextAuth.js or Clerk integration
- **User Accounts** - Dashboard, saved audits, audit history
- **Scheduled Audits** - Cron jobs for recurring checks
- **PDF Reports** - Export functionality with branded PDFs
- **Competitor Comparison** - Side-by-side analysis
- **Historical Tracking** - Score trends over time
- **Webhooks** - Notify when scores change
- **API Access** - RESTful API for integrations
- **White Label** - Custom branding for agencies
- **Usage Limits** - Rate limiting per user/tier
- **Stripe Subscriptions** - Payment integration
- **Background Workers** - Queue system for heavy tasks
- **Database** - Persistent storage for audit history

## MVP Notes

- No login required
- No payment flow implemented
- No database required
- In-memory storage for audits (lost on server restart)
- Simple rate limiting (in-memory, not distributed)
- If a signal cannot be measured reliably, the UI shows `Not available` rather than inventing a value
## Notes

- No login is required.
- No payment flow is implemented.
- No database is required for the MVP.
- If a signal cannot be measured reliably, the UI should show `Not available` rather than inventing a value.
