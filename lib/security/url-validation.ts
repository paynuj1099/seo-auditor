import { z } from 'zod';

/**
 * URL Validation Schema
 * Only allows http:// and https:// protocols
 */
export const urlSchema = z.string()
  .url('Please enter a valid URL')
  .refine((url) => {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  }, 'Only HTTP and HTTPS protocols are allowed');

/**
 * Validate and normalize a URL
 */
export function validateUrl(url: string): { valid: boolean; url?: string; error?: string } {
  try {
    // Basic validation
    const result = urlSchema.safeParse(url);
    if (!result.success) {
      return { valid: false, error: result.error.errors[0]?.message || 'Invalid URL' };
    }

    // Normalize URL
    const parsed = new URL(url);
    const normalizedUrl = parsed.toString();

    return { valid: true, url: normalizedUrl };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Extract hostname from URL
 */
export function getHostname(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if URL is using HTTPS
 */
export function isHttps(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
