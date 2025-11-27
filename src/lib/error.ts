/**
 * Custom error classes for structured error handling
 * Provides specific error types with HTTP status codes for API responses
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Rate limit exceeded error
 * Thrown when a client exceeds the allowed request rate
 */
export class RateLimitError extends AppError {
  constructor(
    message = 'Too many requests. Please try again later.',
    public retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Validation error
 * Thrown when request data fails validation
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message, 'VALIDATION_ERROR', 400);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

/**
 * API error
 * Thrown when an external API call fails
 */
export class APIError extends AppError {
  constructor(
    message: string,
    public service?: string,
    public originalError?: Error
  ) {
    super(message, 'API_ERROR', 502);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      service: this.service,
      originalMessage: this.originalError?.message,
    };
  }
}

/**
 * Authentication error
 * Thrown when authentication fails or is required
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Not found error
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string, public resource?: string) {
    super(message, 'NOT_FOUND', 404);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
    };
  }
}

/**
 * Timeout error
 * Thrown when an operation exceeds its time limit
 */
export class TimeoutError extends AppError {
  constructor(message = 'Operation timed out', public timeoutMs?: number) {
    super(message, 'TIMEOUT', 408);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      timeoutMs: this.timeoutMs,
    };
  }
}

/**
 * Check if an error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert any error to a standardized format
 */
export function normalizeError(error: unknown): {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
} {
  if (isAppError(error)) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      details: error.stack,
    };
  }

  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    details: String(error),
  };
}
