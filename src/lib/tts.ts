import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { google } from '@google-cloud/text-to-speech/build/protos/protos';

/**
 * Text-to-Speech configuration options
 */
export interface TTSConfig {
  /** Language code (e.g., 'ja-JP' for Japanese, 'en-US' for English) */
  language: 'ja-JP' | 'en-US';
  /** Voice gender preference */
  voiceGender: 'male' | 'female';
  /** Speaking rate (0.25 to 4.0, default: 1.0) */
  speakingRate?: number;
  /** Pitch adjustment (-20.0 to 20.0, default: 0.0) */
  pitch?: number;
}

/**
 * TTS error class for better error handling
 */
export class TTSError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'TTSError';
  }
}

/**
 * Validates the TTS configuration parameters
 * @param config - TTS configuration object
 * @throws {TTSError} If configuration is invalid
 */
function validateConfig(config: TTSConfig): void {
  if (!config.language || !['ja-JP', 'en-US'].includes(config.language)) {
    throw new TTSError('Language must be either "ja-JP" or "en-US"');
  }

  if (!config.voiceGender || !['male', 'female'].includes(config.voiceGender)) {
    throw new TTSError('Voice gender must be either "male" or "female"');
  }

  if (config.speakingRate !== undefined) {
    if (config.speakingRate < 0.25 || config.speakingRate > 4.0) {
      throw new TTSError('Speaking rate must be between 0.25 and 4.0');
    }
  }

  if (config.pitch !== undefined) {
    if (config.pitch < -20.0 || config.pitch > 20.0) {
      throw new TTSError('Pitch must be between -20.0 and 20.0');
    }
  }
}

/**
 * Maps language and gender to recommended voice name
 * @param language - Language code
 * @param gender - Voice gender
 * @returns Recommended voice name
 */
function getVoiceName(
  language: 'ja-JP' | 'en-US',
  gender: 'male' | 'female'
): string {
  const voiceMap: Record<string, Record<string, string>> = {
    'ja-JP': {
      male: 'ja-JP-Neural2-C',
      female: 'ja-JP-Neural2-B',
    },
    'en-US': {
      male: 'en-US-Neural2-D',
      female: 'en-US-Neural2-C',
    },
  };

  return voiceMap[language][gender];
}

/**
 * Generates speech audio from text using Google Cloud Text-to-Speech API
 *
 * @param text - The text to convert to speech
 * @param config - TTS configuration options
 * @returns ArrayBuffer containing the audio data in MP3 format
 * @throws {TTSError} If speech generation fails
 *
 * @example
 * ```typescript
 * const audioBuffer = await generateSpeech('こんにちは', {
 *   language: 'ja-JP',
 *   voiceGender: 'female',
 *   speakingRate: 1.0,
 *   pitch: 0.0
 * });
 *
 * // Use the audio buffer to create an audio element
 * const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
 * const audioUrl = URL.createObjectURL(blob);
 * const audio = new Audio(audioUrl);
 * audio.play();
 * ```
 */
export async function generateSpeech(
  text: string,
  config: TTSConfig
): Promise<ArrayBuffer> {
  // Validate input
  if (!text || text.trim().length === 0) {
    throw new TTSError('Text cannot be empty');
  }

  validateConfig(config);

  // Check for API credentials
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
    throw new TTSError(
      'Google Cloud credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_PROJECT environment variable.'
    );
  }

  try {
    // Initialize the Text-to-Speech client
    const client = new TextToSpeechClient();

    // Determine voice name based on language and gender
    const voiceName = getVoiceName(config.language, config.voiceGender);

    // Map gender to Google API format
    const ssmlGender =
      config.voiceGender === 'male' ? 'MALE' : 'FEMALE';

    // Construct the request
    const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode: config.language,
        name: voiceName,
        ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: config.speakingRate ?? 1.0,
        pitch: config.pitch ?? 0.0,
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    // Extract audio content
    if (!response.audioContent) {
      throw new TTSError('No audio content received from Google Cloud TTS API');
    }

    // Convert Uint8Array to ArrayBuffer
    if (response.audioContent instanceof Uint8Array) {
      // Create a new ArrayBuffer and copy the data
      const buffer = new ArrayBuffer(response.audioContent.byteLength);
      const view = new Uint8Array(buffer);
      view.set(response.audioContent);
      return buffer;
    }

    return new ArrayBuffer(0);
  } catch (error) {
    if (error instanceof TTSError) {
      throw error;
    }

    // Wrap Google Cloud API errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new TTSError(`Failed to generate speech: ${errorMessage}`, error);
  }
}

/**
 * Generates speech and returns a Blob (browser-compatible)
 *
 * @param text - The text to convert to speech
 * @param config - TTS configuration options
 * @returns Blob containing the audio data in MP3 format
 * @throws {TTSError} If speech generation fails
 *
 * @example
 * ```typescript
 * const audioBlob = await generateSpeechBlob('Hello, world!', {
 *   language: 'en-US',
 *   voiceGender: 'male',
 *   speakingRate: 1.2
 * });
 *
 * const audioUrl = URL.createObjectURL(audioBlob);
 * const audio = new Audio(audioUrl);
 * audio.play();
 * ```
 */
export async function generateSpeechBlob(
  text: string,
  config: TTSConfig
): Promise<Blob> {
  const audioBuffer = await generateSpeech(text, config);
  return new Blob([audioBuffer], { type: 'audio/mp3' });
}

/**
 * Generates speech and returns a Base64-encoded string
 * Useful for embedding audio in JSON or HTML
 *
 * @param text - The text to convert to speech
 * @param config - TTS configuration options
 * @returns Base64-encoded audio data
 * @throws {TTSError} If speech generation fails
 *
 * @example
 * ```typescript
 * const base64Audio = await generateSpeechBase64('こんにちは', {
 *   language: 'ja-JP',
 *   voiceGender: 'female'
 * });
 *
 * // Use in HTML audio element
 * const audioSrc = `data:audio/mp3;base64,${base64Audio}`;
 * ```
 */
export async function generateSpeechBase64(
  text: string,
  config: TTSConfig
): Promise<string> {
  const audioBuffer = await generateSpeech(text, config);
  const uint8Array = new Uint8Array(audioBuffer);

  // Convert to base64
  if (typeof Buffer !== 'undefined') {
    // Node.js environment
    return Buffer.from(uint8Array).toString('base64');
  } else {
    // Browser environment
    const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  }
}
