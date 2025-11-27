/**
 * Prompts Module
 *
 * Optimized prompt templates for AI-powered content generation:
 * - Course curriculum generation with level-specific optimization
 * - TTS-optimized script generation with special markers
 *
 * @module prompts
 */

// Course Generation
export {
  generateCoursePrompt,
  validateGeneratedCourse,
  type CoursePromptConfig,
  type CourseValidationResult,
} from './course-generation';

// Script Generation
export {
  // Main functions
  buildScriptPrompt,
  validateScriptMarkers,
  convertToSSML,

  // Templates
  scriptPromptTemplates,

  // Types
  type ScriptPromptConfig,
  type ScriptTone,
  type ScriptLanguage,
  type ScriptValidationResult,
} from './script-generation';

// Re-export for convenience
export * from './course-generation';
export * from './script-generation';
