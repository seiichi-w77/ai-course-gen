'use client';

import { useState, useCallback } from 'react';
import { CourseGenerationRequest, GeneratedCourse } from '@/types/course';

/**
 * Hook state for course generation
 */
interface UseCourseGenerationState {
  course: GeneratedCourse | null;
  loading: boolean;
  error: string | null;
  streamingText: string;
}

/**
 * Hook return type
 */
interface UseCourseGenerationReturn extends UseCourseGenerationState {
  generateCourse: (request: CourseGenerationRequest) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for course generation with streaming support
 * Handles API calls, state management, and error handling
 */
export function useCourseGeneration(): UseCourseGenerationReturn {
  const [state, setState] = useState<UseCourseGenerationState>({
    course: null,
    loading: false,
    error: null,
    streamingText: '',
  });

  /**
   * Generate a course using the API endpoint
   */
  const generateCourse = useCallback(
    async (request: CourseGenerationRequest): Promise<void> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        streamingText: '',
        course: null,
      }));

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate course');
        }

        // Handle streaming response
        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines[lines.length - 1];

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i];

            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.substring('data: '.length);
                const event = JSON.parse(jsonStr);

                if (event.type === 'stream') {
                  // Update streaming text
                  setState((prev) => ({
                    ...prev,
                    streamingText: prev.streamingText + event.content,
                  }));
                } else if (event.type === 'complete') {
                  // Course generation complete
                  setState((prev) => ({
                    ...prev,
                    course: event.data,
                    loading: false,
                    streamingText: '',
                  }));
                } else if (event.type === 'error') {
                  throw new Error(event.message);
                }
              } catch (e) {
                // Ignore JSON parsing errors for non-JSON lines
                if (e instanceof Error && !e.message.includes('JSON')) {
                  throw e;
                }
              }
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      }
    },
    []
  );

  /**
   * Reset the hook state
   */
  const reset = useCallback((): void => {
    setState({
      course: null,
      loading: false,
      error: null,
      streamingText: '',
    });
  }, []);

  return {
    ...state,
    generateCourse,
    reset,
  };
}
