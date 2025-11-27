import { NextRequest, NextResponse } from 'next/server';
import { streamMessage } from '@/lib/claude';
import { CourseGenerationRequest, GeneratedCourse } from '@/types/course';
import { createRateLimiter, getClientIP } from '@/lib/rate-limit';
import { withRetry, API_RETRY_CONFIG } from '@/lib/retry';
import {
  ValidationError,
  APIError,
  normalizeError,
  isAppError,
} from '@/lib/error';
import { generateCoursePrompt } from '@/lib/prompts';

/**
 * Rate limiter: 10 requests per 15 minutes per IP
 */
const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
});

/**
 * POST /api/generate
 * Generate a course using Claude AI with streaming response
 * Request body: CourseGenerationRequest
 * Response: Server-sent events stream with JSON chunks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const clientIP = getClientIP(request.headers);
    const rateLimitResult = rateLimiter(clientIP);

    // Validate request body
    let body: CourseGenerationRequest;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON in request body');
    }

    // Validate required fields
    const missingFields: Record<string, string> = {};
    if (!body.topic) missingFields.topic = 'Topic is required';
    if (!body.level) missingFields.level = 'Level is required';
    if (!body.numModules) missingFields.numModules = 'Number of modules is required';

    if (Object.keys(missingFields).length > 0) {
      throw new ValidationError('Missing required fields: topic, level, numModules', missingFields);
    }

    // Validate field values
    if (body.numModules < 1 || body.numModules > 20) {
      throw new ValidationError('Number of modules must be between 1 and 20');
    }

    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(body.level)) {
      throw new ValidationError(`Level must be one of: ${validLevels.join(', ')}`);
    }

    // Generate optimized prompts using the new prompt system
    // Default to English, but could be made configurable
    const language = 'en'; // Could be extracted from request headers or body

    const prompts = generateCoursePrompt({
      topic: body.topic,
      level: body.level,
      language,
      numModules: body.numModules,
      focusAreas: body.focusAreas,
      objectives: body.objectives,
    });

    const systemPrompt = prompts.systemPrompt;

    // Use streaming for real-time response
    let accumulatedText = '';
    const encoder = new TextEncoder();

    return new NextResponse(
      new ReadableStream({
        async start(controller) {
          try {
            // Stream the response from Claude with retry logic
            const streamWithRetry = async () => {
              for await (const chunk of streamMessage(
                [
                  {
                    role: 'user',
                    content: prompts.userPrompt,
                  },
                ],
                systemPrompt
              )) {
                accumulatedText += chunk;

                // Send each chunk as a Server-Sent Event
                const event = `data: ${JSON.stringify({
                  type: 'stream',
                  content: chunk,
                })}\n\n`;

                controller.enqueue(encoder.encode(event));
              }
            };

            // Execute streaming with retry on transient failures
            await withRetry(streamWithRetry, {
              ...API_RETRY_CONFIG,
              onRetry: (error, attempt, delay) => {
                console.warn(
                  `[API] Retry attempt ${attempt} after ${delay}ms due to: ${error.message}`
                );
                // Send retry notification to client
                const retryEvent = `data: ${JSON.stringify({
                  type: 'retry',
                  attempt,
                  message: 'Retrying request...',
                })}\n\n`;
                controller.enqueue(encoder.encode(retryEvent));
              },
            });

            // Try to parse and validate the complete course JSON
            try {
              const courseData = JSON.parse(accumulatedText) as GeneratedCourse;

              // Send completion event
              const completeEvent = `data: ${JSON.stringify({
                type: 'complete',
                data: courseData,
              })}\n\n`;

              controller.enqueue(encoder.encode(completeEvent));
            } catch {
              // Send error event if JSON parsing fails
              const errorEvent = `data: ${JSON.stringify({
                type: 'error',
                message:
                  'Failed to parse course data. Please check the format.',
              })}\n\n`;

              controller.enqueue(encoder.encode(errorEvent));
            }

            controller.close();
          } catch (error) {
            // Convert to APIError if it's not already an AppError
            const appError = isAppError(error)
              ? error
              : new APIError(
                  error instanceof Error ? error.message : 'Unknown error occurred',
                  'Claude API'
                );

            const normalized = normalizeError(appError);

            const errorEvent = `data: ${JSON.stringify({
              type: 'error',
              ...normalized,
            })}\n\n`;

            controller.enqueue(encoder.encode(errorEvent));
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    // Unified error handling
    const normalized = normalizeError(error);

    // Log error for monitoring
    console.error('[API Error]', {
      ...normalized,
      ip: getClientIP(request.headers),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: normalized.message,
        code: normalized.code,
        ...(process.env.NODE_ENV === 'development' && { details: normalized.details }),
      },
      { status: normalized.statusCode }
    );
  }
}
