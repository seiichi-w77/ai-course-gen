import { NextRequest, NextResponse } from 'next/server';
import { streamMessage } from '@/lib/claude';
import { CourseGenerationRequest, GeneratedCourse } from '@/types/course';

/**
 * POST /api/generate
 * Generate a course using Claude AI with streaming response
 * Request body: CourseGenerationRequest
 * Response: Server-sent events stream with JSON chunks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CourseGenerationRequest = await request.json();

    // Validate required fields
    if (!body.topic || !body.level || !body.numModules) {
      return NextResponse.json(
        {
          error: 'Missing required fields: topic, level, numModules',
        },
        { status: 400 }
      );
    }

    // Create system prompt for course generation
    const systemPrompt = `You are an expert course curriculum designer. Generate a comprehensive ${body.level} level course on "${body.topic}".

The course should:
- Be structured with ${body.numModules} modules
- Each module should contain 2-3 lessons
- Each lesson should have clear learning objectives, content, and exercises
- Include practical examples and real-world applications
- Be educational yet engaging

${body.focusAreas ? `Focus areas: ${body.focusAreas.join(', ')}` : ''}
${body.objectives ? `Additional objectives: ${body.objectives.join(', ')}` : ''}

Return ONLY valid JSON (no markdown, no additional text) with the following structure:
{
  "id": "course_id",
  "title": "Course Title",
  "description": "Course description",
  "topic": "${body.topic}",
  "level": "${body.level}",
  "objectives": ["objective1", "objective2"],
  "modules": [
    {
      "id": "module_id",
      "title": "Module Title",
      "description": "Module description",
      "keyConcepts": ["concept1", "concept2"],
      "lessons": [
        {
          "id": "lesson_id",
          "title": "Lesson Title",
          "duration": 45,
          "objectives": ["objective1"],
          "content": "Lesson content...",
          "exercises": [
            {
              "id": "exercise_id",
              "description": "Exercise description",
              "difficulty": "medium",
              "solution": "Solution hint"
            }
          ]
        }
      ],
      "totalDuration": 135
    }
  ],
  "totalDuration": 540,
  "estimatedHours": 9
}`;

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
                  content: `Generate a complete ${body.level} level course on ${body.topic}.`,
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

            // Try to parse and validate the complete course JSON
            try {
              const courseData = JSON.parse(accumulatedText) as GeneratedCourse;

              // Send completion event
              const completeEvent = `data: ${JSON.stringify({
                type: 'complete',
                data: courseData,
              })}\n\n`;

              controller.enqueue(encoder.encode(completeEvent));
            } catch (parseError) {
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
        error: `Failed to generate course: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
