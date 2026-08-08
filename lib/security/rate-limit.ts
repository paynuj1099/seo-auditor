/**
 * Simple in-memory rate limiter for MVP
 * Can be replaced with Redis/Upstash for production
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (will be lost on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes default

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Get client identifier from request
 * Uses IP address as identifier
 */
function getClientId(req: Request): string {
  // Try to get real IP from headers (for deployments behind proxies)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(req: Request): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
} {
  const clientId = getClientId(req);
  const now = Date.now();

  let entry = rateLimitStore.get(clientId);

  // Create new entry if doesn't exist or is expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
    rateLimitStore.set(clientId, entry);
  }

  // Increment count
  entry.count++;

  const allowed = entry.count <= MAX_REQUESTS;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    limit: MAX_REQUESTS,
  };
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(limit: number, remaining: number, resetTime: number): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': resetTime.toString(),
  };
}

/**
 * Production recommendations:
 * 
 * For production deployment, replace this in-memory implementation with:
 * 
 * 1. Upstash Redis (recommended for serverless):
 *    - Install: npm install @upstash/redis @upstash/ratelimit
 *    - Use: Ratelimit from @upstash/ratelimit
 * 
 * 2. Redis:
 *    - Install: npm install ioredis
 *    - Use sliding window or token bucket algorithm
 * 
 * 3. Cloudflare Rate Limiting:
 *    - Configure at CDN level
 *    - More robust for DDoS protection
 */
