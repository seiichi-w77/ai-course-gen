/**
 * Tests for Course Generation Prompts
 */

import { describe, it, expect } from 'vitest';
import {
  generateCoursePrompt,
  validateGeneratedCourse,
  type CoursePromptConfig,
} from '../course-generation';

describe('generateCoursePrompt', () => {
  describe('basic validation', () => {
    it('should throw error if topic is missing', () => {
      expect(() => {
        generateCoursePrompt({
          topic: '',
          level: 'beginner',
          language: 'en',
          numModules: 4,
        });
      }).toThrow('Topic is required');
    });

    it('should throw error if level is invalid', () => {
      expect(() => {
        generateCoursePrompt({
          topic: 'TypeScript',
          level: 'expert' as CoursePromptConfig['level'],
          language: 'en',
          numModules: 4,
        });
      }).toThrow('Level must be');
    });

    it('should throw error if language is invalid', () => {
      expect(() => {
        generateCoursePrompt({
          topic: 'TypeScript',
          level: 'beginner',
          language: 'fr' as CoursePromptConfig['language'],
          numModules: 4,
        });
      }).toThrow('Language must be');
    });

    it('should throw error if numModules is out of range', () => {
      expect(() => {
        generateCoursePrompt({
          topic: 'TypeScript',
          level: 'beginner',
          language: 'en',
          numModules: 0,
        });
      }).toThrow('Number of modules must be between 1 and 20');

      expect(() => {
        generateCoursePrompt({
          topic: 'TypeScript',
          level: 'beginner',
          language: 'en',
          numModules: 25,
        });
      }).toThrow('Number of modules must be between 1 and 20');
    });
  });

  describe('English prompts', () => {
    it('should generate beginner level English prompt', () => {
      const result = generateCoursePrompt({
        topic: 'TypeScript Fundamentals',
        level: 'beginner',
        language: 'en',
        numModules: 3,
      });

      expect(result.systemPrompt).toContain('Beginner level');
      expect(result.systemPrompt).toContain('TypeScript Fundamentals');
      expect(result.systemPrompt).toContain('Number of Modules: 3');
      expect(result.systemPrompt).toContain('JSON');
      expect(result.userPrompt).toContain('Generate a complete');
      expect(result.userPrompt).toContain('TypeScript Fundamentals');
    });

    it('should generate intermediate level English prompt', () => {
      const result = generateCoursePrompt({
        topic: 'Advanced React Patterns',
        level: 'intermediate',
        language: 'en',
        numModules: 5,
      });

      expect(result.systemPrompt).toContain('Intermediate level');
      expect(result.systemPrompt).toContain('Advanced React Patterns');
      expect(result.systemPrompt).toContain('Number of Modules: 5');
    });

    it('should generate advanced level English prompt', () => {
      const result = generateCoursePrompt({
        topic: 'System Design',
        level: 'advanced',
        language: 'en',
        numModules: 8,
      });

      expect(result.systemPrompt).toContain('Advanced level');
      expect(result.systemPrompt).toContain('System Design');
      expect(result.systemPrompt).toContain('Number of Modules: 8');
    });
  });

  describe('Japanese prompts', () => {
    it('should generate beginner level Japanese prompt', () => {
      const result = generateCoursePrompt({
        topic: 'TypeScript基礎',
        level: 'beginner',
        language: 'ja',
        numModules: 4,
      });

      expect(result.systemPrompt).toContain('初心者レベル');
      expect(result.systemPrompt).toContain('TypeScript基礎');
      expect(result.systemPrompt).toContain('4');
      expect(result.userPrompt).toContain('生成してください');
    });

    it('should generate intermediate level Japanese prompt', () => {
      const result = generateCoursePrompt({
        topic: 'React実践パターン',
        level: 'intermediate',
        language: 'ja',
        numModules: 6,
      });

      expect(result.systemPrompt).toContain('中級レベル');
      expect(result.systemPrompt).toContain('React実践パターン');
    });

    it('should generate advanced level Japanese prompt', () => {
      const result = generateCoursePrompt({
        topic: 'システム設計',
        level: 'advanced',
        language: 'ja',
        numModules: 10,
      });

      expect(result.systemPrompt).toContain('上級レベル');
      expect(result.systemPrompt).toContain('システム設計');
    });
  });

  describe('optional parameters', () => {
    it('should include focus areas in prompt', () => {
      const result = generateCoursePrompt({
        topic: 'Web Development',
        level: 'beginner',
        language: 'en',
        numModules: 5,
        focusAreas: ['HTML', 'CSS', 'JavaScript'],
      });

      expect(result.systemPrompt).toContain('HTML');
      expect(result.systemPrompt).toContain('CSS');
      expect(result.systemPrompt).toContain('JavaScript');
    });

    it('should include objectives in user prompt', () => {
      const result = generateCoursePrompt({
        topic: 'Python Programming',
        level: 'intermediate',
        language: 'en',
        numModules: 4,
        objectives: ['Master OOP', 'Learn async programming'],
      });

      expect(result.userPrompt).toContain('Master OOP');
      expect(result.userPrompt).toContain('async programming');
    });

    it('should include duration in prompt', () => {
      const result = generateCoursePrompt({
        topic: 'Data Science',
        level: 'advanced',
        language: 'en',
        numModules: 8,
        duration: '40 hours',
      });

      expect(result.systemPrompt).toContain('40 hours');
    });

    it('should include additional instructions', () => {
      const result = generateCoursePrompt({
        topic: 'Machine Learning',
        level: 'advanced',
        language: 'en',
        numModules: 6,
        additionalInstructions: 'Include practical Jupyter notebook examples',
      });

      expect(result.systemPrompt).toContain('Jupyter notebook');
    });
  });

  describe('quality standards', () => {
    it('should include quality standards in system prompt', () => {
      const result = generateCoursePrompt({
        topic: 'Software Engineering',
        level: 'intermediate',
        language: 'en',
        numModules: 5,
      });

      expect(result.systemPrompt).toContain('Quality Standards');
      expect(result.systemPrompt).toContain('Structure:');
      expect(result.systemPrompt).toContain('Content:');
      expect(result.systemPrompt).toContain('Exercises:');
    });

    it('should include level-specific characteristics', () => {
      const beginnerResult = generateCoursePrompt({
        topic: 'Programming',
        level: 'beginner',
        language: 'en',
        numModules: 3,
      });

      expect(beginnerResult.systemPrompt).toContain('fundamental concepts');
      expect(beginnerResult.systemPrompt).toContain('Minimal prerequisites');

      const advancedResult = generateCoursePrompt({
        topic: 'Programming',
        level: 'advanced',
        language: 'en',
        numModules: 3,
      });

      expect(advancedResult.systemPrompt).toContain('Sophisticated concepts');
      expect(advancedResult.systemPrompt).toContain('practical experience');
    });
  });
});

describe('validateGeneratedCourse', () => {
  it('should validate a properly structured course', () => {
    const validCourse = {
      id: 'course_test',
      title: 'Test Course',
      description: 'A test course description',
      topic: 'Testing',
      level: 'beginner',
      objectives: ['Learn testing'],
      modules: [
        {
          id: 'module_1',
          title: 'Module 1',
          description: 'First module',
          keyConcepts: ['Concept 1'],
          lessons: [
            {
              id: 'lesson_1_1',
              title: 'Lesson 1',
              duration: 45,
              objectives: ['Objective 1'],
              content: 'This is lesson content that is long enough to pass validation. It contains more than 200 characters to ensure it meets the minimum content length requirement for a proper lesson.',
              exercises: [],
            },
          ],
          totalDuration: 45,
        },
      ],
      totalDuration: 45,
      estimatedHours: 1,
    };

    const result = validateGeneratedCourse(validCourse);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const invalidCourse = {
      // Missing id
      title: 'Test Course',
      // Missing description
      modules: [],
    };

    const result = validateGeneratedCourse(invalidCourse);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing course ID');
    expect(result.errors).toContain('Missing course description');
  });

  it('should detect invalid module structure', () => {
    const courseWithInvalidModule = {
      id: 'course_test',
      title: 'Test Course',
      description: 'Description',
      modules: [
        {
          // Missing id and title
          lessons: [],
        },
      ],
    };

    const result = validateGeneratedCourse(courseWithInvalidModule);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Module 1'))).toBe(true);
  });

  it('should warn about short content', () => {
    const courseWithShortContent = {
      id: 'course_test',
      title: 'Test Course',
      description: 'Description',
      modules: [
        {
          id: 'module_1',
          title: 'Module 1',
          description: 'Description',
          keyConcepts: [],
          lessons: [
            {
              id: 'lesson_1',
              title: 'Lesson 1',
              content: 'Too short',
              duration: 45,
              objectives: [],
            },
          ],
          totalDuration: 45,
        },
      ],
      totalDuration: 45,
    };

    const result = validateGeneratedCourse(courseWithShortContent);
    expect(result.warnings.some((w) => w.includes('too short'))).toBe(true);
  });

  it('should warn about very short or long course durations', () => {
    const shortCourse = {
      id: 'course_test',
      title: 'Test',
      description: 'Test',
      modules: [],
      totalDuration: 30, // Less than 60 minutes
    };

    const shortResult = validateGeneratedCourse(shortCourse);
    expect(shortResult.warnings.some((w) => w.includes('very short'))).toBe(true);

    const longCourse = {
      id: 'course_test',
      title: 'Test',
      description: 'Test',
      modules: [],
      totalDuration: 7000, // More than 6000 minutes
    };

    const longResult = validateGeneratedCourse(longCourse);
    expect(longResult.warnings.some((w) => w.includes('very long'))).toBe(true);
  });

  it('should handle non-object input', () => {
    const result1 = validateGeneratedCourse(null);
    expect(result1.isValid).toBe(false);
    expect(result1.errors).toContain('Course data must be an object');

    const result2 = validateGeneratedCourse('invalid');
    expect(result2.isValid).toBe(false);
    expect(result2.errors).toContain('Course data must be an object');
  });
});
