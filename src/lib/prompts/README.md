# AI Prompts Module

Optimized prompt templates for AI-powered educational content generation using Claude AI.

## Overview

This module provides two main prompt systems:

1. **Course Generation Prompts** - For creating comprehensive course curricula
2. **Script Generation Prompts** - For creating TTS-optimized lesson scripts

## Course Generation

### Features

- **Level-specific optimization** - Beginner, Intermediate, and Advanced
- **Multi-language support** - English and Japanese
- **Quality standards enforcement** - Built-in best practices
- **Structured JSON output** - Consistent, parseable format
- **Validation utilities** - Ensure generated content quality

### Quick Start

```typescript
import { generateCoursePrompt } from '@/lib/prompts';

const prompts = generateCoursePrompt({
  topic: 'TypeScript Advanced Patterns',
  level: 'intermediate',
  language: 'en',
  numModules: 5,
  duration: '10 hours',
  focusAreas: ['Generics', 'Utility Types', 'Decorators'],
  objectives: [
    'Master advanced TypeScript patterns',
    'Build type-safe applications',
  ],
});

// Use with Claude API
const response = await claude.messages.create({
  model: 'claude-3-7-sonnet-20250219',
  system: prompts.systemPrompt,
  messages: [{ role: 'user', content: prompts.userPrompt }],
  max_tokens: 8000,
});
```

### Configuration Options

```typescript
interface CoursePromptConfig {
  topic: string;                              // Required: Course subject
  level: 'beginner' | 'intermediate' | 'advanced'; // Required: Difficulty
  language: 'ja' | 'en';                      // Required: Output language
  numModules: number;                         // Required: 1-20 modules
  duration?: string;                          // Optional: e.g., "8 hours"
  focusAreas?: string[];                      // Optional: Specific topics
  objectives?: string[];                      // Optional: Learning goals
  additionalInstructions?: string;            // Optional: Custom requirements
}
```

### Level Guidelines

#### Beginner
- Fundamental concepts explained thoroughly
- Minimal prerequisites
- Abundant practical examples
- Progressive learning flow
- Regular review and reinforcement

#### Intermediate
- Build on foundational knowledge
- Focus on practical applications
- Combination of multiple concepts
- Introduction to best practices
- Hands-on exercises

#### Advanced
- Sophisticated concepts and architecture
- Complex problem-solving
- Latest technologies and trends
- Scalability and performance
- Real-world production examples

### Validation

Validate generated course content to ensure quality:

```typescript
import { validateGeneratedCourse } from '@/lib/prompts';

const courseData = JSON.parse(generatedContent);
const validation = validateGeneratedCourse(courseData);

if (validation.isValid) {
  console.log('✓ Course structure is valid');
} else {
  console.error('Errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}

console.log('Stats:', validation.stats);
```

### Expected Output Format

```json
{
  "id": "course_typescript_advanced",
  "title": "TypeScript Advanced Patterns",
  "description": "Master advanced TypeScript...",
  "topic": "TypeScript Advanced Patterns",
  "level": "intermediate",
  "objectives": [
    "Master advanced TypeScript patterns",
    "Build type-safe applications"
  ],
  "modules": [
    {
      "id": "module_1",
      "title": "Generics Deep Dive",
      "description": "Explore generic types...",
      "keyConcepts": [
        "Generic constraints",
        "Variance"
      ],
      "lessons": [
        {
          "id": "lesson_1_1",
          "title": "Introduction to Generics",
          "duration": 45,
          "objectives": ["Understand generic syntax"],
          "content": "Detailed lesson content...",
          "exercises": [
            {
              "id": "exercise_1_1_1",
              "description": "Create a generic function",
              "difficulty": "medium",
              "solution": "Solution hints..."
            }
          ]
        }
      ],
      "totalDuration": 135
    }
  ],
  "totalDuration": 540,
  "estimatedHours": 9
}
```

## Script Generation

### Features

- **TTS-optimized markers** - Pause, emphasis, pronunciation
- **Multiple tones** - Formal, casual, educational
- **Multi-language** - Japanese and English
- **SSML conversion** - Compatible with TTS engines

### Quick Start

```typescript
import { buildScriptPrompt, convertToSSML } from '@/lib/prompts';

const prompt = buildScriptPrompt({
  language: 'ja-JP',
  tone: 'educational',
  topic: 'TypeScriptの型システム',
  audience: '初級プログラマー',
  durationMinutes: 10,
});

// Generate script with Claude
const script = await generateScript(prompt);

// Convert to SSML for TTS
const ssml = convertToSSML(script);
```

### TTS Markers

The script generation system uses special markers for TTS optimization:

- `[PAUSE:500ms]` - Insert a 500ms pause
- `[EMPHASIS]text[/EMPHASIS]` - Emphasize when speaking
- `[PRONUNCIATION:word=reading]` - Pronunciation guide

### Validation

```typescript
import { validateScriptMarkers } from '@/lib/prompts';

const validation = validateScriptMarkers(generatedScript);

if (validation.isValid) {
  console.log('Script statistics:', validation.stats);
} else {
  console.error('Errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

## Quality Standards

All prompts enforce these quality standards:

### Structure
- Clear learning objectives at each level
- Logical content organization
- Balanced module independence and continuity

### Content
- Accurate and up-to-date information
- Practical and applicable knowledge
- Rich examples and code samples
- Balance between theory and practice

### Exercises
- Progressive difficulty
- Real-world relevance
- Clear success criteria
- Sample solutions and hints

### Accessibility
- Clear language
- Technical terms explained
- Visual element suggestions

## API Integration

### Using with Next.js API Route

```typescript
import { generateCoursePrompt } from '@/lib/prompts';
import { streamMessage } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const prompts = generateCoursePrompt({
    topic: body.topic,
    level: body.level,
    language: 'en',
    numModules: body.numModules,
    focusAreas: body.focusAreas,
    objectives: body.objectives,
  });

  for await (const chunk of streamMessage(
    [{ role: 'user', content: prompts.userPrompt }],
    prompts.systemPrompt
  )) {
    // Stream to client
  }
}
```

## Testing

Run tests for the prompts module:

```bash
npm test -- course-generation.test.ts
npm test -- script-generation.test.ts
```

## Best Practices

### 1. Always Validate Input

```typescript
try {
  const prompts = generateCoursePrompt(config);
} catch (error) {
  console.error('Invalid configuration:', error.message);
}
```

### 2. Check Generated Content

```typescript
const validation = validateGeneratedCourse(courseData);
if (!validation.isValid) {
  // Handle validation errors
  throw new Error(`Invalid course: ${validation.errors.join(', ')}`);
}
```

### 3. Handle Language Appropriately

```typescript
const language = request.headers.get('accept-language')?.includes('ja')
  ? 'ja'
  : 'en';

const prompts = generateCoursePrompt({
  ...config,
  language,
});
```

### 4. Provide Clear Error Messages

```typescript
if (validation.warnings.length > 0) {
  console.warn('Quality warnings:', validation.warnings);
  // Consider regenerating or manual review
}
```

## Troubleshooting

### Issue: Generated JSON is invalid

**Solution**: Ensure the prompt explicitly requests JSON-only output. Check for markdown code blocks in the response and strip them.

```typescript
const cleanJson = generatedContent
  .replace(/```json\n/g, '')
  .replace(/```\n/g, '');
const courseData = JSON.parse(cleanJson);
```

### Issue: Content is too short

**Solution**: Add `additionalInstructions` to specify minimum content length:

```typescript
const prompts = generateCoursePrompt({
  ...config,
  additionalInstructions: 'Each lesson content must be at least 500 words with concrete examples.',
});
```

### Issue: Wrong difficulty level

**Solution**: The level guidelines are built-in. Ensure you're using the correct level value and verify the generated content matches expectations.

## Examples

### Example 1: Beginner Web Development Course

```typescript
const webDevCourse = generateCoursePrompt({
  topic: 'Web Development Fundamentals',
  level: 'beginner',
  language: 'en',
  numModules: 6,
  duration: '20 hours',
  focusAreas: ['HTML', 'CSS', 'JavaScript Basics', 'Responsive Design'],
  objectives: [
    'Build complete web pages from scratch',
    'Understand CSS layout techniques',
    'Write basic JavaScript for interactivity',
  ],
});
```

### Example 2: Advanced System Design (Japanese)

```typescript
const systemDesignCourse = generateCoursePrompt({
  topic: 'システム設計とアーキテクチャ',
  level: 'advanced',
  language: 'ja',
  numModules: 8,
  duration: '40時間',
  focusAreas: [
    'マイクロサービス',
    'スケーラビリティ',
    'データベース設計',
    '分散システム',
  ],
  objectives: [
    '大規模システムの設計パターンを理解する',
    'パフォーマンスとスケーラビリティの最適化',
  ],
  additionalInstructions: '実際のプロダクション事例を含めてください',
});
```

## Contributing

When adding new features to the prompts module:

1. Update types in the appropriate interface
2. Add comprehensive tests
3. Update this README with examples
4. Follow the existing pattern for level/language support

## Related Modules

- `/lib/claude` - Claude API integration
- `/types/course` - Course type definitions
- `/app/api/generate` - Course generation API endpoint

---

For more information, see [Issue #18](https://github.com/your-repo/issues/18).
