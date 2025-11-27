# Course Generation Prompt - Usage Examples

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Advanced Usage](#advanced-usage)
3. [Real-World Examples](#real-world-examples)
4. [API Integration](#api-integration)
5. [Error Handling](#error-handling)

## Basic Usage

### Example 1: Simple Beginner Course

```typescript
import { generateCoursePrompt } from '@/lib/prompts';

const prompts = generateCoursePrompt({
  topic: 'Introduction to Programming',
  level: 'beginner',
  language: 'en',
  numModules: 4,
});

console.log('System Prompt:', prompts.systemPrompt);
console.log('User Prompt:', prompts.userPrompt);
```

### Example 2: Intermediate Course with Focus Areas

```typescript
const prompts = generateCoursePrompt({
  topic: 'Web Development with React',
  level: 'intermediate',
  language: 'en',
  numModules: 6,
  focusAreas: [
    'React Hooks',
    'State Management',
    'Performance Optimization',
  ],
});
```

### Example 3: Japanese Advanced Course

```typescript
const prompts = generateCoursePrompt({
  topic: 'マイクロサービスアーキテクチャ',
  level: 'advanced',
  language: 'ja',
  numModules: 8,
  duration: '40時間',
});
```

## Advanced Usage

### Example 4: Complete Configuration

```typescript
const prompts = generateCoursePrompt({
  topic: 'Machine Learning Engineering',
  level: 'advanced',
  language: 'en',
  numModules: 10,
  duration: '60 hours',
  focusAreas: [
    'Deep Learning',
    'Model Deployment',
    'MLOps',
    'Production Systems',
  ],
  objectives: [
    'Design and train production-ready ML models',
    'Implement CI/CD for ML systems',
    'Monitor and maintain ML applications',
    'Scale ML workloads efficiently',
  ],
  additionalInstructions: `
    - Include real-world case studies from companies like Netflix, Uber, and Airbnb
    - Provide Jupyter notebook examples for all concepts
    - Focus on practical deployment scenarios
    - Include cost optimization strategies
  `,
});
```

### Example 5: With Validation

```typescript
import {
  generateCoursePrompt,
  validateGeneratedCourse
} from '@/lib/prompts';

// Generate prompt
const prompts = generateCoursePrompt({
  topic: 'TypeScript Advanced Patterns',
  level: 'intermediate',
  language: 'en',
  numModules: 5,
});

// Use with Claude API
const response = await claude.messages.create({
  model: 'claude-3-7-sonnet-20250219',
  system: prompts.systemPrompt,
  messages: [{ role: 'user', content: prompts.userPrompt }],
  max_tokens: 8000,
});

// Parse and validate
const courseData = JSON.parse(response.content[0].text);
const validation = validateGeneratedCourse(courseData);

if (!validation.isValid) {
  throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
}

if (validation.warnings.length > 0) {
  console.warn('Quality warnings:', validation.warnings);
}

console.log('Course generated successfully!', courseData.title);
```

## Real-World Examples

### Example 6: Corporate Training Course

```typescript
const corporateTraining = generateCoursePrompt({
  topic: 'Cloud Architecture on AWS',
  level: 'intermediate',
  language: 'en',
  numModules: 8,
  duration: '32 hours',
  focusAreas: [
    'EC2 and Auto Scaling',
    'S3 and CloudFront',
    'Lambda and Serverless',
    'Security Best Practices',
    'Cost Optimization',
  ],
  objectives: [
    'Architect scalable cloud solutions',
    'Implement security best practices',
    'Optimize cloud infrastructure costs',
    'Pass AWS Solutions Architect exam',
  ],
  additionalInstructions: `
    Target audience: Mid-level software engineers transitioning to cloud
    Include hands-on labs for each module
    Provide AWS free tier compatible examples
    Include exam preparation tips
  `,
});
```

### Example 7: University Course

```typescript
const universityCourse = generateCoursePrompt({
  topic: 'Computer Science Fundamentals',
  level: 'beginner',
  language: 'en',
  numModules: 12,
  duration: '48 hours',
  focusAreas: [
    'Data Structures',
    'Algorithms',
    'Complexity Analysis',
    'Problem Solving',
  ],
  objectives: [
    'Understand fundamental data structures',
    'Analyze algorithm complexity',
    'Solve coding interview problems',
    'Apply CS concepts to real problems',
  ],
  additionalInstructions: `
    Semester-long course for CS majors
    Include weekly homework assignments
    Provide coding exercises in Python
    Align with ACM curriculum guidelines
    Include mid-term and final exam preparation
  `,
});
```

### Example 8: Self-Paced Online Course

```typescript
const onlineCourse = generateCoursePrompt({
  topic: 'Full-Stack Web Development',
  level: 'beginner',
  language: 'en',
  numModules: 15,
  duration: '80 hours',
  focusAreas: [
    'HTML & CSS',
    'JavaScript & TypeScript',
    'React & Next.js',
    'Node.js & Express',
    'PostgreSQL & Prisma',
    'Deployment & DevOps',
  ],
  objectives: [
    'Build complete web applications from scratch',
    'Deploy applications to production',
    'Implement authentication and authorization',
    'Create RESTful and GraphQL APIs',
  ],
  additionalInstructions: `
    Self-paced course for career changers
    Include video script outlines
    Provide starter code and solution repositories
    Include portfolio project ideas
    Focus on modern, job-ready skills
  `,
});
```

### Example 9: Japanese Technical Course

```typescript
const japaneseDevCourse = generateCoursePrompt({
  topic: 'Goによるマイクロサービス開発',
  level: 'intermediate',
  language: 'ja',
  numModules: 8,
  duration: '30時間',
  focusAreas: [
    'Goの基礎とベストプラクティス',
    'gRPCとProtobuf',
    'サービスメッシュ',
    '分散トレーシング',
    'Kubernetesデプロイ',
  ],
  objectives: [
    'Goで効率的なマイクロサービスを構築できる',
    'gRPCを使った通信を実装できる',
    'Kubernetesにデプロイできる',
    '本番環境での運用ノウハウを習得する',
  ],
  additionalInstructions: `
    日本企業のエンジニア向け
    実際のプロダクションコード例を含める
    パフォーマンスチューニングの実践的な手法
    チーム開発でのベストプラクティス
  `,
});
```

## API Integration

### Example 10: Next.js API Route

```typescript
// app/api/generate-course/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateCoursePrompt, validateGeneratedCourse } from '@/lib/prompts';
import { streamMessage } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.topic || !body.level || !body.numModules) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate optimized prompt
    const prompts = generateCoursePrompt({
      topic: body.topic,
      level: body.level,
      language: body.language || 'en',
      numModules: body.numModules,
      focusAreas: body.focusAreas,
      objectives: body.objectives,
      duration: body.duration,
      additionalInstructions: body.additionalInstructions,
    });

    // Stream response
    const encoder = new TextEncoder();
    let accumulatedText = '';

    return new NextResponse(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamMessage(
              [{ role: 'user', content: prompts.userPrompt }],
              prompts.systemPrompt
            )) {
              accumulatedText += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
              );
            }

            // Validate final result
            const courseData = JSON.parse(accumulatedText);
            const validation = validateGeneratedCourse(courseData);

            if (!validation.isValid) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    error: 'Validation failed',
                    details: validation.errors
                  })}\n\n`
                )
              );
            } else {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    complete: true,
                    data: courseData,
                    warnings: validation.warnings
                  })}\n\n`
                )
              );
            }

            controller.close();
          } catch (error) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: error instanceof Error ? error.message : 'Unknown error'
                })}\n\n`
              )
            );
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Example 11: React Client Integration

```typescript
// components/CourseGenerator.tsx
'use client';

import { useState } from 'react';

export function CourseGenerator() {
  const [generating, setGenerating] = useState(false);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  async function generateCourse(config: any) {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              setError(data.error);
            } else if (data.complete) {
              setCourse(data.data);
              if (data.warnings?.length > 0) {
                console.warn('Quality warnings:', data.warnings);
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <button
        onClick={() =>
          generateCourse({
            topic: 'React Fundamentals',
            level: 'beginner',
            language: 'en',
            numModules: 5,
          })
        }
        disabled={generating}
      >
        {generating ? 'Generating...' : 'Generate Course'}
      </button>

      {error && <div className="error">{error}</div>}
      {course && <div className="course">{JSON.stringify(course, null, 2)}</div>}
    </div>
  );
}
```

## Error Handling

### Example 12: Comprehensive Error Handling

```typescript
import {
  generateCoursePrompt,
  validateGeneratedCourse
} from '@/lib/prompts';

async function generateCourseWithErrorHandling(config: any) {
  try {
    // Step 1: Validate input configuration
    const prompts = generateCoursePrompt(config);
    console.log('✓ Prompts generated successfully');

    // Step 2: Call Claude API
    const response = await claude.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: prompts.systemPrompt,
      messages: [{ role: 'user', content: prompts.userPrompt }],
      max_tokens: 8000,
    });

    // Step 3: Parse response
    let courseData;
    try {
      const content = response.content[0].text;
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n/g, '')
        .replace(/```\n/g, '')
        .trim();
      courseData = JSON.parse(cleanContent);
      console.log('✓ Response parsed successfully');
    } catch (parseError) {
      throw new Error('Failed to parse course JSON: ' + parseError.message);
    }

    // Step 4: Validate structure
    const validation = validateGeneratedCourse(courseData);

    if (!validation.isValid) {
      console.error('❌ Validation failed:');
      validation.errors.forEach((error) => console.error(`  - ${error}`));
      throw new Error(`Course validation failed: ${validation.errors.join(', ')}`);
    }

    // Step 5: Check warnings
    if (validation.warnings.length > 0) {
      console.warn('⚠️  Quality warnings:');
      validation.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    console.log('✓ Course generated and validated successfully');
    return courseData;

  } catch (error) {
    if (error instanceof Error) {
      console.error('Course generation failed:', error.message);

      // Handle specific error types
      if (error.message.includes('Topic is required')) {
        throw new Error('Please provide a course topic');
      } else if (error.message.includes('Level must be')) {
        throw new Error('Invalid difficulty level. Choose: beginner, intermediate, or advanced');
      } else if (error.message.includes('Language must be')) {
        throw new Error('Invalid language. Choose: en or ja');
      }
    }

    throw error;
  }
}

// Usage
try {
  const course = await generateCourseWithErrorHandling({
    topic: 'Advanced TypeScript',
    level: 'advanced',
    language: 'en',
    numModules: 6,
  });

  console.log('Success!', course.title);
} catch (error) {
  console.error('Failed to generate course:', error.message);
}
```

## Tips & Best Practices

### Tip 1: Start Simple, Then Customize

```typescript
// Start with basic configuration
const basicPrompts = generateCoursePrompt({
  topic: 'Your Topic',
  level: 'beginner',
  language: 'en',
  numModules: 4,
});

// Then add more details as needed
const detailedPrompts = generateCoursePrompt({
  ...basicConfig,
  focusAreas: [...],
  objectives: [...],
  additionalInstructions: '...',
});
```

### Tip 2: Use TypeScript for Type Safety

```typescript
import type { CoursePromptConfig } from '@/lib/prompts';

// Type-safe configuration
const config: CoursePromptConfig = {
  topic: 'React',
  level: 'intermediate', // ✓ Type-checked
  language: 'en',        // ✓ Type-checked
  numModules: 5,
};
```

### Tip 3: Always Validate Generated Content

```typescript
// Don't just trust the AI output
const validation = validateGeneratedCourse(courseData);

if (!validation.isValid) {
  // Regenerate or fix issues
  throw new Error('Invalid course structure');
}
```

### Tip 4: Handle Warnings Appropriately

```typescript
if (validation.warnings.length > 0) {
  // Log for monitoring
  logger.warn('Course quality warnings', {
    topic: config.topic,
    warnings: validation.warnings
  });

  // Maybe regenerate if critical
  if (validation.warnings.some(w => w.includes('too short'))) {
    // Regenerate with more content
  }
}
```

---

For more information, see the [main README](./README.md).
