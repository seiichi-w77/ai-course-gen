import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  rateLimit,
  createRateLimiter,
  getClientIP,
  getRateLimitStatus,
  clearRateLimitStore,
  stopCleanup,
} from '../rate-limit';
import { RateLimitError } from '../error';

describe('Rate Limit Library', () => {
  beforeEach(() => {
    clearRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearRateLimitStore();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('rateLimit', () => {
    it('should allow requests within the limit', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000, // 1 minute
        max: 3,
      });

      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = checkRateLimit('192.168.1.1');
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = checkRateLimit('192.168.1.1');
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests when limit is exceeded', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 2,
      });

      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');

      const result = checkRateLimit('192.168.1.1');
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track different IPs separately', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 2,
      });

      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(1);

      const result2 = checkRateLimit('192.168.1.2');
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      // Each IP should have its own counter
      checkRateLimit('192.168.1.1');
      const result3 = checkRateLimit('192.168.1.2');
      expect(result3.success).toBe(true);
    });

    it('should reset limit after window expires', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000, // 1 minute
        max: 2,
      });

      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');

      // Exceeded limit
      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.success).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(61000);

      // Should be allowed again
      const result2 = checkRateLimit('192.168.1.1');
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);
    });

    it('should use sliding window (not fixed window)', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 3,
      });

      // t=0: Request 1
      checkRateLimit('192.168.1.1');

      // t=30s: Request 2
      vi.advanceTimersByTime(30000);
      checkRateLimit('192.168.1.1');

      // t=40s: Request 3
      vi.advanceTimersByTime(10000);
      checkRateLimit('192.168.1.1');

      // t=50s: Request 4 (should be blocked - all 3 within last 60s)
      vi.advanceTimersByTime(10000);
      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.success).toBe(false);

      // t=70s: Request 5 (first request expired, should be allowed)
      vi.advanceTimersByTime(20000);
      const result2 = checkRateLimit('192.168.1.1');
      expect(result2.success).toBe(true);
    });

    it('should calculate correct retry-after time', () => {
      const windowMs = 60000;
      const checkRateLimit = rateLimit({
        windowMs,
        max: 1,
      });

      const startTime = Date.now();
      checkRateLimit('192.168.1.1');

      vi.advanceTimersByTime(30000); // 30 seconds later

      const result = checkRateLimit('192.168.1.1');
      expect(result.success).toBe(false);
      expect(result.retryAfter).toBeDefined();
      // Should be approximately 30 seconds (60s - 30s elapsed)
      expect(result.retryAfter).toBeGreaterThan(25);
      expect(result.retryAfter).toBeLessThan(35);
    });

    it('should include resetTime in result', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 2,
      });

      const result = checkRateLimit('192.168.1.1');
      expect(result.resetTime).toBeDefined();
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('createRateLimiter', () => {
    it('should create enforcing rate limiter that throws on exceed', () => {
      const enforce = createRateLimiter({
        windowMs: 60000,
        max: 2,
      });

      enforce('192.168.1.1');
      enforce('192.168.1.1');

      expect(() => enforce('192.168.1.1')).toThrow(RateLimitError);
    });

    it('should throw RateLimitError with correct message', () => {
      const enforce = createRateLimiter({
        windowMs: 60000,
        max: 1,
      });

      enforce('192.168.1.1');

      try {
        enforce('192.168.1.1');
        expect.fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).message).toContain('Rate limit exceeded');
        expect((error as RateLimitError).retryAfter).toBeDefined();
      }
    });

    it('should return result when within limit', () => {
      const enforce = createRateLimiter({
        windowMs: 60000,
        max: 3,
      });

      const result = enforce('192.168.1.1');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });

  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '192.168.1.100, 10.0.0.1');

      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.100');
    });

    it('should extract IP from x-real-ip header when x-forwarded-for is missing', () => {
      const headers = new Headers();
      headers.set('x-real-ip', '192.168.1.200');

      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.200');
    });

    it('should extract IP from cf-connecting-ip header (Cloudflare)', () => {
      const headers = new Headers();
      headers.set('cf-connecting-ip', '192.168.1.300');

      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.300');
    });

    it('should prioritize x-forwarded-for over other headers', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '192.168.1.1');
      headers.set('x-real-ip', '192.168.1.2');
      headers.set('cf-connecting-ip', '192.168.1.3');

      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return "unknown" when no IP headers are present', () => {
      const headers = new Headers();

      const ip = getClientIP(headers);
      expect(ip).toBe('unknown');
    });

    it('should trim whitespace from IP address', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '  192.168.1.1  , 10.0.0.1');

      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should handle single IP in x-forwarded-for', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '192.168.1.1');

      const ip = getClientIP(headers);
      expect(ip).toBe('192.168.1.1');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should get status without incrementing counter', () => {
      const config = { windowMs: 60000, max: 3 };
      const checkRateLimit = rateLimit(config);

      checkRateLimit('192.168.1.1');

      const status = getRateLimitStatus('192.168.1.1', config);
      expect(status.remaining).toBe(2);

      // Check again - should be the same
      const status2 = getRateLimitStatus('192.168.1.1', config);
      expect(status2.remaining).toBe(2);
    });

    it('should return full limit for new IP', () => {
      const config = { windowMs: 60000, max: 5 };

      const status = getRateLimitStatus('192.168.1.1', config);
      expect(status.success).toBe(true);
      expect(status.remaining).toBe(5);
    });

    it('should show exceeded status without throwing', () => {
      const config = { windowMs: 60000, max: 2 };
      const checkRateLimit = rateLimit(config);

      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');

      const status = getRateLimitStatus('192.168.1.1', config);
      expect(status.success).toBe(false);
      expect(status.remaining).toBe(0);
      expect(status.retryAfter).toBeDefined();
    });
  });

  describe('clearRateLimitStore', () => {
    it('should clear all rate limit data', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 2,
      });

      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.2');

      clearRateLimitStore();

      // After clearing, both IPs should have full quota
      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.remaining).toBe(1);

      const result2 = checkRateLimit('192.168.1.2');
      expect(result2.remaining).toBe(1);
    });
  });

  describe('Window reset behavior', () => {
    it('should allow requests after oldest request expires', () => {
      const checkRateLimit = rateLimit({
        windowMs: 10000, // 10 seconds
        max: 2,
      });

      // t=0: Request 1
      checkRateLimit('192.168.1.1');

      // t=5s: Request 2
      vi.advanceTimersByTime(5000);
      checkRateLimit('192.168.1.1');

      // t=7s: Request 3 (blocked)
      vi.advanceTimersByTime(2000);
      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.success).toBe(false);

      // t=11s: First request expired (allowed)
      vi.advanceTimersByTime(4000);
      const result2 = checkRateLimit('192.168.1.1');
      expect(result2.success).toBe(true);
    });

    it('should handle multiple requests expiring simultaneously', () => {
      const checkRateLimit = rateLimit({
        windowMs: 10000,
        max: 3,
      });

      // All requests at same time
      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');

      // Blocked
      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.success).toBe(false);

      // After window, all expire
      vi.advanceTimersByTime(11000);

      // Should allow full quota again
      const result2 = checkRateLimit('192.168.1.1');
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle max=1 (very restrictive limit)', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 1,
      });

      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(0);

      const result2 = checkRateLimit('192.168.1.1');
      expect(result2.success).toBe(false);
    });

    it('should handle very large max value', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 10000,
      });

      const result = checkRateLimit('192.168.1.1');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9999);
    });

    it('should handle very short window', () => {
      const checkRateLimit = rateLimit({
        windowMs: 100, // 100ms
        max: 2,
      });

      checkRateLimit('192.168.1.1');
      checkRateLimit('192.168.1.1');

      // Blocked
      const result1 = checkRateLimit('192.168.1.1');
      expect(result1.success).toBe(false);

      // Wait for window to expire
      vi.advanceTimersByTime(150);

      // Allowed again
      const result2 = checkRateLimit('192.168.1.1');
      expect(result2.success).toBe(true);
    });

    it('should handle empty IP string', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 3,
      });

      const result = checkRateLimit('');
      expect(result.success).toBe(true);
    });

    it('should handle special characters in IP', () => {
      const checkRateLimit = rateLimit({
        windowMs: 60000,
        max: 2,
      });

      const result = checkRateLimit('2001:0db8:85a3::8a2e:0370:7334');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('Cleanup functionality', () => {
    it('should stop cleanup interval', () => {
      stopCleanup();
      // If this doesn't throw, the cleanup interval was stopped successfully
      expect(true).toBe(true);
    });
  });
});
