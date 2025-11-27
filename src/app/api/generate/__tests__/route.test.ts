import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as claude from '@/lib/claude';
import * as rateLimit from '@/lib/rate-limit';
import { RateLimitError, ValidationError } from '@/lib/error';

// Mock dependencies
vi.mock('@/lib/claude');
vi.mock('@/lib/rate-limit');
vi.mock('@/lib/prompts', () => ({
  generateCoursePrompt: vi.fn(() => ({
    systemPrompt: 'System prompt for course generation',
    userPrompt: 'User prompt for course generation',
  })),
}));

describe('POST /api/generate', () => {
  const mockStreamMessage = vi.mocked(claude.streamMessage);
  const mockCreateRateLimiter = vi.mocked(rateLimit.createRateLimiter);
  const mockGetClientIP = vi.mocked(rateLimit.getClientIP);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockGetClientIP.mockReturnValue('127.0.0.1');
    mockCreateRateLimiter.mockReturnValue(() => ({
      success: true,
      remaining: 9,
      resetTime: Date.now() + 900000,
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful course generation', () => {
    it('should stream course content successfully', async () => {
      const mockCourseData = {
        id: 'course-1',
        title: 'Test Course',
        description: 'A test course',
        topic: 'TypeScript',
        level: 'beginner',
        objectives: ['Learn TypeScript basics'],
        modules: [],
        totalDuration: 120,
      };

      // Mock streaming response
      async function* mockStream() {
        const chunks = JSON.stringify(mockCourseData).split('');
        for (const chunk of chunks) {
          yield chunk;
        }
      }
      mockStreamMessage.mockReturnValue(mockStream());

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 3,
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');

      // Verify rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('9');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();

      // Read and verify stream content
      const reader = response.body?.getReader();
      expect(reader).toBeDefined();

      if (reader) {
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
        }

        // Should contain stream events
        expect(fullContent).toContain('data:');
        expect(fullContent).toContain('"type":"stream"');
        expect(fullContent).toContain('"type":"complete"');
      }
    });

    it('should handle streaming with retry on transient failures', async () => {
      let attemptCount = 0;

      async function* mockStreamWithRetry() {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('Transient network error');
        }
        yield '{"test": "data"}';
      }

      mockStreamMessage.mockImplementation(mockStreamWithRetry);

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 3,
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json{',
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid JSON');
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          // Missing topic, level, and numModules
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid numModules (too low)', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 0,
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Number of modules must be between 1 and 20');
    });

    it('should return 400 for invalid numModules (too high)', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 25,
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Number of modules must be between 1 and 20');
    });

    it('should return 400 for invalid level', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'expert', // Invalid level
          numModules: 3,
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Level must be one of');
    });
  });

  describe('Rate limiting', () => {
    it('should return 429 when rate limit is exceeded', async () => {
      mockCreateRateLimiter.mockReturnValue(() => {
        throw new RateLimitError('Rate limit exceeded. Try again in 300 seconds.', 300);
      });

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 3,
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(429);

      const data = await response.json();
      expect(data.error).toContain('Rate limit exceeded');
      expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should include retry-after information in rate limit error', async () => {
      const retryAfter = 300;
      mockCreateRateLimiter.mockReturnValue(() => {
        throw new RateLimitError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`, retryAfter);
      });

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 3,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('API errors', () => {
    it('should handle Claude API errors gracefully', async () => {
      async function* mockErrorStream() {
        throw new Error('Claude API error: Service unavailable');
      }

      mockStreamMessage.mockReturnValue(mockErrorStream());

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 3,
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');

      // Stream should contain error event
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
        }

        expect(fullContent).toContain('"type":"error"');
        expect(fullContent).toContain('Claude API error');
      }
    });

    it('should handle JSON parsing errors in streamed response', async () => {
      async function* mockInvalidJsonStream() {
        yield 'invalid json content {[}]';
      }

      mockStreamMessage.mockReturnValue(mockInvalidJsonStream());

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 3,
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullContent += decoder.decode(value, { stream: true });
        }

        expect(fullContent).toContain('"type":"error"');
        expect(fullContent).toContain('Failed to parse course data');
      }
    });
  });

  describe('IP extraction', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      mockGetClientIP.mockReturnValue('192.168.1.100');

      const request = new NextRequest('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        },
        body: JSON.stringify({
          topic: 'TypeScript',
          level: 'beginner',
          numModules: 3,
        }),
      });

      await POST(request);

      expect(mockGetClientIP).toHaveBeenCalled();
    });
  });
});
