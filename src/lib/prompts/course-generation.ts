/**
 * Course Generation Prompts for AI-Powered Course Creation
 *
 * This module provides optimized prompt templates for generating comprehensive
 * educational course content using Claude AI. It includes:
 * - Level-specific difficulty adjustments
 * - Language-specific expression optimization
 * - Clear JSON output formatting
 * - Quality standards enforcement
 *
 * @module prompts/course-generation
 */

/**
 * Configuration for course generation prompts
 */
export interface CoursePromptConfig {
  /** Topic or subject matter for the course */
  topic: string;
  /** Target difficulty level */
  level: 'beginner' | 'intermediate' | 'advanced';
  /** Target language for course content */
  language: 'ja' | 'en';
  /** Number of modules to generate */
  numModules: number;
  /** Expected total course duration (e.g., "8 hours", "3 days", "2 weeks") */
  duration?: string;
  /** Specific focus areas or subtopics */
  focusAreas?: string[];
  /** Learning objectives */
  objectives?: string[];
  /** Additional requirements or instructions */
  additionalInstructions?: string;
}

/**
 * Level-specific guidance for content difficulty
 */
const LEVEL_GUIDANCE = {
  beginner: {
    ja: {
      description: '初心者レベル',
      characteristics: [
        '基礎概念から丁寧に説明',
        '専門用語は必ず定義してから使用',
        '実践的な例を豊富に含める',
        '段階的な学習フロー',
        '各ステップでの確認と復習',
      ],
      pacing: '各概念に十分な時間をかけ、急がない',
      prerequisites: '前提知識は最小限',
    },
    en: {
      description: 'Beginner level',
      characteristics: [
        'Explain fundamental concepts thoroughly',
        'Always define technical terms before use',
        'Include abundant practical examples',
        'Progressive learning flow',
        'Review and reinforcement at each step',
      ],
      pacing: 'Take sufficient time with each concept, no rushing',
      prerequisites: 'Minimal prerequisites required',
    },
  },
  intermediate: {
    ja: {
      description: '中級レベル',
      characteristics: [
        '基礎知識を前提とした発展的内容',
        '実務的な応用例を中心に',
        '複数の概念の組み合わせ',
        'ベストプラクティスの紹介',
        '実践的な演習問題',
      ],
      pacing: '適度なペースで、実践重視',
      prerequisites: '基礎知識を習得済み',
    },
    en: {
      description: 'Intermediate level',
      characteristics: [
        'Advanced content building on fundamentals',
        'Focus on practical applications',
        'Combination of multiple concepts',
        'Introduction to best practices',
        'Hands-on exercises',
      ],
      pacing: 'Moderate pace with practical focus',
      prerequisites: 'Basic knowledge assumed',
    },
  },
  advanced: {
    ja: {
      description: '上級レベル',
      characteristics: [
        '高度な概念とアーキテクチャ',
        '複雑な問題解決のアプローチ',
        '最新技術やトレンドの紹介',
        'スケーラビリティとパフォーマンス',
        '実際のプロダクション事例',
      ],
      pacing: '効率的に、深い理解を目指す',
      prerequisites: '中級以上の知識と実務経験',
    },
    en: {
      description: 'Advanced level',
      characteristics: [
        'Sophisticated concepts and architecture',
        'Complex problem-solving approaches',
        'Latest technologies and trends',
        'Scalability and performance considerations',
        'Real-world production examples',
      ],
      pacing: 'Efficient with deep understanding',
      prerequisites: 'Intermediate+ knowledge and practical experience',
    },
  },
};

/**
 * Quality standards for generated courses
 */
const QUALITY_STANDARDS = {
  ja: {
    structure: [
      '明確な学習目標が各レベル（コース、モジュール、レッスン）で定義されている',
      '論理的な順序で内容が構成されている',
      '各モジュールは独立性と連続性のバランスが取れている',
    ],
    content: [
      '正確で最新の情報',
      '実践的で応用可能な知識',
      '具体例とコード例が豊富',
      '理論と実践のバランス',
    ],
    exercises: [
      '難易度が段階的に上がる演習問題',
      '実務に即した課題設定',
      '明確な成功基準',
      '解答例やヒントの提供',
    ],
    accessibility: [
      '分かりやすい日本語表現',
      '専門用語には説明を付ける',
      '図表や視覚的要素の示唆',
    ],
  },
  en: {
    structure: [
      'Clear learning objectives defined at each level (course, module, lesson)',
      'Content organized in logical sequence',
      'Modules balanced between independence and continuity',
    ],
    content: [
      'Accurate and up-to-date information',
      'Practical and applicable knowledge',
      'Rich with concrete and code examples',
      'Balance between theory and practice',
    ],
    exercises: [
      'Progressive difficulty in exercises',
      'Real-world relevant tasks',
      'Clear success criteria',
      'Sample solutions and hints provided',
    ],
    accessibility: [
      'Clear and accessible language',
      'Technical terms explained',
      'Suggestions for diagrams and visual elements',
    ],
  },
};

/**
 * Generates system prompt for course curriculum design
 * @param config - Course generation configuration
 * @returns System prompt string for AI model
 */
function generateSystemPrompt(config: CoursePromptConfig): string {
  const lang = config.language;
  const levelGuide = LEVEL_GUIDANCE[config.level][lang];
  const qualityStandards = QUALITY_STANDARDS[lang];

  if (lang === 'ja') {
    return `あなたは教育コンテンツ設計の専門家です。以下の要件に基づいて、高品質な${levelGuide.description}のコースカリキュラムを設計してください。

【コース概要】
トピック: ${config.topic}
難易度: ${levelGuide.description}
モジュール数: ${config.numModules}
${config.duration ? `推奨学習時間: ${config.duration}` : ''}
${config.focusAreas ? `重点分野: ${config.focusAreas.join('、')}` : ''}

【難易度ガイドライン】
${levelGuide.characteristics.map((c) => `• ${c}`).join('\n')}

学習ペース: ${levelGuide.pacing}
前提条件: ${levelGuide.prerequisites}

【品質基準】

構成:
${qualityStandards.structure.map((s) => `• ${s}`).join('\n')}

コンテンツ:
${qualityStandards.content.map((c) => `• ${c}`).join('\n')}

演習問題:
${qualityStandards.exercises.map((e) => `• ${e}`).join('\n')}

アクセシビリティ:
${qualityStandards.accessibility.map((a) => `• ${a}`).join('\n')}

【追加要件】
${config.additionalInstructions || 'なし'}

【重要な出力形式】
必ず有効なJSON形式のみを出力してください。マークダウンや説明文は一切含めないでください。
JSONは以下の構造に厳密に従ってください：

{
  "id": "一意のコースID（例: course_typescript_basics）",
  "title": "コース名",
  "description": "コースの詳細説明（200-300文字）",
  "topic": "${config.topic}",
  "level": "${config.level}",
  "objectives": ["学習目標1", "学習目標2", "学習目標3"],
  "modules": [
    {
      "id": "module_1",
      "title": "モジュール名",
      "description": "モジュールの説明（100-150文字）",
      "keyConcepts": ["重要概念1", "重要概念2"],
      "lessons": [
        {
          "id": "lesson_1_1",
          "title": "レッスン名",
          "duration": 45,
          "objectives": ["このレッスンの目標1", "このレッスンの目標2"],
          "content": "詳細なレッスン内容（500-1000文字）。具体例、コード例、図表の説明を含む。",
          "exercises": [
            {
              "id": "exercise_1_1_1",
              "description": "演習問題の説明",
              "difficulty": "easy",
              "solution": "解答例やヒント"
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

すべてのIDはユニークで、わかりやすい命名にしてください。
時間は分単位で、現実的な値を設定してください。`;
  } else {
    return `You are an expert educational content designer. Create a high-quality ${levelGuide.description} course curriculum based on the following requirements.

【Course Overview】
Topic: ${config.topic}
Difficulty: ${levelGuide.description}
Number of Modules: ${config.numModules}
${config.duration ? `Recommended Duration: ${config.duration}` : ''}
${config.focusAreas ? `Focus Areas: ${config.focusAreas.join(', ')}` : ''}

【Level Guidelines】
${levelGuide.characteristics.map((c) => `• ${c}`).join('\n')}

Pacing: ${levelGuide.pacing}
Prerequisites: ${levelGuide.prerequisites}

【Quality Standards】

Structure:
${qualityStandards.structure.map((s) => `• ${s}`).join('\n')}

Content:
${qualityStandards.content.map((c) => `• ${c}`).join('\n')}

Exercises:
${qualityStandards.exercises.map((e) => `• ${e}`).join('\n')}

Accessibility:
${qualityStandards.accessibility.map((a) => `• ${a}`).join('\n')}

【Additional Requirements】
${config.additionalInstructions || 'None'}

【Critical Output Format】
Return ONLY valid JSON (no markdown, no additional text).
Strictly follow this JSON structure:

{
  "id": "unique_course_id (e.g., course_typescript_basics)",
  "title": "Course Title",
  "description": "Detailed course description (200-300 chars)",
  "topic": "${config.topic}",
  "level": "${config.level}",
  "objectives": ["objective1", "objective2", "objective3"],
  "modules": [
    {
      "id": "module_1",
      "title": "Module Title",
      "description": "Module description (100-150 chars)",
      "keyConcepts": ["key_concept1", "key_concept2"],
      "lessons": [
        {
          "id": "lesson_1_1",
          "title": "Lesson Title",
          "duration": 45,
          "objectives": ["lesson_objective1", "lesson_objective2"],
          "content": "Detailed lesson content (500-1000 chars). Include specific examples, code samples, and diagram descriptions.",
          "exercises": [
            {
              "id": "exercise_1_1_1",
              "description": "Exercise description",
              "difficulty": "easy",
              "solution": "Sample solution or hints"
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

All IDs must be unique and descriptive.
Duration values in minutes, realistic and appropriate.`;
  }
}

/**
 * Generates user prompt for course generation
 * @param config - Course generation configuration
 * @returns User prompt string
 */
function generateUserPrompt(config: CoursePromptConfig): string {
  const lang = config.language;

  if (lang === 'ja') {
    const objectivesText = config.objectives?.length
      ? `\n追加の学習目標: ${config.objectives.join('、')}`
      : '';

    return `「${config.topic}」について、${LEVEL_GUIDANCE[config.level].ja.description}の完全なコースカリキュラムを生成してください。${objectivesText}

${config.numModules}個のモジュールで構成し、各モジュールには2-3個のレッスンを含めてください。
実践的で、学習者が実際に応用できる内容にしてください。`;
  } else {
    const objectivesText = config.objectives?.length
      ? `\nAdditional objectives: ${config.objectives.join(', ')}`
      : '';

    return `Generate a complete ${LEVEL_GUIDANCE[config.level].en.description} course curriculum on "${config.topic}".${objectivesText}

Structure the course with ${config.numModules} modules, each containing 2-3 lessons.
Make it practical and applicable for learners.`;
  }
}

/**
 * Generates optimized course generation prompt
 *
 * Creates a complete prompt configuration for AI-powered course generation,
 * including system role definition, quality standards, and output formatting.
 *
 * @param config - Course prompt configuration
 * @returns Object containing system and user prompts
 *
 * @example
 * ```typescript
 * const prompts = generateCoursePrompt({
 *   topic: 'TypeScript Type System',
 *   level: 'intermediate',
 *   language: 'en',
 *   numModules: 4,
 *   duration: '8 hours',
 *   focusAreas: ['Advanced Types', 'Generics', 'Type Guards'],
 * });
 *
 * // Use with Claude API
 * const response = await claude.messages.create({
 *   model: 'claude-3-7-sonnet-20250219',
 *   system: prompts.systemPrompt,
 *   messages: [{ role: 'user', content: prompts.userPrompt }]
 * });
 * ```
 */
export function generateCoursePrompt(config: CoursePromptConfig): {
  systemPrompt: string;
  userPrompt: string;
} {
  // Validate required fields
  if (!config.topic || config.topic.trim().length === 0) {
    throw new Error('Topic is required for course generation');
  }

  if (!['beginner', 'intermediate', 'advanced'].includes(config.level)) {
    throw new Error('Level must be "beginner", "intermediate", or "advanced"');
  }

  if (!['ja', 'en'].includes(config.language)) {
    throw new Error('Language must be "ja" or "en"');
  }

  if (!config.numModules || config.numModules < 1 || config.numModules > 20) {
    throw new Error('Number of modules must be between 1 and 20');
  }

  // Generate prompts
  const systemPrompt = generateSystemPrompt(config);
  const userPrompt = generateUserPrompt(config);

  return {
    systemPrompt,
    userPrompt,
  };
}

/**
 * Validates generated course structure
 * @param courseData - Generated course object
 * @returns Validation result
 */
export interface CourseValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateGeneratedCourse(
  courseData: unknown
): CourseValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type guard for course data
  if (typeof courseData !== 'object' || courseData === null) {
    errors.push('Course data must be an object');
    return { isValid: false, errors, warnings };
  }

  const course = courseData as Record<string, unknown>;

  // Required fields validation
  if (!course.id) errors.push('Missing course ID');
  if (!course.title) errors.push('Missing course title');
  if (!course.description) errors.push('Missing course description');
  if (!course.modules || !Array.isArray(course.modules)) {
    errors.push('Missing or invalid modules array');
  }

  // Module validation
  if (Array.isArray(course.modules) && course.modules.length > 0) {
    course.modules.forEach((module: unknown, idx: number) => {
      if (typeof module !== 'object' || module === null) {
        errors.push(`Module ${idx + 1}: Invalid module object`);
        return;
      }

      const mod = module as Record<string, unknown>;

      if (!mod.id) errors.push(`Module ${idx + 1}: Missing ID`);
      if (!mod.title) errors.push(`Module ${idx + 1}: Missing title`);
      if (!mod.lessons || !Array.isArray(mod.lessons)) {
        errors.push(`Module ${idx + 1}: Missing or invalid lessons array`);
      }

      // Lesson validation
      if (Array.isArray(mod.lessons) && mod.lessons.length > 0) {
        mod.lessons.forEach((lesson: unknown, lessonIdx: number) => {
          if (typeof lesson !== 'object' || lesson === null) {
            errors.push(
              `Module ${idx + 1}, Lesson ${lessonIdx + 1}: Invalid lesson object`
            );
            return;
          }

          const les = lesson as Record<string, unknown>;

          if (!les.id) {
            errors.push(`Module ${idx + 1}, Lesson ${lessonIdx + 1}: Missing ID`);
          }
          if (!les.title) {
            errors.push(`Module ${idx + 1}, Lesson ${lessonIdx + 1}: Missing title`);
          }
          if (!les.content) {
            warnings.push(
              `Module ${idx + 1}, Lesson ${lessonIdx + 1}: Content is empty or missing`
            );
          }
          if (
            typeof les.content === 'string' &&
            les.content.length < 200
          ) {
            warnings.push(
              `Module ${idx + 1}, Lesson ${lessonIdx + 1}: Content seems too short (${les.content.length} chars)`
            );
          }
        });
      }
    });
  }

  // Duration validation
  if (
    typeof course.totalDuration === 'number' &&
    course.totalDuration < 60
  ) {
    warnings.push('Total course duration seems very short (< 1 hour)');
  }

  if (
    typeof course.totalDuration === 'number' &&
    course.totalDuration > 6000
  ) {
    warnings.push('Total course duration seems very long (> 100 hours)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
