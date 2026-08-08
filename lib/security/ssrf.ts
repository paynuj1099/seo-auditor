import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

/**
 * Private IP ranges that should be blocked
 */
const PRIVATE_IP_RANGES = [
  // IPv4 private ranges
  /^127\./,                    // Loopback
  /^10\./,                     // Private class A
  /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private class B
  /^192\.168\./,               // Private class C
  /^169\.254\./,               // Link-local
  /^0\.0\.0\.0$/,              // Non-routable
  
  // IPv6 private ranges
  /^::1$/,                     // Loopback
  /^fe80:/,                    // Link-local
  /^fc00:/,                    // Unique local
  /^fd00:/,                    // Unique local
  /^::ffff:127\./,             // IPv4-mapped loopback
];

/**
 * Blocked hostnames
 */
const BLOCKED_HOSTNAMES = [
  'localhost',
  'ip6-localhost',
  'ip6-loopback',
];

/**
 * Cloud metadata endpoints to block
 */
const CLOUD_METADATA_IPS = [
  '169.254.169.254',  // AWS, Azure, GCP
  '100.100.100.200',  // Alibaba Cloud
  'fd00:ec2::254',    // AWS IPv6
];

/**
 * Check if hostname is blocked
 */
function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return BLOCKED_HOSTNAMES.some(blocked => lower === blocked || lower.endsWith(`.${blocked}`));
}

/**
 * Check if IP address is private or blocked
 */
function isPrivateOrBlockedIP(ip: string): boolean {
  // Check cloud metadata endpoints
  if (CLOUD_METADATA_IPS.includes(ip)) {
    return true;
  }

  // Check private IP ranges
  return PRIVATE_IP_RANGES.some(range => range.test(ip));
}

/**
 * Validate URL for SSRF vulnerabilities
 */
export async function validateSSRF(url: string): Promise<{ safe: boolean; reason?: string }> {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Check protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Invalid protocol' };
    }

    // Check for blocked hostnames
    if (isBlockedHostname(hostname)) {
      return { safe: false, reason: 'Access to local resources is not allowed' };
    }

    // Check if hostname is an IP address
    const ipMatch = hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);
    if (ipMatch) {
      if (isPrivateOrBlockedIP(hostname)) {
        return { safe: false, reason: 'Access to private IP addresses is not allowed' };
      }
    }

    // Resolve DNS and check resulting IPs
    try {
      const { address, family } = await lookup(hostname);
      
      // Check if resolved IP is private or blocked
      if (isPrivateOrBlockedIP(address)) {
        return { safe: false, reason: 'Domain resolves to a private IP address' };
      }

      // Additional check for IPv6
      if (family === 6) {
        const lower = address.toLowerCase();
        if (lower.startsWith('fe80:') || lower.startsWith('fc00:') || lower.startsWith('fd00:') || lower === '::1') {
          return { safe: false, reason: 'Domain resolves to a private IPv6 address' };
        }
      }
    } catch (dnsError) {
      // DNS lookup failed - this is okay, we'll let the actual request fail naturally
      // This prevents the audit from failing for legitimate but temporarily unavailable sites
    }

    return { safe: true };
  } catch (error) {
    return { safe: false, reason: 'Invalid URL format' };
  }
}

/**
 * Re-validate URL after redirect
 * Should be called after following redirects to ensure the final URL is also safe
 */
export async function revalidateAfterRedirect(finalUrl: string): Promise<{ safe: boolean; reason?: string }> {
  return validateSSRF(finalUrl);
}
