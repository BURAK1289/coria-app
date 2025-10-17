/**
 * Audit Logger for Foundation Applications
 *
 * Logs application submissions for compliance (KVKK/GDPR) and security monitoring.
 * Data retention: 24 months as per compliance requirements.
 *
 * Logs include:
 * - Hashed IP and email (privacy-preserving)
 * - Application metadata
 * - Timestamps
 * - Storage references
 */

import * as fs from 'fs';
import * as path from 'path';
import { hashIp } from './rate-limiter';

// Configuration
const AUDIT_ENABLED = process.env.AUDIT_LOGGING !== 'false';
const AUDIT_DIR = process.env.AUDIT_LOG_DIR || path.join(process.cwd(), 'logs');
const AUDIT_FILE = 'foundation-applications.jsonl';

// Audit log entry interface
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  ipHash: string;
  emailHash: string;
  projectName: string;
  category: string;
  orgType: string;
  country: string;
  budgetRequested: number;
  filesCount: number;
  storageRefs?: string[];
  status: 'submitted' | 'failed' | 'spam_detected';
  errorMessage?: string;
}

/**
 * Initialize audit logging directory
 */
function ensureAuditDir(): void {
  if (!AUDIT_ENABLED) return;

  try {
    if (!fs.existsSync(AUDIT_DIR)) {
      fs.mkdirSync(AUDIT_DIR, { recursive: true });
      console.log(`[Audit] Created audit log directory: ${AUDIT_DIR}`);
    }
  } catch (error) {
    console.error('[Audit] Failed to create audit directory:', error);
  }
}

/**
 * Hash email address for privacy
 */
function hashEmail(email: string): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(email.toLowerCase() + (process.env.AUDIT_SALT || 'coria-audit-salt'))
    .digest('hex')
    .substring(0, 16);
}

/**
 * Generate unique application ID
 */
export function generateApplicationId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `CORIA-${timestamp}-${randomPart}`.toUpperCase();
}

/**
 * Log application submission
 */
export async function logApplication(data: {
  id: string;
  ip: string;
  email: string;
  projectName: string;
  category: string;
  orgType: string;
  country: string;
  budgetRequested: number;
  filesCount: number;
  storageRefs?: string[];
  status: 'submitted' | 'failed' | 'spam_detected';
  errorMessage?: string;
}): Promise<void> {
  if (!AUDIT_ENABLED) {
    console.log('[Audit] Logging disabled, skipping');
    return;
  }

  try {
    ensureAuditDir();

    const logEntry: AuditLogEntry = {
      id: data.id,
      timestamp: new Date().toISOString(),
      ipHash: hashIp(data.ip),
      emailHash: hashEmail(data.email),
      projectName: data.projectName,
      category: data.category,
      orgType: data.orgType,
      country: data.country,
      budgetRequested: data.budgetRequested,
      filesCount: data.filesCount,
      storageRefs: data.storageRefs,
      status: data.status,
      errorMessage: data.errorMessage,
    };

    // Write as JSONL (JSON Lines) format
    const logLine = JSON.stringify(logEntry) + '\n';
    const logFilePath = path.join(AUDIT_DIR, AUDIT_FILE);

    await fs.promises.appendFile(logFilePath, logLine, 'utf-8');

    console.log(`[Audit] Logged application: ${data.id} - ${data.status}`);
  } catch (error) {
    console.error('[Audit] Failed to log application:', error);
    // Don't throw - audit logging failures shouldn't break the application flow
  }
}

/**
 * Query audit logs (admin use)
 */
export async function queryAuditLogs(filters?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  if (!AUDIT_ENABLED) {
    throw new Error('Audit logging is disabled');
  }

  try {
    const logFilePath = path.join(AUDIT_DIR, AUDIT_FILE);

    if (!fs.existsSync(logFilePath)) {
      return [];
    }

    const content = await fs.promises.readFile(logFilePath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);

    let entries: AuditLogEntry[] = lines.map(line => JSON.parse(line));

    // Apply filters
    if (filters) {
      if (filters.startDate) {
        entries = entries.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        entries = entries.filter(e => e.timestamp <= filters.endDate!);
      }
      if (filters.category) {
        entries = entries.filter(e => e.category === filters.category);
      }
      if (filters.status) {
        entries = entries.filter(e => e.status === filters.status);
      }
      if (filters.limit) {
        entries = entries.slice(-filters.limit);
      }
    }

    return entries;
  } catch (error) {
    console.error('[Audit] Failed to query audit logs:', error);
    throw error;
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(): Promise<{
  totalApplications: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byCountry: Record<string, number>;
}> {
  const entries = await queryAuditLogs();

  const stats = {
    totalApplications: entries.length,
    byCategory: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    byCountry: {} as Record<string, number>,
  };

  entries.forEach(entry => {
    // Count by category
    stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;

    // Count by status
    stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;

    // Count by country
    stats.byCountry[entry.country] = (stats.byCountry[entry.country] || 0) + 1;
  });

  return stats;
}

/**
 * Clean up old audit logs (GDPR/KVKK compliance - 24 months retention)
 */
export async function cleanupOldLogs(): Promise<number> {
  if (!AUDIT_ENABLED) {
    return 0;
  }

  try {
    const entries = await queryAuditLogs();
    const retentionDate = new Date();
    retentionDate.setMonth(retentionDate.getMonth() - 24); // 24 months ago

    const recentEntries = entries.filter(
      e => new Date(e.timestamp) > retentionDate
    );

    const removedCount = entries.length - recentEntries.length;

    if (removedCount > 0) {
      // Rewrite log file with only recent entries
      const logFilePath = path.join(AUDIT_DIR, AUDIT_FILE);
      const content = recentEntries.map(e => JSON.stringify(e)).join('\n') + '\n';
      await fs.promises.writeFile(logFilePath, content, 'utf-8');

      console.log(`[Audit] Removed ${removedCount} expired log entries`);
    }

    return removedCount;
  } catch (error) {
    console.error('[Audit] Failed to cleanup old logs:', error);
    throw error;
  }
}

// Initialize audit directory on module load
if (AUDIT_ENABLED && typeof window === 'undefined') {
  ensureAuditDir();
}
