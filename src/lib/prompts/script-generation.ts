/**
 * Script Generation Prompts for TTS Optimization
 *
 * This module provides prompt templates optimized for Text-to-Speech (TTS) synthesis.
 * It includes special markers for:
 * - Pause control: [PAUSE:duration]
 * - Emphasis: [EMPHASIS]...[/EMPHASIS]
 * - Pronunciation guidance: [PRONUNCIATION:word=reading]
 * - Multi-language support (Japanese/English)
 */

/**
 * Script tone/style options
 */
export type ScriptTone = 'formal' | 'casual' | 'educational';

/**
 * Supported languages for script generation
 */
export type ScriptLanguage = 'ja-JP' | 'en-US';

/**
 * Configuration for script prompt generation
 */
export interface ScriptPromptConfig {
  /** Target language for the script */
  language: ScriptLanguage;
  /** Tone/style of the script */
  tone: ScriptTone;
  /** Topic or subject matter */
  topic: string;
  /** Target audience (e.g., "beginners", "professionals", "students") */
  audience?: string;
  /** Desired script duration in minutes */
  durationMinutes?: number;
  /** Additional instructions or requirements */
  additionalInstructions?: string;
}

/**
 * TTS-optimized prompt templates for different script tones
 */
export const scriptPromptTemplates = {
  /**
   * Formal tone template
   * - Professional language
   * - Structured delivery
   * - Clear enunciation markers
   */
  formal: {
    'ja-JP': `次のトピックについて、フォーマルで専門的なスクリプトを作成してください。

トピック: {{topic}}
対象者: {{audience}}
推奨時間: {{duration}}分

以下のTTS最適化マーカーを使用してください:
- [PAUSE:500ms] - 500ミリ秒のポーズを挿入
- [EMPHASIS]重要な言葉[/EMPHASIS] - 強調して読む
- [PRONUNCIATION:専門用語=せんもんようご] - 発音ガイド

スクリプト要件:
1. 丁寧で専門的な言葉遣い
2. 段落間に適切なポーズマーカーを配置
3. 重要な用語には強調マーカーを使用
4. 難読漢字には発音ガイドを追加
5. 論理的な構成（導入→本論→結論）

{{additionalInstructions}}

スクリプトを出力してください:`,

    'en-US': `Create a formal and professional script on the following topic.

Topic: {{topic}}
Audience: {{audience}}
Target Duration: {{duration}} minutes

Use the following TTS optimization markers:
- [PAUSE:500ms] - Insert a 500ms pause
- [EMPHASIS]important words[/EMPHASIS] - Emphasize when speaking
- [PRONUNCIATION:word=pronunciation] - Pronunciation guide

Script Requirements:
1. Professional and polished language
2. Appropriate pause markers between paragraphs
3. Emphasis markers on key terms
4. Pronunciation guides for technical terms
5. Logical structure (introduction → body → conclusion)

{{additionalInstructions}}

Output the script:`,
  },

  /**
   * Casual tone template
   * - Conversational language
   * - Natural flow
   * - Friendly delivery
   */
  casual: {
    'ja-JP': `次のトピックについて、カジュアルで親しみやすいスクリプトを作成してください。

トピック: {{topic}}
対象者: {{audience}}
推奨時間: {{duration}}分

以下のTTS最適化マーカーを使用してください:
- [PAUSE:300ms] - 自然な間を作る
- [EMPHASIS]大事なポイント[/EMPHASIS] - 強調
- [PRONUNCIATION:言葉=よみかた] - 発音ガイド

スクリプト要件:
1. 会話調の自然な言葉遣い
2. 聞き手に語りかけるような口調
3. 適度なポーズで聞きやすさを確保
4. 重要なポイントは強調マーカーで目立たせる
5. 親しみやすく、わかりやすい表現

{{additionalInstructions}}

スクリプトを出力してください:`,

    'en-US': `Create a casual and friendly script on the following topic.

Topic: {{topic}}
Audience: {{audience}}
Target Duration: {{duration}} minutes

Use the following TTS optimization markers:
- [PAUSE:300ms] - Natural pauses
- [EMPHASIS]key points[/EMPHASIS] - Emphasis
- [PRONUNCIATION:word=pronunciation] - Pronunciation guide

Script Requirements:
1. Conversational and natural language
2. Speaking directly to the listener
3. Moderate pauses for clarity
4. Emphasis markers on important points
5. Friendly and approachable tone

{{additionalInstructions}}

Output the script:`,
  },

  /**
   * Educational tone template
   * - Clear explanations
   * - Structured learning flow
   * - Pedagogical markers
   */
  educational: {
    'ja-JP': `次のトピックについて、教育的でわかりやすいスクリプトを作成してください。

トピック: {{topic}}
対象者: {{audience}}
推奨時間: {{duration}}分

以下のTTS最適化マーカーを使用してください:
- [PAUSE:600ms] - 理解を促すポーズ
- [EMPHASIS]学習ポイント[/EMPHASIS] - 重要な概念の強調
- [PRONUNCIATION:専門語=読み方] - 学習者向け発音ガイド

スクリプト要件:
1. 段階的で理解しやすい説明
2. 各セクション後に十分なポーズを挿入
3. 学習ポイントには強調マーカーを使用
4. 新しい用語には必ず発音ガイドを追加
5. 例示や比喩を活用した説明
6. 復習や要約を含める

{{additionalInstructions}}

スクリプトを出力してください:`,

    'en-US': `Create an educational and clear script on the following topic.

Topic: {{topic}}
Audience: {{audience}}
Target Duration: {{duration}} minutes

Use the following TTS optimization markers:
- [PAUSE:600ms] - Pauses for comprehension
- [EMPHASIS]learning points[/EMPHASIS] - Emphasize key concepts
- [PRONUNCIATION:term=pronunciation] - Pronunciation guide for learners

Script Requirements:
1. Step-by-step, easy-to-understand explanations
2. Sufficient pauses after each section
3. Emphasis markers on learning points
4. Pronunciation guides for new terms
5. Use of examples and analogies
6. Include review and summary

{{additionalInstructions}}

Output the script:`,
  },
};

/**
 * Default values for script generation
 */
const DEFAULT_AUDIENCE = 'general audience';
const DEFAULT_DURATION_MINUTES = 5;

/**
 * Replaces template variables with actual values
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Key-value pairs for replacement
 * @returns Processed template string
 */
function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Builds a complete script generation prompt based on configuration
 *
 * @param config - Script prompt configuration
 * @returns Formatted prompt string ready for AI model
 *
 * @example
 * ```typescript
 * const prompt = buildScriptPrompt({
 *   language: 'ja-JP',
 *   tone: 'educational',
 *   topic: 'TypeScriptの型システム',
 *   audience: '初級プログラマー',
 *   durationMinutes: 10,
 *   additionalInstructions: 'コード例を3つ含めてください'
 * });
 *
 * // Use prompt with Claude API
 * const response = await claude.messages.create({
 *   model: 'claude-3-7-sonnet-20250219',
 *   messages: [{ role: 'user', content: prompt }]
 * });
 * ```
 */
export function buildScriptPrompt(config: ScriptPromptConfig): string {
  // Validate required fields
  if (!config.topic || config.topic.trim().length === 0) {
    throw new Error('Topic is required for script generation');
  }

  if (!['ja-JP', 'en-US'].includes(config.language)) {
    throw new Error('Language must be either "ja-JP" or "en-US"');
  }

  if (!['formal', 'casual', 'educational'].includes(config.tone)) {
    throw new Error('Tone must be "formal", "casual", or "educational"');
  }

  // Get the appropriate template
  const template = scriptPromptTemplates[config.tone][config.language];

  // Prepare variables for replacement
  const variables: Record<string, string> = {
    topic: config.topic,
    audience: config.audience || DEFAULT_AUDIENCE,
    duration: String(config.durationMinutes || DEFAULT_DURATION_MINUTES),
    additionalInstructions: config.additionalInstructions || '',
  };

  // Replace variables and return
  return replaceVariables(template, variables);
}

/**
 * Validates and processes a TTS-optimized script
 * Ensures all markers are properly formatted
 *
 * @param script - Raw script text with TTS markers
 * @returns Validation result with any warnings or errors
 *
 * @example
 * ```typescript
 * const script = "こんにちは[PAUSE:500ms]今日は[EMPHASIS]TypeScript[/EMPHASIS]について...";
 * const validation = validateScriptMarkers(script);
 *
 * if (validation.isValid) {
 *   console.log('Script is valid for TTS');
 * } else {
 *   console.error('Errors:', validation.errors);
 * }
 * ```
 */
export interface ScriptValidationResult {
  /** Whether the script is valid */
  isValid: boolean;
  /** List of errors found */
  errors: string[];
  /** List of warnings (non-critical issues) */
  warnings: string[];
  /** Statistics about marker usage */
  stats: {
    pauseCount: number;
    emphasisCount: number;
    pronunciationCount: number;
  };
}

export function validateScriptMarkers(script: string): ScriptValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for matching EMPHASIS markers
  const emphasisOpen = (script.match(/\[EMPHASIS\]/g) || []).length;
  const emphasisClose = (script.match(/\[\/EMPHASIS\]/g) || []).length;

  if (emphasisOpen !== emphasisClose) {
    errors.push(
      `Mismatched EMPHASIS markers: ${emphasisOpen} opening, ${emphasisClose} closing`
    );
  }

  // Check PAUSE marker format
  const pauseMarkers: string[] = script.match(/\[PAUSE:\d+ms\]/g) || [];
  const allPauseMarkers: string[] = script.match(/\[PAUSE:[^\]]*\]/g) || [];
  const invalidPauses = allPauseMarkers.filter(
    (pause) => !pauseMarkers.includes(pause)
  );

  if (invalidPauses.length > 0) {
    errors.push(`Invalid PAUSE markers found: ${invalidPauses.join(', ')}`);
  }

  // Check PRONUNCIATION marker format
  const pronunciationMarkers: string[] = script.match(/\[PRONUNCIATION:[^=]+=\S+\]/g) || [];
  const allPronunciationMarkers: string[] = script.match(/\[PRONUNCIATION:[^\]]*\]/g) || [];
  const invalidPronunciations = allPronunciationMarkers.filter(
    (pron) => !pronunciationMarkers.includes(pron)
  );

  if (invalidPronunciations.length > 0) {
    errors.push(
      `Invalid PRONUNCIATION markers found: ${invalidPronunciations.join(', ')}`
    );
  }

  // Warnings: Check if script might be too long or too short
  const wordCount = script.split(/\s+/).length;
  const estimatedMinutes = wordCount / 150; // Assume ~150 words per minute

  if (estimatedMinutes < 2) {
    warnings.push(`Script may be too short (~${estimatedMinutes.toFixed(1)} minutes)`);
  }

  if (estimatedMinutes > 15) {
    warnings.push(`Script may be too long (~${estimatedMinutes.toFixed(1)} minutes)`);
  }

  // Warning: Check if there are very few pauses
  if (pauseMarkers.length < 3 && wordCount > 100) {
    warnings.push('Consider adding more pause markers for better pacing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      pauseCount: pauseMarkers.length,
      emphasisCount: emphasisOpen,
      pronunciationCount: pronunciationMarkers.length,
    },
  };
}

/**
 * Processes a script to convert TTS markers to SSML (Speech Synthesis Markup Language)
 * This allows the script to be used with SSML-compatible TTS engines
 *
 * @param script - Script with custom TTS markers
 * @returns Script converted to SSML format
 *
 * @example
 * ```typescript
 * const script = "Hello[PAUSE:500ms][EMPHASIS]world[/EMPHASIS]";
 * const ssml = convertToSSML(script);
 * // Returns: "<speak>Hello<break time="500ms"/><emphasis>world</emphasis></speak>"
 * ```
 */
export function convertToSSML(script: string): string {
  let ssml = script;

  // Convert PAUSE markers to SSML <break> tags
  ssml = ssml.replace(/\[PAUSE:(\d+)ms\]/g, '<break time="$1ms"/>');

  // Convert EMPHASIS markers to SSML <emphasis> tags
  ssml = ssml.replace(/\[EMPHASIS\]/g, '<emphasis>');
  ssml = ssml.replace(/\[\/EMPHASIS\]/g, '</emphasis>');

  // Convert PRONUNCIATION markers to SSML <phoneme> or <say-as> tags
  // Format: [PRONUNCIATION:word=reading] -> <phoneme>word</phoneme>
  ssml = ssml.replace(
    /\[PRONUNCIATION:([^=]+)=([^\]]+)\]/g,
    '<phoneme alphabet="ipa" ph="$2">$1</phoneme>'
  );

  // Wrap in <speak> tags if not already present
  if (!ssml.includes('<speak>')) {
    ssml = `<speak>${ssml}</speak>`;
  }

  return ssml;
}

