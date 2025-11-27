import { NextRequest, NextResponse } from 'next/server';
import { streamMessage } from '@/lib/claude';
import {
  ScriptGenerationRequest,
  GeneratedScript,
} from '@/types/course';

/**
 * POST /api/generate-script
 * Generate a lesson script using Claude AI with streaming response
 * Request body: ScriptGenerationRequest
 * Response: Server-sent events stream with JSON chunks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ScriptGenerationRequest = await request.json();

    // Validate required fields
    if (
      !body.lessonId ||
      !body.lessonTitle ||
      !body.lessonContent ||
      !body.language ||
      !body.duration ||
      !body.style
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: lessonId, lessonTitle, lessonContent, language, duration, style',
        },
        { status: 400 }
      );
    }

    // Validate style parameter
    if (!['formal', 'casual', 'educational'].includes(body.style)) {
      return NextResponse.json(
        {
          error: 'Invalid style. Must be one of: formal, casual, educational',
        },
        { status: 400 }
      );
    }

    // Validate duration
    if (body.duration <= 0 || body.duration > 240) {
      return NextResponse.json(
        {
          error: 'Invalid duration. Must be between 1 and 240 minutes',
        },
        { status: 400 }
      );
    }

    // Define style-specific instructions
    const styleInstructions: Record<string, string> = {
      formal:
        'Use professional, academic language with clear structure and formal tone. Include proper transitions and scholarly expressions.',
      casual:
        'Use conversational, friendly language that is easy to understand. Include relatable examples and a warm, approachable tone.',
      educational:
        'Use clear, instructional language focused on learning outcomes. Include step-by-step explanations and practical examples.',
    };

    // Create system prompt for script generation
    const systemPrompt = `You are an expert script writer for educational video content. Generate a comprehensive, engaging script for a lesson on "${body.lessonTitle}".

The script should:
- Be written in ${body.language}
- Target a duration of approximately ${body.duration} minutes (estimate ~150 words per minute)
- Follow a ${body.style} presentation style
- ${styleInstructions[body.style]}
- Be structured with clear sections: Introduction, Main Content, Examples, Summary, and Conclusion
- Include speaker notes where helpful for emphasis, pacing, or visual cues
- Be engaging and maintain audience attention throughout
- Include natural transitions between sections
- Incorporate the lesson content provided by the user

Return ONLY valid JSON (no markdown, no additional text) with the following structure:
{
  "lessonId": "${body.lessonId}",
  "title": "Script Title",
  "language": "${body.language}",
  "duration": ${body.duration},
  "style": "${body.style}",
  "sections": [
    {
      "id": "section_1",
      "type": "introduction",
      "title": "Introduction",
      "content": "Full script text for this section...",
      "estimatedTime": 60,
      "speakerNotes": "Optional notes for the speaker"
    },
    {
      "id": "section_2",
      "type": "main_content",
      "title": "Main Topic",
      "content": "Full script text...",
      "estimatedTime": 180
    }
  ],
  "estimatedReadingTime": ${body.duration},
  "wordCount": 1500
}

IMPORTANT: Calculate estimatedTime in seconds for each section. The total should approximately match ${body.duration * 60} seconds. Calculate wordCount based on actual content generated.`;

    // User message with lesson content
    const userMessage = `Generate a ${body.style} script for the following lesson:

Title: ${body.lessonTitle}
Duration: ${body.duration} minutes
Language: ${body.language}

Lesson Content:
${body.lessonContent}

Please create an engaging, well-structured script that converts this lesson content into a presentation suitable for video or audio delivery.`;

    // Use streaming for real-time response
    let accumulatedText = '';
    const encoder = new TextEncoder();

    return new NextResponse(
      new ReadableStream({
        async start(controller) {
          try {
            // Stream the response from Claude
            for await (const chunk of streamMessage(
              [
                {
                  role: 'user',
                  content: userMessage,
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

            // Try to parse and validate the complete script JSON
            try {
              const scriptData = JSON.parse(
                accumulatedText
              ) as GeneratedScript;

              // Validate the generated script structure
              if (
                !scriptData.sections ||
                !Array.isArray(scriptData.sections) ||
                scriptData.sections.length === 0
              ) {
                throw new Error('Invalid script structure: missing sections');
              }

              // Send completion event
              const completeEvent = `data: ${JSON.stringify({
                type: 'complete',
                data: scriptData,
              })}\n\n`;

              controller.enqueue(encoder.encode(completeEvent));
            } catch (parseError) {
              // Send error event if JSON parsing fails
              const errorEvent = `data: ${JSON.stringify({
                type: 'error',
                message:
                  parseError instanceof Error
                    ? `Failed to parse script data: ${parseError.message}`
                    : 'Failed to parse script data. Please check the format.',
              })}\n\n`;

              controller.enqueue(encoder.encode(errorEvent));
            }

            controller.close();
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';

            const errorEvent = `data: ${JSON.stringify({
              type: 'error',
              message: `Stream error: ${errorMessage}`,
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
        },
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: `Failed to generate script: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
