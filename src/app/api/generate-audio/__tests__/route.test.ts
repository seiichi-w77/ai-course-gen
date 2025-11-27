import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as tts from '@/lib/tts';
import * as firebaseStorage from '@/lib/firebase-storage';

// Mock dependencies
vi.mock('@/lib/tts');
vi.mock('@/lib/firebase-storage');

describe('POST /api/generate-audio', () => {
  const mockGenerateSpeech = vi.mocked(tts.generateSpeech);
  const mockUploadAudio = vi.mocked(firebaseStorage.uploadAudio);

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    const mockAudioBuffer = new ArrayBuffer(1024);
    mockGenerateSpeech.mockResolvedValue(mockAudioBuffer);
    mockUploadAudio.mockResolvedValue('https://example.com/audio_123.mp3');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful audio generation', () => {
    it('should generate audio successfully with valid inputs', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: 'Hello, world! This is a test script.',
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      const response = await POST(request);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('audioUrl');
      expect(data).toHaveProperty('duration');
      expect(data).toHaveProperty('format', 'mp3');
      expect(data).toHaveProperty('size', 1024);
      expect(data).toHaveProperty('wordCount');

      expect(mockGenerateSpeech).toHaveBeenCalledWith(
        'Hello, world! This is a test script.',
        expect.objectContaining({
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 1.0,
          pitch: 0.0,
        })
      );

      expect(mockUploadAudio).toHaveBeenCalled();
    });

    it('should generate audio with Japanese language and male voice', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'こんにちは、世界!',
          language: 'ja-JP',
          voiceGender: 'male',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.audioUrl).toBeDefined();

      expect(mockGenerateSpeech).toHaveBeenCalledWith(
        'こんにちは、世界!',
        expect.objectContaining({
          language: 'ja-JP',
          voiceGender: 'male',
        })
      );
    });

    it('should handle custom speaking rate', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 1.5,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      expect(mockGenerateSpeech).toHaveBeenCalledWith(
        'Test script',
        expect.objectContaining({
          speakingRate: 1.5,
        })
      );
    });

    it('should handle custom pitch', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'male',
          pitch: 5.0,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);

      expect(mockGenerateSpeech).toHaveBeenCalledWith(
        'Test script',
        expect.objectContaining({
          pitch: 5.0,
        })
      );
    });

    it('should generate unique filenames with timestamp', async () => {
      const request1 = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test 1',
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      await POST(request1);
      const filename1 = mockUploadAudio.mock.calls[0][1];

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const request2 = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test 2',
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      await POST(request2);
      const filename2 = mockUploadAudio.mock.calls[1][1];

      // Filenames should include language code and be unique
      expect(filename1).toMatch(/audio_en-US_\d+\.mp3/);
      expect(filename2).toMatch(/audio_en-US_\d+\.mp3/);
      expect(filename1).not.toBe(filename2);
    });
  });

  describe('Validation errors', () => {
    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          // Missing all required fields
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
      expect(data.error).toContain('script');
      expect(data.error).toContain('language');
      expect(data.error).toContain('voiceGender');
    });

    it('should return 400 for empty script', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: '   ', // Empty after trimming
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Script cannot be empty');
    });

    it('should return 400 for invalid language', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'fr-FR', // Invalid language (not in allowed list)
          voiceGender: 'female',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid language');
      expect(data.error).toContain('ja-JP');
      expect(data.error).toContain('en-US');
    });

    it('should return 400 for invalid voice gender', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'neutral', // Invalid gender
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid voiceGender');
      expect(data.error).toContain('male');
      expect(data.error).toContain('female');
    });

    it('should return 400 for invalid speakingRate (too low)', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 0.1, // Too low
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid speakingRate');
      expect(data.error).toContain('between 0.25 and 4.0');
    });

    it('should return 400 for invalid speakingRate (too high)', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 5.0, // Too high
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid speakingRate');
      expect(data.error).toContain('between 0.25 and 4.0');
    });

    it('should return 400 for invalid pitch (too low)', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
          pitch: -25.0, // Too low
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid pitch');
      expect(data.error).toContain('between -20.0 and 20.0');
    });

    it('should return 400 for invalid pitch (too high)', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
          pitch: 25.0, // Too high
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid pitch');
      expect(data.error).toContain('between -20.0 and 20.0');
    });

    it('should accept valid boundary values for speakingRate and pitch', async () => {
      // Test minimum speakingRate (0.25)
      const request1 = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test',
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 0.25,
        }),
      });

      const response1 = await POST(request1);
      expect(response1.status).toBe(200);

      // Test maximum speakingRate (4.0)
      const request2 = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test',
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 4.0,
        }),
      });

      const response2 = await POST(request2);
      expect(response2.status).toBe(200);

      // Test minimum pitch (-20.0)
      const request3 = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test',
          language: 'en-US',
          voiceGender: 'female',
          pitch: -20.0,
        }),
      });

      const response3 = await POST(request3);
      expect(response3.status).toBe(200);

      // Test maximum pitch (20.0)
      const request4 = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test',
          language: 'en-US',
          voiceGender: 'female',
          pitch: 20.0,
        }),
      });

      const response4 = await POST(request4);
      expect(response4.status).toBe(200);
    });
  });

  describe('Service errors', () => {
    it('should return 503 when TTS credentials are not configured', async () => {
      mockGenerateSpeech.mockRejectedValue(
        new Error('Google Cloud credentials not configured')
      );

      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.error).toContain('Text-to-Speech service is not configured');
    });

    it('should return 503 when Firebase storage is not configured', async () => {
      mockUploadAudio.mockRejectedValue(
        new Error('Firebase configuration is missing')
      );

      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.error).toContain('Storage service is not configured');
    });

    it('should return 500 when upload fails', async () => {
      mockUploadAudio.mockRejectedValue(new Error('Failed to upload to storage'));

      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('Failed to upload generated audio');
    });

    it('should return 500 when speech generation fails', async () => {
      mockGenerateSpeech.mockRejectedValue(
        new Error('Failed to generate speech: API error')
      );

      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain('Failed to generate audio from script');
    });

    it('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockGenerateSpeech.mockRejectedValue(new Error('Detailed error message'));

      const request = new NextRequest('http://localhost:3000/api/generate-audio', {
        method: 'POST',
        body: JSON.stringify({
          script: 'Test script',
          language: 'en-US',
          voiceGender: 'female',
        }),
      });

      const response = await POST(request);

      const data = await response.json();
      expect(data).toHaveProperty('details');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Language and gender combinations', () => {
    const combinations = [
      { language: 'en-US', voiceGender: 'male' },
      { language: 'en-US', voiceGender: 'female' },
      { language: 'ja-JP', voiceGender: 'male' },
      { language: 'ja-JP', voiceGender: 'female' },
    ] as const;

    combinations.forEach(({ language, voiceGender }) => {
      it(`should handle ${language} with ${voiceGender} voice`, async () => {
        const request = new NextRequest('http://localhost:3000/api/generate-audio', {
          method: 'POST',
          body: JSON.stringify({
            script: 'Test script',
            language,
            voiceGender,
          }),
        });

        const response = await POST(request);

        expect(response.status).toBe(200);

        expect(mockGenerateSpeech).toHaveBeenCalledWith(
          'Test script',
          expect.objectContaining({
            language,
            voiceGender,
          })
        );
      });
    });
  });
});
