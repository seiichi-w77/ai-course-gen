import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { generateSpeech, generateSpeechBlob, generateSpeechBase64, TTSError } from '../tts';
import type { TTSConfig } from '../tts';

// Mock the Google Cloud TTS client
vi.mock('@google-cloud/text-to-speech');

describe('TTS Library', () => {
  let mockSynthesizeSpeech: ReturnType<typeof vi.fn>;
  let mockTextToSpeechClient: {
    synthesizeSpeech: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock audio content
    const mockAudioContent = new Uint8Array([1, 2, 3, 4, 5]);

    mockSynthesizeSpeech = vi.fn().mockResolvedValue([
      {
        audioContent: mockAudioContent,
      },
    ]);

    mockTextToSpeechClient = {
      synthesizeSpeech: mockSynthesizeSpeech,
    };

    // Mock the TextToSpeechClient constructor
    vi.mocked(TextToSpeechClient).mockImplementation(function(this: any) {
      return mockTextToSpeechClient as any;
    });

    // Mock environment variables
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GOOGLE_CLOUD_PROJECT;
  });

  describe('generateSpeech', () => {
    describe('Successful generation', () => {
      it('should generate speech with English female voice', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        const result = await generateSpeech('Hello, world!', config);

        expect(result).toBeInstanceOf(ArrayBuffer);
        expect(result.byteLength).toBe(5);

        expect(mockSynthesizeSpeech).toHaveBeenCalledWith({
          input: { text: 'Hello, world!' },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-C',
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0,
          },
        });
      });

      it('should generate speech with English male voice', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'male',
        };

        await generateSpeech('Test', config);

        expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
          expect.objectContaining({
            voice: expect.objectContaining({
              languageCode: 'en-US',
              name: 'en-US-Neural2-D',
              ssmlGender: 'MALE',
            }),
          })
        );
      });

      it('should generate speech with Japanese female voice', async () => {
        const config: TTSConfig = {
          language: 'ja-JP',
          voiceGender: 'female',
        };

        await generateSpeech('こんにちは', config);

        expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
          expect.objectContaining({
            voice: expect.objectContaining({
              languageCode: 'ja-JP',
              name: 'ja-JP-Neural2-B',
              ssmlGender: 'FEMALE',
            }),
          })
        );
      });

      it('should generate speech with Japanese male voice', async () => {
        const config: TTSConfig = {
          language: 'ja-JP',
          voiceGender: 'male',
        };

        await generateSpeech('こんにちは', config);

        expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
          expect.objectContaining({
            voice: expect.objectContaining({
              languageCode: 'ja-JP',
              name: 'ja-JP-Neural2-C',
              ssmlGender: 'MALE',
            }),
          })
        );
      });

      it('should apply custom speaking rate', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 1.5,
        };

        await generateSpeech('Test', config);

        expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
          expect.objectContaining({
            audioConfig: expect.objectContaining({
              speakingRate: 1.5,
            }),
          })
        );
      });

      it('should apply custom pitch', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          pitch: 5.0,
        };

        await generateSpeech('Test', config);

        expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
          expect.objectContaining({
            audioConfig: expect.objectContaining({
              pitch: 5.0,
            }),
          })
        );
      });

      it('should use default values for optional parameters', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        await generateSpeech('Test', config);

        expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
          expect.objectContaining({
            audioConfig: expect.objectContaining({
              speakingRate: 1.0,
              pitch: 0.0,
            }),
          })
        );
      });
    });

    describe('Validation errors', () => {
      it('should throw error for empty text', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        await expect(generateSpeech('', config)).rejects.toThrow(TTSError);
        await expect(generateSpeech('', config)).rejects.toThrow('Text cannot be empty');
      });

      it('should throw error for whitespace-only text', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        await expect(generateSpeech('   ', config)).rejects.toThrow(TTSError);
      });

      it('should throw error for invalid language', async () => {
        const config = {
          language: 'fr-FR', // Invalid language
          voiceGender: 'female',
        } as TTSConfig;

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
        await expect(generateSpeech('Test', config)).rejects.toThrow(
          'Language must be either "ja-JP" or "en-US"'
        );
      });

      it('should throw error for invalid voice gender', async () => {
        const config = {
          language: 'en-US',
          voiceGender: 'neutral', // Invalid gender
        } as TTSConfig;

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
        await expect(generateSpeech('Test', config)).rejects.toThrow(
          'Voice gender must be either "male" or "female"'
        );
      });

      it('should throw error for speakingRate too low', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 0.1,
        };

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
        await expect(generateSpeech('Test', config)).rejects.toThrow(
          'Speaking rate must be between 0.25 and 4.0'
        );
      });

      it('should throw error for speakingRate too high', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 5.0,
        };

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
      });

      it('should throw error for pitch too low', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          pitch: -25.0,
        };

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
        await expect(generateSpeech('Test', config)).rejects.toThrow(
          'Pitch must be between -20.0 and 20.0'
        );
      });

      it('should throw error for pitch too high', async () => {
        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          pitch: 25.0,
        };

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
      });

      it('should accept boundary values for speakingRate', async () => {
        const config1: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 0.25,
        };

        await expect(generateSpeech('Test', config1)).resolves.toBeDefined();

        const config2: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          speakingRate: 4.0,
        };

        await expect(generateSpeech('Test', config2)).resolves.toBeDefined();
      });

      it('should accept boundary values for pitch', async () => {
        const config1: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          pitch: -20.0,
        };

        await expect(generateSpeech('Test', config1)).resolves.toBeDefined();

        const config2: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
          pitch: 20.0,
        };

        await expect(generateSpeech('Test', config2)).resolves.toBeDefined();
      });
    });

    describe('Credential errors', () => {
      it('should throw error when credentials are not configured', async () => {
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        delete process.env.GOOGLE_CLOUD_PROJECT;

        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
        await expect(generateSpeech('Test', config)).rejects.toThrow(
          'Google Cloud credentials not configured'
        );
      });

      it('should work with GOOGLE_CLOUD_PROJECT environment variable', async () => {
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        process.env.GOOGLE_CLOUD_PROJECT = 'my-project-id';

        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        await expect(generateSpeech('Test', config)).resolves.toBeDefined();
      });
    });

    describe('API errors', () => {
      it('should wrap Google Cloud API errors in TTSError', async () => {
        mockSynthesizeSpeech.mockRejectedValue(new Error('API quota exceeded'));

        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
        await expect(generateSpeech('Test', config)).rejects.toThrow(
          'Failed to generate speech: API quota exceeded'
        );
      });

      it('should handle missing audio content in response', async () => {
        mockSynthesizeSpeech.mockResolvedValue([
          {
            audioContent: null,
          },
        ]);

        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        await expect(generateSpeech('Test', config)).rejects.toThrow(TTSError);
        await expect(generateSpeech('Test', config)).rejects.toThrow(
          'No audio content received from Google Cloud TTS API'
        );
      });

      it('should preserve original error in cause property', async () => {
        const originalError = new Error('Network timeout');
        mockSynthesizeSpeech.mockRejectedValue(originalError);

        const config: TTSConfig = {
          language: 'en-US',
          voiceGender: 'female',
        };

        try {
          await generateSpeech('Test', config);
          expect.fail('Should have thrown error');
        } catch (error) {
          expect(error).toBeInstanceOf(TTSError);
          expect((error as TTSError).cause).toBe(originalError);
        }
      });
    });
  });

  describe('generateSpeechBlob', () => {
    it('should generate speech and return Blob', async () => {
      const config: TTSConfig = {
        language: 'en-US',
        voiceGender: 'female',
      };

      const result = await generateSpeechBlob('Test', config);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('audio/mp3');
      expect(result.size).toBe(5);
    });

    it('should pass through validation errors', async () => {
      const config: TTSConfig = {
        language: 'en-US',
        voiceGender: 'female',
      };

      await expect(generateSpeechBlob('', config)).rejects.toThrow(TTSError);
    });
  });

  describe('generateSpeechBase64', () => {
    it('should generate speech and return base64 string (Node.js)', async () => {
      const config: TTSConfig = {
        language: 'en-US',
        voiceGender: 'female',
      };

      const result = await generateSpeechBase64('Test', config);

      expect(typeof result).toBe('string');
      // Base64 of [1, 2, 3, 4, 5] should be 'AQIDBAU='
      expect(result).toBe('AQIDBAU=');
    });

    it('should generate speech and return base64 string (Browser)', async () => {
      // Temporarily remove Buffer to simulate browser environment
      const originalBuffer = global.Buffer;
      // @ts-expect-error - Simulating browser environment
      delete global.Buffer;

      const config: TTSConfig = {
        language: 'en-US',
        voiceGender: 'female',
      };

      const result = await generateSpeechBase64('Test', config);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      // Restore Buffer
      global.Buffer = originalBuffer;
    });

    it('should pass through validation errors', async () => {
      const config: TTSConfig = {
        language: 'en-US',
        voiceGender: 'female',
      };

      await expect(generateSpeechBase64('', config)).rejects.toThrow(TTSError);
    });
  });

  describe('All language and gender combinations', () => {
    const combinations = [
      { language: 'en-US', voiceGender: 'male', expectedVoice: 'en-US-Neural2-D' },
      { language: 'en-US', voiceGender: 'female', expectedVoice: 'en-US-Neural2-C' },
      { language: 'ja-JP', voiceGender: 'male', expectedVoice: 'ja-JP-Neural2-C' },
      { language: 'ja-JP', voiceGender: 'female', expectedVoice: 'ja-JP-Neural2-B' },
    ] as const;

    combinations.forEach(({ language, voiceGender, expectedVoice }) => {
      it(`should use correct voice for ${language} ${voiceGender}`, async () => {
        const config: TTSConfig = {
          language,
          voiceGender,
        };

        await generateSpeech('Test', config);

        expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
          expect.objectContaining({
            voice: expect.objectContaining({
              name: expectedVoice,
            }),
          })
        );
      });
    });
  });
});
