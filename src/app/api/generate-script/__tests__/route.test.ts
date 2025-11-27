import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as claude from '@/lib/claude';

// Mock dependencies
vi.mock('@/lib/claude');

describe('POST /api/generate-script', () => {
  const mockStreamMessage = vi.mocked(claude.streamMessage);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful script generation', () => {
    it('should stream script content successfully', async () => {
      const mockScriptData = {
        lessonId: 'lesson-1',
        title: 'Introduction to TypeScript',
        language: 'en',
        duration: 10,
        style: 'educational',
        sections: [
          {
            id: 'section_1',
            type: 'introduction',
            title: 'Introduction',
            content: 'Welcome to TypeScript...',
            estimatedTime: 60,
          },
        ],
        estimatedReadingTime: 10,
        wordCount: 1500,
      };

      // Mock streaming response
      async function* mockStream() {
        const chunks = JSON.stringify(mockScriptData).split('');
        for (const chunk of chunks) {
          yield chunk;
        }
      }
      mockStreamMessage.mockReturnValue(mockStream());

      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Introduction to TypeScript',
          lessonContent: 'TypeScript is a typed superset of JavaScript...',
          language: 'en',
          duration: 10,
          style: 'educational',
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');

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

    it('should generate script with formal style', async () => {
      const mockScriptData = {
        lessonId: 'lesson-2',
        title: 'Advanced TypeScript',
        language: 'en',
        duration: 15,
        style: 'formal',
        sections: [
          {
            id: 'section_1',
            type: 'introduction',
            title: 'Introduction',
            content: 'In this lecture, we shall examine...',
            estimatedTime: 120,
          },
        ],
        estimatedReadingTime: 15,
        wordCount: 2250,
      };

      async function* mockStream() {
        yield JSON.stringify(mockScriptData);
      }
      mockStreamMessage.mockReturnValue(mockStream());

      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-2',
          lessonTitle: 'Advanced TypeScript',
          lessonContent: 'Advanced concepts...',
          language: 'en',
          duration: 15,
          style: 'formal',
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(mockStreamMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
          }),
        ]),
        expect.stringContaining('formal')
      );
    });

    it('should generate script with casual style', async () => {
      const mockScriptData = {
        lessonId: 'lesson-3',
        title: 'TypeScript Basics',
        language: 'en',
        duration: 8,
        style: 'casual',
        sections: [
          {
            id: 'section_1',
            type: 'introduction',
            title: 'Introduction',
            content: "Hey folks! Let's dive into TypeScript...",
            estimatedTime: 90,
          },
        ],
        estimatedReadingTime: 8,
        wordCount: 1200,
      };

      async function* mockStream() {
        yield JSON.stringify(mockScriptData);
      }
      mockStreamMessage.mockReturnValue(mockStream());

      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-3',
          lessonTitle: 'TypeScript Basics',
          lessonContent: 'Basics of TypeScript...',
          language: 'en',
          duration: 8,
          style: 'casual',
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(mockStreamMessage).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('casual')
      );
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          // Missing all required fields
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
      expect(data.error).toContain('lessonId');
      expect(data.error).toContain('lessonTitle');
      expect(data.error).toContain('lessonContent');
      expect(data.error).toContain('language');
      expect(data.error).toContain('duration');
      expect(data.error).toContain('style');
    });

    it('should return 400 for partial missing fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test',
          // Missing lessonContent, language, duration, style
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 for invalid style', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test Lesson',
          lessonContent: 'Content here',
          language: 'en',
          duration: 10,
          style: 'conversational', // Invalid style
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid style');
      expect(data.error).toContain('formal, casual, educational');
    });

    it('should return 400 for invalid duration (too low)', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test Lesson',
          lessonContent: 'Content here',
          language: 'en',
          duration: 0, // Invalid duration
          style: 'educational',
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid duration');
      expect(data.error).toContain('between 1 and 240');
    });

    it('should return 400 for invalid duration (too high)', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test Lesson',
          lessonContent: 'Content here',
          language: 'en',
          duration: 300, // Invalid duration (> 240)
          style: 'educational',
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid duration');
      expect(data.error).toContain('between 1 and 240');
    });

    it('should accept valid duration boundary values', async () => {
      const mockScriptData = {
        lessonId: 'lesson-1',
        title: 'Test',
        language: 'en',
        duration: 1,
        style: 'educational',
        sections: [],
        estimatedReadingTime: 1,
        wordCount: 150,
      };

      async function* mockStream() {
        yield JSON.stringify(mockScriptData);
      }
      mockStreamMessage.mockReturnValue(mockStream());

      // Test minimum valid duration (1 minute)
      const request1 = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test Lesson',
          lessonContent: 'Content',
          language: 'en',
          duration: 1,
          style: 'educational',
        }),
      });

      const response1 = await POST(request1);
      expect(response1.status).toBe(200);

      // Test maximum valid duration (240 minutes)
      mockStreamMessage.mockReturnValue(mockStream());
      const request2 = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test Lesson',
          lessonContent: 'Content',
          language: 'en',
          duration: 240,
          style: 'educational',
        }),
      });

      const response2 = await POST(request2);
      expect(response2.status).toBe(200);
    });
  });

  describe('API errors', () => {
    it('should handle Claude API errors gracefully', async () => {
      async function* mockErrorStream() {
        throw new Error('Claude API error: Service unavailable');
      }

      mockStreamMessage.mockReturnValue(mockErrorStream());

      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test Lesson',
          lessonContent: 'Content here',
          language: 'en',
          duration: 10,
          style: 'educational',
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
        expect(fullContent).toContain('Stream error');
      }
    });

    it('should handle JSON parsing errors in streamed response', async () => {
      async function* mockInvalidJsonStream() {
        yield 'invalid json {[}]';
      }

      mockStreamMessage.mockReturnValue(mockInvalidJsonStream());

      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test Lesson',
          lessonContent: 'Content here',
          language: 'en',
          duration: 10,
          style: 'educational',
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
        expect(fullContent).toContain('Failed to parse script data');
      }
    });

    it('should handle script with missing sections', async () => {
      async function* mockInvalidStructureStream() {
        yield JSON.stringify({
          lessonId: 'lesson-1',
          title: 'Test',
          language: 'en',
          duration: 10,
          style: 'educational',
          // Missing sections array
        });
      }

      mockStreamMessage.mockReturnValue(mockInvalidStructureStream());

      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          lessonId: 'lesson-1',
          lessonTitle: 'Test Lesson',
          lessonContent: 'Content here',
          language: 'en',
          duration: 10,
          style: 'educational',
        }),
      });

      const response = await POST(request);

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
        expect(fullContent).toContain('Invalid script structure');
      }
    });
  });

  describe('Request JSON parsing errors', () => {
    it('should return 500 for invalid request JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json{',
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('Failed to generate script');
    });
  });
});
