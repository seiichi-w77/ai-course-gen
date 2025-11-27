/**
 * Unit tests for script-generation.ts
 * Tests TTS-optimized prompt generation functionality
 */

import { describe, it, expect } from 'vitest';
import {
  buildScriptPrompt,
  validateScriptMarkers,
  convertToSSML,
  scriptPromptTemplates,
  type ScriptPromptConfig,
} from '../script-generation';

describe('scriptPromptTemplates', () => {
  it('should have templates for all tones and languages', () => {
    expect(scriptPromptTemplates).toHaveProperty('formal');
    expect(scriptPromptTemplates).toHaveProperty('casual');
    expect(scriptPromptTemplates).toHaveProperty('educational');

    expect(scriptPromptTemplates.formal).toHaveProperty('ja-JP');
    expect(scriptPromptTemplates.formal).toHaveProperty('en-US');
    expect(scriptPromptTemplates.casual).toHaveProperty('ja-JP');
    expect(scriptPromptTemplates.casual).toHaveProperty('en-US');
    expect(scriptPromptTemplates.educational).toHaveProperty('ja-JP');
    expect(scriptPromptTemplates.educational).toHaveProperty('en-US');
  });

  it('should contain TTS marker documentation in templates', () => {
    const template = scriptPromptTemplates.formal['ja-JP'];
    expect(template).toContain('[PAUSE:');
    expect(template).toContain('[EMPHASIS]');
    expect(template).toContain('[PRONUNCIATION:');
  });
});

describe('buildScriptPrompt', () => {
  it('should build a basic prompt with minimal config', () => {
    const config: ScriptPromptConfig = {
      language: 'ja-JP',
      tone: 'formal',
      topic: 'TypeScriptの基礎',
    };

    const prompt = buildScriptPrompt(config);

    expect(prompt).toContain('TypeScriptの基礎');
    expect(prompt).toContain('[PAUSE:');
    expect(prompt).toContain('[EMPHASIS]');
    expect(prompt).toContain('[PRONUNCIATION:');
  });

  it('should include custom audience and duration', () => {
    const config: ScriptPromptConfig = {
      language: 'en-US',
      tone: 'casual',
      topic: 'Introduction to AI',
      audience: 'beginners',
      durationMinutes: 10,
    };

    const prompt = buildScriptPrompt(config);

    expect(prompt).toContain('Introduction to AI');
    expect(prompt).toContain('beginners');
    expect(prompt).toContain('10 minutes');
  });

  it('should include additional instructions when provided', () => {
    const config: ScriptPromptConfig = {
      language: 'ja-JP',
      tone: 'educational',
      topic: 'プログラミング入門',
      additionalInstructions: 'コード例を3つ含めてください',
    };

    const prompt = buildScriptPrompt(config);

    expect(prompt).toContain('コード例を3つ含めてください');
  });

  it('should throw error for empty topic', () => {
    const config: ScriptPromptConfig = {
      language: 'ja-JP',
      tone: 'formal',
      topic: '',
    };

    expect(() => buildScriptPrompt(config)).toThrow('Topic is required');
  });

  it('should throw error for invalid language', () => {
    const config = {
      language: 'fr-FR' as any,
      tone: 'formal',
      topic: 'Test',
    };

    expect(() => buildScriptPrompt(config)).toThrow('Language must be');
  });

  it('should throw error for invalid tone', () => {
    const config = {
      language: 'ja-JP',
      tone: 'serious' as any,
      topic: 'Test',
    };

    expect(() => buildScriptPrompt(config)).toThrow('Tone must be');
  });

  it('should use default values when optional fields are omitted', () => {
    const config: ScriptPromptConfig = {
      language: 'en-US',
      tone: 'formal',
      topic: 'Test Topic',
    };

    const prompt = buildScriptPrompt(config);

    expect(prompt).toContain('general audience');
    expect(prompt).toContain('5 minutes');
  });
});

describe('validateScriptMarkers', () => {
  it('should validate a script with correct markers', () => {
    const script = `
      こんにちは[PAUSE:500ms]
      [EMPHASIS]TypeScript[/EMPHASIS]について説明します[PAUSE:300ms]
      [PRONUNCIATION:型=かた]システムが重要です
    `;

    const result = validateScriptMarkers(script);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.stats.pauseCount).toBe(2);
    expect(result.stats.emphasisCount).toBe(1);
    expect(result.stats.pronunciationCount).toBe(1);
  });

  it('should detect mismatched EMPHASIS markers', () => {
    const script = '[EMPHASIS]Important text without closing';

    const result = validateScriptMarkers(script);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      expect.stringContaining('Mismatched EMPHASIS markers')
    );
  });

  it('should detect invalid PAUSE markers', () => {
    const script = 'Text with [PAUSE:invalid] marker';

    const result = validateScriptMarkers(script);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      expect.stringContaining('Invalid PAUSE markers')
    );
  });

  it('should detect invalid PRONUNCIATION markers', () => {
    const script = 'Text with [PRONUNCIATION:invalid format] marker';

    const result = validateScriptMarkers(script);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      expect.stringContaining('Invalid PRONUNCIATION markers')
    );
  });

  it('should warn about very short scripts', () => {
    const script = 'Very short script[PAUSE:100ms]end';

    const result = validateScriptMarkers(script);

    expect(result.warnings).toContain(
      expect.stringContaining('may be too short')
    );
  });

  it('should warn about very long scripts', () => {
    const longScript = 'word '.repeat(2500) + '[PAUSE:100ms]';

    const result = validateScriptMarkers(longScript);

    expect(result.warnings).toContain(
      expect.stringContaining('may be too long')
    );
  });

  it('should warn about insufficient pauses', () => {
    const script = 'word '.repeat(150); // Long script with no pauses

    const result = validateScriptMarkers(script);

    expect(result.warnings).toContain(
      expect.stringContaining('more pause markers')
    );
  });

  it('should count markers correctly', () => {
    const script = `
      [PAUSE:100ms]First[PAUSE:200ms]Second[PAUSE:300ms]
      [EMPHASIS]One[/EMPHASIS][EMPHASIS]Two[/EMPHASIS]
      [PRONUNCIATION:word1=pron1][PRONUNCIATION:word2=pron2][PRONUNCIATION:word3=pron3]
    `;

    const result = validateScriptMarkers(script);

    expect(result.stats.pauseCount).toBe(3);
    expect(result.stats.emphasisCount).toBe(2);
    expect(result.stats.pronunciationCount).toBe(3);
  });
});

describe('convertToSSML', () => {
  it('should convert PAUSE markers to SSML break tags', () => {
    const script = 'Hello[PAUSE:500ms]world';
    const ssml = convertToSSML(script);

    expect(ssml).toContain('<break time="500ms"/>');
    expect(ssml).not.toContain('[PAUSE:500ms]');
  });

  it('should convert EMPHASIS markers to SSML emphasis tags', () => {
    const script = '[EMPHASIS]important text[/EMPHASIS]';
    const ssml = convertToSSML(script);

    expect(ssml).toContain('<emphasis>important text</emphasis>');
    expect(ssml).not.toContain('[EMPHASIS]');
    expect(ssml).not.toContain('[/EMPHASIS]');
  });

  it('should convert PRONUNCIATION markers to SSML phoneme tags', () => {
    const script = '[PRONUNCIATION:word=pronunciation]';
    const ssml = convertToSSML(script);

    expect(ssml).toContain('<phoneme');
    expect(ssml).toContain('alphabet="ipa"');
    expect(ssml).toContain('ph="pronunciation"');
    expect(ssml).toContain('>word</phoneme>');
  });

  it('should wrap script in speak tags', () => {
    const script = 'Simple text';
    const ssml = convertToSSML(script);

    expect(ssml).toMatch(/^<speak>.*<\/speak>$/);
  });

  it('should not double-wrap if speak tags already exist', () => {
    const script = '<speak>Already wrapped</speak>';
    const ssml = convertToSSML(script);

    // Should not add additional <speak> tags
    const speakCount = (ssml.match(/<speak>/g) || []).length;
    expect(speakCount).toBe(1);
  });

  it('should handle complex script with multiple markers', () => {
    const script = `
      Hello[PAUSE:300ms][EMPHASIS]everyone[/EMPHASIS][PAUSE:500ms]
      Today we'll learn about[PAUSE:200ms]
      [PRONUNCIATION:TypeScript=taɪpskrɪpt]
    `;

    const ssml = convertToSSML(script);

    expect(ssml).toContain('<break time="300ms"/>');
    expect(ssml).toContain('<break time="500ms"/>');
    expect(ssml).toContain('<break time="200ms"/>');
    expect(ssml).toContain('<emphasis>everyone</emphasis>');
    expect(ssml).toContain('<phoneme');
    expect(ssml).toContain('>TypeScript</phoneme>');
  });

  it('should preserve text content without markers', () => {
    const script = 'This is plain text without any markers.';
    const ssml = convertToSSML(script);

    expect(ssml).toContain('This is plain text without any markers.');
  });
});

describe('Integration: Full workflow', () => {
  it('should generate, validate, and convert a complete script', () => {
    // 1. Generate prompt
    const config: ScriptPromptConfig = {
      language: 'ja-JP',
      tone: 'educational',
      topic: 'TypeScript入門',
      audience: '初心者プログラマー',
      durationMinutes: 5,
    };

    const prompt = buildScriptPrompt(config);
    expect(prompt).toBeTruthy();

    // 2. Simulate AI-generated script with markers
    const generatedScript = `
      皆さん、こんにちは[PAUSE:500ms]
      今日は[EMPHASIS]TypeScript[/EMPHASIS]の基礎について学びましょう[PAUSE:600ms]
      TypeScriptは[PRONUNCIATION:型=かた]安全なプログラミング言語です[PAUSE:400ms]
    `;

    // 3. Validate the script
    const validation = validateScriptMarkers(generatedScript);
    expect(validation.isValid).toBe(true);
    expect(validation.stats.pauseCount).toBeGreaterThan(0);
    expect(validation.stats.emphasisCount).toBeGreaterThan(0);

    // 4. Convert to SSML
    const ssml = convertToSSML(generatedScript);
    expect(ssml).toContain('<speak>');
    expect(ssml).toContain('<break');
    expect(ssml).toContain('<emphasis>');
    expect(ssml).toContain('</speak>');
  });
});
