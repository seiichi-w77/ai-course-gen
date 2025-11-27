/**
 * In-memory rate limiting implementation
 * Uses sliding window algorithm to track request rates per IP
 */

import { RateLimitError } from './error';

/**
 * Configuration for rate limiting
 */
export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed within the window */
  max: number;
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** Timestamp when the rate limit will reset (ms since epoch) */
  resetTime: number;
  /** Retry after duration in seconds (only present when success=false) */
  retryAfter?: number;
}

/**
 * Request record for tracking
 */
interface RequestRecord {
  timestamps: number[];
  lastCleanup: number;
}

/**
 * In-memory storage for rate limit tracking
 * Key: IP address, Value: Request record
 */
const store = new Map<string, RequestRecord>();

/**
 * Clean up expired timestamps from a record
 */
function cleanupRecord(record: RequestRecord, windowMs: number): void {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Remove timestamps older than the window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);
  record.lastCleanup = now;
}

/**
 * Clean up old records from the store (run periodically)
 */
function cleanupStore(windowMs: number): void {
  const now = Date.now();
  const cutoff = now - windowMs * 2; // Keep records for 2x the window

  for (const [ip, record] of store.entries()) {
    if (record.lastCleanup < cutoff && record.timestamps.length === 0) {
      store.delete(ip);
    }
  }
}

// Run cleanup every 60 seconds
let cleanupInterval: NodeJS.Timeout | null = null;
if (typeof setInterval !== 'undefined') {
  cleanupInterval = setInterval(() => {
    cleanupStore(60000); // Clean up with 1 minute window
  }, 60000);
}

/**
 * Stop the cleanup interval (useful for testing)
 */
export function stopCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearRateLimitStore(): void {
  store.clear();
}

/**
 * Create a rate limiter function with the specified configuration
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, max } = config;

  /**
   * Check if a request from the given IP is allowed
   * @param ip - IP address of the requester
   * @returns Rate limit result
   * @throws RateLimitError if the rate limit is exceeded
   */
  return function checkRateLimit(ip: string): RateLimitResult {
    const now = Date.now();

    // Get or create record for this IP
    let record = store.get(ip);
    if (!record) {
      record = {
        timestamps: [],
        lastCleanup: now,
      };
      store.set(ip, record);
    }

    // Clean up old timestamps
    cleanupRecord(record, windowMs);

    // Check if limit is exceeded
    const currentCount = record.timestamps.length;

    if (currentCount >= max) {
      // Calculate retry-after time
      const oldestTimestamp = record.timestamps[0];
      const resetTime = oldestTimestamp + windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        success: false,
        remaining: 0,
        resetTime,
        retryAfter,
      };
    }

    // Add current request timestamp
    record.timestamps.push(now);

    // Calculate reset time (when the oldest request will expire)
    const resetTime = record.timestamps[0] + windowMs;

    return {
      success: true,
      remaining: max - record.timestamps.length,
      resetTime,
    };
  };
}

/**
 * Middleware-style rate limiter that throws an error if limit is exceeded
 */
export function createRateLimiter(config: RateLimitConfig) {
  const check = rateLimit(config);

  return function enforce(ip: string): RateLimitResult {
    const result = check(ip);

    if (!result.success) {
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        result.retryAfter
      );
    }

    return result;
  };
}

/**
 * Extract IP address from Next.js request headers
 */
export function getClientIP(headers: Headers): string {
  // Check common headers for real IP (in order of preference)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a default (not ideal for production)
  return 'unknown';
}

/**
 * Get current rate limit status for an IP without incrementing
 */
export function getRateLimitStatus(
  ip: string,
  config: RateLimitConfig
): RateLimitResult {
  const { windowMs, max } = config;
  const now = Date.now();

  const record = store.get(ip);
  if (!record) {
    return {
      success: true,
      remaining: max,
      resetTime: now + windowMs,
    };
  }

  // Clean up old timestamps
  cleanupRecord(record, windowMs);

  const currentCount = record.timestamps.length;
  const remaining = Math.max(0, max - currentCount);

  if (currentCount >= max) {
    const oldestTimestamp = record.timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    return {
      success: false,
      remaining: 0,
      resetTime,
      retryAfter,
    };
  }

  const resetTime = record.timestamps[0]
    ? record.timestamps[0] + windowMs
    : now + windowMs;

  return {
    success: true,
    remaining,
    resetTime,
  };
}
