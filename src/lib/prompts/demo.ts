#!/usr/bin/env node
/**
 * Demo script to showcase script-generation functionality
 * Run with: npx tsx src/lib/prompts/demo.ts
 */

import {
  buildScriptPrompt,
  validateScriptMarkers,
  convertToSSML,
  type ScriptPromptConfig,
} from './script-generation';

console.log('='.repeat(70));
console.log('Script Generation Module - Demo');
console.log('='.repeat(70));
console.log('');

// Demo 1: Build a Japanese educational prompt
console.log('1. Building Educational Japanese Prompt');
console.log('-'.repeat(70));

const japaneseConfig: ScriptPromptConfig = {
  language: 'ja-JP',
  tone: 'educational',
  topic: 'TypeScriptの型システム入門',
  audience: '初級プログラマー',
  durationMinutes: 10,
  additionalInstructions: 'コード例を3つ含めてください',
};

const japanesePrompt = buildScriptPrompt(japaneseConfig);
console.log('Config:', JSON.stringify(japaneseConfig, null, 2));
console.log('\nGenerated Prompt Preview (first 300 chars):');
console.log(japanesePrompt.substring(0, 300) + '...');
console.log('');

// Demo 2: Build an English casual prompt
console.log('\n2. Building Casual English Prompt');
console.log('-'.repeat(70));

const englishConfig: ScriptPromptConfig = {
  language: 'en-US',
  tone: 'casual',
  topic: 'Getting Started with TypeScript',
  audience: 'web developers',
  durationMinutes: 5,
};

const englishPrompt = buildScriptPrompt(englishConfig);
console.log('Config:', JSON.stringify(englishConfig, null, 2));
console.log('\nGenerated Prompt Preview (first 300 chars):');
console.log(englishPrompt.substring(0, 300) + '...');
console.log('');

// Demo 3: Validate a sample script
console.log('\n3. Validating Sample Script with TTS Markers');
console.log('-'.repeat(70));

const sampleScript = `
皆さん、こんにちは[PAUSE:500ms]
今日は[EMPHASIS]TypeScript[/EMPHASIS]について学びましょう[PAUSE:600ms]

TypeScriptは、JavaScriptに[PRONUNCIATION:型=かた]安全性を追加した言語です[PAUSE:400ms]
これにより、[EMPHASIS]コードの品質[/EMPHASIS]が大幅に向上します[PAUSE:500ms]

まず基本から始めましょう[PAUSE:300ms]
`;

console.log('Sample Script:');
console.log(sampleScript);

const validation = validateScriptMarkers(sampleScript);
console.log('\nValidation Result:');
console.log('  ✓ Is Valid:', validation.isValid);
console.log('  ✓ Pause Count:', validation.stats.pauseCount);
console.log('  ✓ Emphasis Count:', validation.stats.emphasisCount);
console.log('  ✓ Pronunciation Count:', validation.stats.pronunciationCount);

if (validation.errors.length > 0) {
  console.log('\n  ✗ Errors:');
  validation.errors.forEach((err) => console.log('    -', err));
}

if (validation.warnings.length > 0) {
  console.log('\n  ⚠ Warnings:');
  validation.warnings.forEach((warn) => console.log('    -', warn));
}
console.log('');

// Demo 4: Convert to SSML
console.log('\n4. Converting Script to SSML');
console.log('-'.repeat(70));

const ssml = convertToSSML(sampleScript);
console.log('SSML Output:');
console.log(ssml);
console.log('');

// Demo 5: Error handling
console.log('\n5. Error Handling Demo');
console.log('-'.repeat(70));

try {
  buildScriptPrompt({
    language: 'ja-JP',
    tone: 'formal',
    topic: '', // Empty topic should throw error
  });
} catch (error) {
  console.log('✓ Caught expected error:', (error as Error).message);
}

try {
  buildScriptPrompt({
    language: 'fr-FR' as any, // Invalid language
    tone: 'formal',
    topic: 'Test',
  });
} catch (error) {
  console.log('✓ Caught expected error:', (error as Error).message);
}

// Demo 6: Validation edge cases
console.log('\n\n6. Validation Edge Cases');
console.log('-'.repeat(70));

const problematicScript = `
This has [EMPHASIS]unclosed emphasis.
This has [PAUSE:invalid] format.
This has [PRONUNCIATION:wrong format] marker.
`;

const problematicValidation = validateScriptMarkers(problematicScript);
console.log('Testing problematic script...');
console.log('  Is Valid:', problematicValidation.isValid);
console.log('  Errors Found:', problematicValidation.errors.length);
problematicValidation.errors.forEach((err, i) => {
  console.log(`    ${i + 1}. ${err}`);
});

console.log('\n' + '='.repeat(70));
console.log('✅ Demo Complete!');
console.log('='.repeat(70));
console.log('\nNext Steps:');
console.log('  1. Use buildScriptPrompt() with Claude API to generate scripts');
console.log('  2. Validate scripts with validateScriptMarkers()');
console.log('  3. Convert to SSML with convertToSSML()');
console.log('  4. Generate audio with Google Cloud TTS');
console.log('\nSee README.md for full documentation.');
console.log('');
