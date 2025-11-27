/**
 * Retry logic with exponential backoff
 * Automatically retries failed operations with increasing delays
 */

import { TimeoutError, APIError } from './error';

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds before first retry */
  baseDelay: number;
  /** Maximum delay in milliseconds between retries */
  maxDelay: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Add random jitter to delays (default: true) */
  useJitter?: boolean;
  /** Timeout for each attempt in milliseconds (optional) */
  timeout?: number;
  /** Custom function to determine if an error should be retried */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** Callback function called before each retry */
  onRetry?: (error: Error, attempt: number, nextDelay: number) => void;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: Required<
  Omit<RetryConfig, 'onRetry' | 'shouldRetry'>
> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  useJitter: true,
  timeout: 60000, // 60 seconds
};

/**
 * Calculate the next delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  useJitter: boolean
): number {
  // Calculate exponential delay: baseDelay * (multiplier ^ attempt)
  let delay = baseDelay * Math.pow(backoffMultiplier, attempt);

  // Cap at maxDelay
  delay = Math.min(delay, maxDelay);

  // Add jitter (random ±25%) to prevent thundering herd
  if (useJitter) {
    const jitter = delay * 0.25;
    delay = delay - jitter + Math.random() * (jitter * 2);
  }

  return Math.floor(delay);
}

/**
 * Default function to determine if an error should be retried
 */
function defaultShouldRetry(error: Error): boolean {
  // Retry on network errors, timeouts, and 5xx server errors
  if (error instanceof TimeoutError) {
    return true;
  }

  if (error instanceof APIError) {
    return true;
  }

  // Check for common network error messages
  const networkErrors = [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ENETUNREACH',
    'EAI_AGAIN',
  ];

  return networkErrors.some((code) => error.message.includes(code));
}

/**
 * Sleep for the specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with a timeout
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`, timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/**
 * Retry an async function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param config - Retry configuration
 * @returns The result of the function call
 * @throws The last error if all retries fail
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => {
 *     return await fetchData();
 *   },
 *   {
 *     maxRetries: 3,
 *     baseDelay: 1000,
 *     maxDelay: 10000,
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  const {
    maxRetries,
    baseDelay,
    maxDelay,
    backoffMultiplier = DEFAULT_RETRY_CONFIG.backoffMultiplier,
    useJitter = DEFAULT_RETRY_CONFIG.useJitter,
    timeout,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = config;

  let lastError: Error;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // Execute the function with optional timeout
      const promise = fn();
      const result = timeout ? await withTimeout(promise, timeout) : await promise;
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (!shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Check if we've exhausted all retries
      if (attempt >= maxRetries) {
        throw lastError;
      }

      // Calculate next delay
      const delay = calculateDelay(
        attempt,
        baseDelay,
        maxDelay,
        backoffMultiplier,
        useJitter
      );

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt + 1, delay);
      }

      // Wait before retrying
      await sleep(delay);

      attempt++;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Create a retry wrapper function with preset configuration
 *
 * @example
 * ```typescript
 * const retryFetch = createRetryWrapper({
 *   maxRetries: 3,
 *   baseDelay: 1000,
 *   maxDelay: 10000,
 * });
 *
 * const data = await retryFetch(() => fetchData());
 * ```
 */
export function createRetryWrapper(config: RetryConfig) {
  return async function retry<T>(fn: () => Promise<T>): Promise<T> {
    return withRetry(fn, config);
  };
}

/**
 * Retry configuration for API calls
 * More aggressive retries with shorter delays
 */
export const API_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 500,
  maxDelay: 5000,
  backoffMultiplier: 2,
  useJitter: true,
  timeout: 30000,
};

/**
 * Retry configuration for background jobs
 * Longer delays and more retries
 */
export const BACKGROUND_JOB_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 60000,
  backoffMultiplier: 2,
  useJitter: true,
};

/**
 * Retry configuration for critical operations
 * Maximum retries with extended timeouts
 */
export const CRITICAL_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  useJitter: true,
  timeout: 120000,
};
