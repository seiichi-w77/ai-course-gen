import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech, TTSConfig } from '@/lib/tts';
import { uploadAudio } from '@/lib/firebase-storage';

/**
 * Audio generation request interface
 */
interface AudioGenerationRequest {
  /** The text script to convert to speech */
  script: string;
  /** Language code for speech synthesis */
  language: 'ja-JP' | 'en-US';
  /** Voice gender preference */
  voiceGender: 'male' | 'female';
  /** Optional speaking rate (0.25 to 4.0, default: 1.0) */
  speakingRate?: number;
  /** Optional pitch adjustment (-20.0 to 20.0, default: 0.0) */
  pitch?: number;
}

/**
 * Audio generation response interface
 */
interface AudioGenerationResponse {
  /** Public URL of the uploaded audio file */
  audioUrl: string;
  /** Estimated duration in seconds */
  duration: number;
  /** Audio format (always 'mp3') */
  format: string;
  /** Size of the audio file in bytes */
  size: number;
  /** Word count in the script */
  wordCount: number;
}

/**
 * Estimates audio duration based on text length and speaking rate
 * @param text - The text that will be converted to speech
 * @param speakingRate - Speaking rate multiplier (default: 1.0)
 * @returns Estimated duration in seconds
 */
function estimateAudioDuration(text: string, speakingRate: number = 1.0): number {
  // Average speaking rates:
  // - English: ~150 words per minute
  // - Japanese: ~200 characters per minute (approx. ~350 morae per minute)

  // For simplicity, we'll use character count and estimate
  // Google Cloud TTS typically processes text at:
  // - ~150 words/min for English (with moderate rate)
  // - ~300 characters/min for Japanese (with moderate rate)

  const charCount = text.length;

  // Base estimation: ~5 characters per second of audio
  // This is a conservative estimate that works for both languages
  const baseSeconds = charCount / 5;

  // Adjust for speaking rate (higher rate = shorter duration)
  const adjustedSeconds = baseSeconds / speakingRate;

  // Round to nearest second
  return Math.round(adjustedSeconds);
}

/**
 * Counts words in text (works for both English and Japanese)
 * @param text - Input text
 * @returns Word count
 */
function countWords(text: string): number {
  // For English: split by whitespace
  // For Japanese: count characters (since Japanese doesn't use spaces)
  const trimmed = text.trim();

  // Check if text contains Japanese characters
  const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(trimmed);

  if (hasJapanese) {
    // For Japanese, return character count
    return trimmed.length;
  } else {
    // For English, count words
    return trimmed.split(/\s+/).filter(word => word.length > 0).length;
  }
}

/**
 * POST /api/generate-audio
 * Generate audio from text script using Google Cloud Text-to-Speech
 * and upload to Firebase Storage
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: AudioGenerationRequest = await request.json();

    // Validate required fields
    if (!body.script || !body.language || !body.voiceGender) {
      return NextResponse.json(
        {
          error: 'Missing required fields: script, language, voiceGender',
        },
        { status: 400 }
      );
    }

    // Validate script is not empty
    if (body.script.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Script cannot be empty',
        },
        { status: 400 }
      );
    }

    // Validate language
    if (!['ja-JP', 'en-US'].includes(body.language)) {
      return NextResponse.json(
        {
          error: 'Invalid language. Must be either "ja-JP" or "en-US"',
        },
        { status: 400 }
      );
    }

    // Validate voice gender
    if (!['male', 'female'].includes(body.voiceGender)) {
      return NextResponse.json(
        {
          error: 'Invalid voiceGender. Must be either "male" or "female"',
        },
        { status: 400 }
      );
    }

    // Validate optional parameters
    if (body.speakingRate !== undefined) {
      if (body.speakingRate < 0.25 || body.speakingRate > 4.0) {
        return NextResponse.json(
          {
            error: 'Invalid speakingRate. Must be between 0.25 and 4.0',
          },
          { status: 400 }
        );
      }
    }

    if (body.pitch !== undefined) {
      if (body.pitch < -20.0 || body.pitch > 20.0) {
        return NextResponse.json(
          {
            error: 'Invalid pitch. Must be between -20.0 and 20.0',
          },
          { status: 400 }
        );
      }
    }

    // Prepare TTS configuration
    const ttsConfig: TTSConfig = {
      language: body.language,
      voiceGender: body.voiceGender,
      speakingRate: body.speakingRate ?? 1.0,
      pitch: body.pitch ?? 0.0,
    };

    // Generate speech audio
    console.log('[generate-audio] Generating speech with Google Cloud TTS...');
    const audioBuffer = await generateSpeech(body.script, ttsConfig);
    console.log(`[generate-audio] Generated audio: ${audioBuffer.byteLength} bytes`);

    // Create filename with timestamp and language code
    const timestamp = Date.now();
    const filename = `audio_${body.language}_${timestamp}.mp3`;

    // Upload to Firebase Storage
    console.log('[generate-audio] Uploading to Firebase Storage...');
    const audioUrl = await uploadAudio(audioBuffer, filename);
    console.log(`[generate-audio] Upload complete: ${audioUrl}`);

    // Calculate metadata
    const speakingRate = body.speakingRate ?? 1.0;
    const estimatedDuration = estimateAudioDuration(body.script, speakingRate);
    const wordCount = countWords(body.script);

    // Prepare response
    const response: AudioGenerationResponse = {
      audioUrl,
      duration: estimatedDuration,
      format: 'mp3',
      size: audioBuffer.byteLength,
      wordCount,
    };

    console.log('[generate-audio] Audio generation successful:', {
      duration: estimatedDuration,
      size: audioBuffer.byteLength,
      wordCount,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[generate-audio] Error:', errorMessage);
    console.error('[generate-audio] Stack:', error instanceof Error ? error.stack : '');

    // Determine appropriate status code based on error type
    let statusCode = 500;
    let userMessage = errorMessage;

    // Handle specific error cases
    if (errorMessage.includes('credentials not configured')) {
      statusCode = 503;
      userMessage = 'Text-to-Speech service is not configured. Please contact the administrator.';
    } else if (errorMessage.includes('Firebase configuration')) {
      statusCode = 503;
      userMessage = 'Storage service is not configured. Please contact the administrator.';
    } else if (errorMessage.includes('Failed to upload')) {
      statusCode = 500;
      userMessage = 'Failed to upload generated audio. Please try again.';
    } else if (errorMessage.includes('Failed to generate speech')) {
      statusCode = 500;
      userMessage = 'Failed to generate audio from script. Please try again.';
    }

    return NextResponse.json(
      {
        error: `Failed to generate audio: ${userMessage}`,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: statusCode }
    );
  }
}
