import { AuditResult } from '@/types/audit';

// In-memory storage for audit results (will be lost on server restart)
// For production, replace with a database like PostgreSQL, MongoDB, or Redis
const auditStore = new Map<string, StoredAudit>();

// TTL for audit results (1 hour)
const AUDIT_TTL = 60 * 60 * 1000;

interface StoredAudit {
  result: AuditResult;
  expiresAt: number;
}

/**
 * Store an audit result
 */
export function storeAudit(result: AuditResult): void {
  const stored: StoredAudit = {
    result,
    expiresAt: Date.now() + AUDIT_TTL,
  };
  auditStore.set(result.id, stored);
}

/**
 * Get an audit result by ID
 */
export function getAudit(id: string): AuditResult | null {
  const stored = auditStore.get(id);
  
  if (!stored) {
    return null;
  }

  // Check if expired
  if (Date.now() > stored.expiresAt) {
    auditStore.delete(id);
    return null;
  }

  return stored.result;
}

/**
 * Clean up expired audits
 */
function cleanupExpiredAudits(): void {
  const now = Date.now();
  for (const [id, stored] of auditStore.entries()) {
    if (now > stored.expiresAt) {
      auditStore.delete(id);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredAudits, 5 * 60 * 1000);
