import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  createRetryWrapper,
  DEFAULT_RETRY_CONFIG,
  API_RETRY_CONFIG,
  BACKGROUND_JOB_RETRY_CONFIG,
  CRITICAL_RETRY_CONFIG,
} from '../retry';
import { TimeoutError, APIError } from '../error';

describe('Retry Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('withRetry', () => {
    describe('Successful execution', () => {
      it('should execute function successfully on first attempt', async () => {
        const mockFn = vi.fn().mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
        });

        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it('should return result from async function', async () => {
        const mockFn = vi.fn().mockResolvedValue({ data: 'test', count: 42 });

        const promise = withRetry(mockFn, {
          maxRetries: 2,
          baseDelay: 500,
          maxDelay: 5000,
        });

        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toEqual({ data: 'test', count: 42 });
      });
    });

    describe('Retry on failure', () => {
      it('should retry on failure and succeed on second attempt', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('First attempt failed'))
          .mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: false,
        });

        const result = await vi.runAllTimersAsync().then(() => promise);

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      it('should retry multiple times before succeeding', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('Attempt 1 failed'))
          .mockRejectedValueOnce(new Error('Attempt 2 failed'))
          .mockRejectedValueOnce(new Error('Attempt 3 failed'))
          .mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: false,
        });

        const result = await vi.runAllTimersAsync().then(() => promise);

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
      });

      it('should throw error after exhausting all retries', async () => {
        const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'));

        const promise = withRetry(mockFn, {
          maxRetries: 2,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: false,
        });

        await vi.runAllTimersAsync();
        await expect(promise).rejects.toThrow('Always fails');

        expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });
    });

    describe('Exponential backoff', () => {
      it('should apply exponential backoff delays', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('Fail 1'))
          .mockRejectedValueOnce(new Error('Fail 2'))
          .mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
          useJitter: false,
        });

        const result = await vi.runAllTimersAsync().then(() => promise);

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(3);
      });

      it('should cap delay at maxDelay', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('Fail 1'))
          .mockRejectedValueOnce(new Error('Fail 2'))
          .mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 10000,
          maxDelay: 15000,
          backoffMultiplier: 2,
          useJitter: false,
        });

        const result = await vi.runAllTimersAsync().then(() => promise);

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(3);
      });

      it('should apply custom backoff multiplier', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('Fail 1'))
          .mockRejectedValueOnce(new Error('Fail 2'))
          .mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 50000,
          backoffMultiplier: 3, // Triple each time
          useJitter: false,
        });

        const result = await vi.runAllTimersAsync().then(() => promise);

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(3);
      });
    });

    describe('shouldRetry callback', () => {
      it('should use custom shouldRetry function', async () => {
        const mockFn = vi.fn().mockRejectedValue(new Error('CUSTOM_ERROR'));

        const shouldRetry = vi.fn().mockReturnValue(false);

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          shouldRetry,
        });

        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow('CUSTOM_ERROR');
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error), 0);
      });

      it('should retry only for specific error types', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new TimeoutError('Timeout', 5000))
          .mockRejectedValue(new Error('Normal error'));

        const shouldRetry = (error: Error) => error instanceof TimeoutError;

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          shouldRetry,
          useJitter: false,
        });

        await vi.runAllTimersAsync();

        // Should retry timeout, then fail on normal error
        await expect(promise).rejects.toThrow('Normal error');
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      it('should not retry on non-retryable errors', async () => {
        const mockFn = vi.fn().mockRejectedValue(new Error('Client error'));

        const shouldRetry = (error: Error) => error.message.includes('timeout');

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          shouldRetry,
        });

        await vi.runAllTimersAsync();

        await expect(promise).rejects.toThrow('Client error');
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    describe('onRetry callback', () => {
      it('should call onRetry before each retry', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('Fail 1'))
          .mockRejectedValueOnce(new Error('Fail 2'))
          .mockResolvedValue('success');

        const onRetry = vi.fn();

        const promise = withRetry(mockFn, {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: false,
          onRetry,
        });

        await vi.runAllTimersAsync().then(() => promise);

        expect(onRetry).toHaveBeenCalledTimes(2);
        expect(onRetry).toHaveBeenNthCalledWith(
          1,
          expect.any(Error),
          1,
          expect.any(Number)
        );
        expect(onRetry).toHaveBeenNthCalledWith(
          2,
          expect.any(Error),
          2,
          expect.any(Number)
        );
      });

      it('should provide error, attempt number, and delay to onRetry', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('First error'))
          .mockResolvedValue('success');

        const onRetry = vi.fn();

        const promise = withRetry(mockFn, {
          maxRetries: 2,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: false,
          onRetry,
        });

        await vi.runAllTimersAsync().then(() => promise);

        expect(onRetry).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'First error' }),
          1,
          1000
        );
      });
    });

    describe('Timeout functionality', () => {
      it('should timeout if function takes too long', async () => {
        const mockFn = vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(resolve, 100000); // Very long operation
            })
        );

        const promise = withRetry(mockFn, {
          maxRetries: 0,
          baseDelay: 1000,
          maxDelay: 10000,
          timeout: 5000,
        });

        await vi.advanceTimersByTimeAsync(5000);

        await expect(promise).rejects.toThrow(TimeoutError);
        await expect(promise).rejects.toThrow('Operation timed out after 5000ms');
      });

      it('should not timeout if function completes in time', async () => {
        const mockFn = vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve('success'), 1000);
            })
        );

        const promise = withRetry(mockFn, {
          maxRetries: 0,
          baseDelay: 1000,
          maxDelay: 10000,
          timeout: 5000,
        });

        await vi.advanceTimersByTimeAsync(1000);
        const result = await promise;

        expect(result).toBe('success');
      });
    });

    describe('Default retry behavior', () => {
      it('should retry on TimeoutError by default', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new TimeoutError('Timeout', 5000))
          .mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 2,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: false,
        });

        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      it('should retry on APIError by default', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new APIError('API failed', 'TestAPI'))
          .mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 2,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: false,
        });

        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      it('should retry on network errors by default', async () => {
        const networkErrors = [
          'ECONNREFUSED',
          'ECONNRESET',
          'ETIMEDOUT',
          'ENOTFOUND',
          'ENETUNREACH',
          'EAI_AGAIN',
        ];

        for (const errorCode of networkErrors) {
          const mockFn = vi
            .fn()
            .mockRejectedValueOnce(new Error(`Network error: ${errorCode}`))
            .mockResolvedValue('success');

          const promise = withRetry(mockFn, {
            maxRetries: 2,
            baseDelay: 100,
            maxDelay: 1000,
            useJitter: false,
          });

          await vi.runAllTimersAsync();
          await promise;

          expect(mockFn).toHaveBeenCalledTimes(2);
          vi.clearAllMocks();
        }
      });
    });

    describe('Jitter functionality', () => {
      it('should add jitter when useJitter is true', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('Fail'))
          .mockResolvedValue('success');

        const promise = withRetry(mockFn, {
          maxRetries: 1,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: true,
        });

        const result = await vi.runAllTimersAsync().then(() => promise);

        expect(result).toBe('success');
        expect(mockFn).toHaveBeenCalledTimes(2);
      });

      it('should not add jitter when useJitter is false', async () => {
        const mockFn = vi
          .fn()
          .mockRejectedValueOnce(new Error('Fail'))
          .mockResolvedValue('success');

        const onRetry = vi.fn();

        const promise = withRetry(mockFn, {
          maxRetries: 1,
          baseDelay: 1000,
          maxDelay: 10000,
          useJitter: false,
          onRetry,
        });

        await vi.runAllTimersAsync().then(() => promise);

        // Should get exact baseDelay
        expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, 1000);
      });
    });
  });

  describe('createRetryWrapper', () => {
    it('should create reusable retry function', async () => {
      const retry = createRetryWrapper({
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000,
      });

      const mockFn1 = vi.fn().mockResolvedValue('result1');
      const mockFn2 = vi.fn().mockResolvedValue('result2');

      const promise1 = retry(mockFn1);
      const promise2 = retry(mockFn2);

      await vi.runAllTimersAsync();

      expect(await promise1).toBe('result1');
      expect(await promise2).toBe('result2');
    });
  });

  describe('Predefined configurations', () => {
    it('should have correct DEFAULT_RETRY_CONFIG', () => {
      expect(DEFAULT_RETRY_CONFIG).toEqual({
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        useJitter: true,
        timeout: 60000,
      });
    });

    it('should have correct API_RETRY_CONFIG', () => {
      expect(API_RETRY_CONFIG).toEqual({
        maxRetries: 3,
        baseDelay: 500,
        maxDelay: 5000,
        backoffMultiplier: 2,
        useJitter: true,
        timeout: 30000,
      });
    });

    it('should have correct BACKGROUND_JOB_RETRY_CONFIG', () => {
      expect(BACKGROUND_JOB_RETRY_CONFIG).toEqual({
        maxRetries: 5,
        baseDelay: 2000,
        maxDelay: 60000,
        backoffMultiplier: 2,
        useJitter: true,
      });
    });

    it('should have correct CRITICAL_RETRY_CONFIG', () => {
      expect(CRITICAL_RETRY_CONFIG).toEqual({
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        useJitter: true,
        timeout: 120000,
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle maxRetries=0', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'));

      const promise = withRetry(mockFn, {
        maxRetries: 0,
        baseDelay: 1000,
        maxDelay: 10000,
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Always fails');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle non-Error rejections', async () => {
      const mockFn = vi.fn().mockRejectedValue('string error');

      const promise = withRetry(mockFn, {
        maxRetries: 1,
        baseDelay: 1000,
        maxDelay: 10000,
        useJitter: false,
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('string error');
    });

    it('should handle synchronous throws', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      const promise = withRetry(mockFn, {
        maxRetries: 1,
        baseDelay: 1000,
        maxDelay: 10000,
        useJitter: false,
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Sync error');
    });
  });
});
