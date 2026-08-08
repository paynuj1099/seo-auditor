import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateUrl } from '@/lib/security/url-validation';
import { validateSSRF } from '@/lib/security/ssrf';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit';
import { runAudit } from '@/lib/audit';
import { captureDesktopScreenshotSafe } from '@/lib/screenshots/desktop';
import { captureMobileScreenshotSafe } from '@/lib/screenshots/mobile';
import { saveScreenshots } from '@/lib/screenshots/storage';
import { storeAudit } from '@/lib/storage/audit-store';

// Request validation schema
const auditRequestSchema = z.object({
  url: z.string().min(1, 'URL is required'),
});

export async function POST(request: Request) {
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(request);
    const rateLimitHeaders = getRateLimitHeaders(
      rateLimit.limit,
      rateLimit.remaining,
      rateLimit.resetTime
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = auditRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: validation.error.errors[0]?.message || 'Invalid input',
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    const { url } = validation.data;

    // Validate URL format
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid URL',
          message: urlValidation.error || 'Please enter a valid URL',
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    const normalizedUrl = urlValidation.url!;

    // Validate SSRF
    const ssrfCheck = await validateSSRF(normalizedUrl);
    if (!ssrfCheck.safe) {
      return NextResponse.json(
        {
          error: 'Invalid URL',
          message: ssrfCheck.reason || 'This URL cannot be audited',
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    // Run the audit
    const auditResult = await runAudit(normalizedUrl);

    // If audit failed completely, return error
    if (auditResult.status === 'failed') {
      return NextResponse.json(
        {
          error: 'Audit failed',
          message: auditResult.error || 'Failed to audit website',
        },
        {
          status: 500,
          headers: rateLimitHeaders,
        }
      );
    }

    // Capture screenshots in parallel (don't fail the audit if screenshots fail)
    console.log('[Audit API] Starting screenshot capture for:', normalizedUrl);
    const [desktopResult, mobileResult] = await Promise.all([
      captureDesktopScreenshotSafe(normalizedUrl),
      captureMobileScreenshotSafe(normalizedUrl),
    ]);

    console.log('[Audit API] Desktop screenshot:', desktopResult.success ? 'Success' : desktopResult.error);
    console.log('[Audit API] Mobile screenshot:', mobileResult.success ? 'Success' : mobileResult.error);

    // Save screenshots
    const screenshots = await saveScreenshots(
      auditResult.id,
      desktopResult.success ? desktopResult.data : undefined,
      mobileResult.success ? mobileResult.data : undefined
    );

    console.log('[Audit API] Screenshots saved:', screenshots);

    // Add error messages if screenshots failed
    if (!desktopResult.success) {
      screenshots.desktopError = desktopResult.error;
    }
    if (!mobileResult.success) {
      screenshots.mobileError = mobileResult.error;
    }

    // Update audit result with screenshots
    auditResult.screenshots = screenshots;

    // Store audit result for later retrieval
    storeAudit(auditResult);

    // Return successful audit result
    return NextResponse.json(auditResult, {
      status: 200,
      headers: rateLimitHeaders,
    });
  } catch (error) {
    console.error('Audit API error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while auditing the website',
      },
      {
        status: 500,
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
