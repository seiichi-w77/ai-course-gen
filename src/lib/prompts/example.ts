/**
 * Example usage of script-generation module
 * Demonstrates the complete workflow from prompt generation to audio synthesis
 */

import {
  buildScriptPrompt,
  validateScriptMarkers,
  convertToSSML,
  type ScriptPromptConfig,
} from './script-generation';

/**
 * Example 1: Generate a formal Japanese script prompt
 */
export function example1_FormalJapanese() {
  console.log('=== Example 1: Formal Japanese Script ===\n');

  const config: ScriptPromptConfig = {
    language: 'ja-JP',
    tone: 'formal',
    topic: '企業におけるAI活用の最新動向',
    audience: 'ビジネスエグゼクティブ',
    durationMinutes: 10,
    additionalInstructions: '具体的な事例を3つ含めてください',
  };

  const prompt = buildScriptPrompt(config);
  console.log('Generated Prompt:\n');
  console.log(prompt);
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Example 2: Generate a casual English script prompt
 */
export function example2_CasualEnglish() {
  console.log('=== Example 2: Casual English Script ===\n');

  const config: ScriptPromptConfig = {
    language: 'en-US',
    tone: 'casual',
    topic: 'Getting Started with TypeScript in 2025',
    audience: 'web developers',
    durationMinutes: 5,
  };

  const prompt = buildScriptPrompt(config);
  console.log('Generated Prompt:\n');
  console.log(prompt);
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Example 3: Generate an educational script prompt
 */
export function example3_EducationalJapanese() {
  console.log('=== Example 3: Educational Japanese Script ===\n');

  const config: ScriptPromptConfig = {
    language: 'ja-JP',
    tone: 'educational',
    topic: 'プログラミング基礎：関数とは何か',
    audience: 'プログラミング初学者',
    durationMinutes: 8,
    additionalInstructions: 'コード例を使って段階的に説明してください',
  };

  const prompt = buildScriptPrompt(config);
  console.log('Generated Prompt:\n');
  console.log(prompt);
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Example 4: Validate a sample script with TTS markers
 */
export function example4_ValidateScript() {
  console.log('=== Example 4: Script Validation ===\n');

  const sampleScript = `
皆さん、こんにちは[PAUSE:500ms]
今日は[EMPHASIS]TypeScript[/EMPHASIS]の基礎について学びましょう[PAUSE:600ms]

TypeScriptとは、JavaScriptに[PRONUNCIATION:型=かた]システムを追加した言語です[PAUSE:400ms]
これにより、[EMPHASIS]コードの安全性[/EMPHASIS]が大幅に向上します[PAUSE:500ms]

まず、基本的な[PRONUNCIATION:型=かた]定義から始めましょう[PAUSE:600ms]
  `;

  const validation = validateScriptMarkers(sampleScript);

  console.log('Validation Result:');
  console.log('- Is Valid:', validation.isValid);
  console.log('\nStatistics:');
  console.log('- Pause Count:', validation.stats.pauseCount);
  console.log('- Emphasis Count:', validation.stats.emphasisCount);
  console.log('- Pronunciation Count:', validation.stats.pronunciationCount);

  if (validation.errors.length > 0) {
    console.log('\nErrors:');
    validation.errors.forEach((error) => console.log('  -', error));
  }

  if (validation.warnings.length > 0) {
    console.log('\nWarnings:');
    validation.warnings.forEach((warning) => console.log('  -', warning));
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Example 5: Convert script to SSML
 */
export function example5_ConvertToSSML() {
  console.log('=== Example 5: SSML Conversion ===\n');

  const script = `
Hello everyone[PAUSE:500ms]
Today we'll learn about[PAUSE:300ms]
[EMPHASIS]TypeScript[/EMPHASIS][PAUSE:600ms]
It's a [PRONUNCIATION:statically=stætɪkli] typed language
  `;

  console.log('Original Script:');
  console.log(script);
  console.log('\nConverted to SSML:');
  const ssml = convertToSSML(script);
  console.log(ssml);
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Example 6: Demonstrate error handling
 */
export function example6_ErrorHandling() {
  console.log('=== Example 6: Error Handling ===\n');

  // Test 1: Empty topic
  try {
    buildScriptPrompt({
      language: 'ja-JP',
      tone: 'formal',
      topic: '',
    });
  } catch (error) {
    console.log('Error 1 (Empty topic):', (error as Error).message);
  }

  // Test 2: Invalid language
  try {
    buildScriptPrompt({
      language: 'fr-FR' as any,
      tone: 'formal',
      topic: 'Test',
    });
  } catch (error) {
    console.log('Error 2 (Invalid language):', (error as Error).message);
  }

  // Test 3: Invalid tone
  try {
    buildScriptPrompt({
      language: 'ja-JP',
      tone: 'humorous' as any,
      topic: 'Test',
    });
  } catch (error) {
    console.log('Error 3 (Invalid tone):', (error as Error).message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Example 7: Validate problematic scripts
 */
export function example7_ValidationEdgeCases() {
  console.log('=== Example 7: Validation Edge Cases ===\n');

  // Case 1: Mismatched emphasis markers
  console.log('Case 1: Mismatched EMPHASIS markers');
  const script1 = 'This has [EMPHASIS]unclosed emphasis';
  const result1 = validateScriptMarkers(script1);
  console.log('- Is Valid:', result1.isValid);
  console.log('- Errors:', result1.errors);
  console.log('');

  // Case 2: Invalid pause format
  console.log('Case 2: Invalid PAUSE format');
  const script2 = 'This has [PAUSE:invalid] format';
  const result2 = validateScriptMarkers(script2);
  console.log('- Is Valid:', result2.isValid);
  console.log('- Errors:', result2.errors);
  console.log('');

  // Case 3: Invalid pronunciation format
  console.log('Case 3: Invalid PRONUNCIATION format');
  const script3 = 'This has [PRONUNCIATION:missing equals sign] format';
  const result3 = validateScriptMarkers(script3);
  console.log('- Is Valid:', result3.isValid);
  console.log('- Errors:', result3.errors);
  console.log('');

  // Case 4: Too short script
  console.log('Case 4: Very short script (should warn)');
  const script4 = 'Short script[PAUSE:100ms]';
  const result4 = validateScriptMarkers(script4);
  console.log('- Warnings:', result4.warnings);
  console.log('');

  // Case 5: Script with no pauses
  console.log('Case 5: Long script without pauses (should warn)');
  const script5 = 'word '.repeat(150);
  const result5 = validateScriptMarkers(script5);
  console.log('- Warnings:', result5.warnings);

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Example 8: Complete workflow simulation
 */
export function example8_CompleteWorkflow() {
  console.log('=== Example 8: Complete Workflow ===\n');

  // Step 1: Generate prompt
  console.log('Step 1: Generate Prompt Configuration');
  const config: ScriptPromptConfig = {
    language: 'ja-JP',
    tone: 'educational',
    topic: 'TypeScriptのインターフェース',
    audience: '中級プログラマー',
    durationMinutes: 7,
    additionalInstructions: '実践的なコード例を含めてください',
  };
  console.log('Config:', JSON.stringify(config, null, 2));

  const prompt = buildScriptPrompt(config);
  console.log('\nStep 2: Generated Prompt Length:', prompt.length, 'characters');

  // Step 3: Simulate AI-generated script
  console.log('\nStep 3: Simulated AI-Generated Script');
  const aiGeneratedScript = `
こんにちは[PAUSE:500ms]
今日は[EMPHASIS]TypeScript[/EMPHASIS]の[PRONUNCIATION:インターフェース=いんたーふぇーす]について学びましょう[PAUSE:600ms]

インターフェースとは、[EMPHASIS]オブジェクトの形状を定義する[/EMPHASIS]仕組みです[PAUSE:400ms]
これにより、コードの[PRONUNCIATION:型=かた]安全性が向上します[PAUSE:500ms]

例を見てみましょう[PAUSE:300ms]
interface User のように定義します[PAUSE:600ms]

このように、インターフェースを使うことで[PAUSE:400ms]
[EMPHASIS]明確な契約[/EMPHASIS]をコード内で表現できます[PAUSE:500ms]
  `;

  // Step 4: Validate
  console.log('\nStep 4: Validate Script');
  const validation = validateScriptMarkers(aiGeneratedScript);
  console.log('- Is Valid:', validation.isValid);
  console.log('- Statistics:', validation.stats);
  if (validation.warnings.length > 0) {
    console.log('- Warnings:', validation.warnings);
  }

  // Step 5: Convert to SSML
  console.log('\nStep 5: Convert to SSML');
  const ssml = convertToSSML(aiGeneratedScript);
  console.log('- SSML Length:', ssml.length, 'characters');
  console.log('- Preview:', ssml.substring(0, 200) + '...');

  // Step 6: Ready for TTS
  console.log('\nStep 6: Ready for TTS Synthesis');
  console.log('- Language:', config.language);
  console.log('- Recommended Voice:', config.language === 'ja-JP' ? 'ja-JP-Neural2-B' : 'en-US-Neural2-C');
  console.log('- Estimated Duration:', config.durationMinutes, 'minutes');

  console.log('\n✅ Workflow Complete!');
  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('\n' + '='.repeat(60));
  console.log('SCRIPT GENERATION EXAMPLES');
  console.log('='.repeat(60) + '\n');

  example1_FormalJapanese();
  example2_CasualEnglish();
  example3_EducationalJapanese();
  example4_ValidateScript();
  example5_ConvertToSSML();
  example6_ErrorHandling();
  example7_ValidationEdgeCases();
  example8_CompleteWorkflow();

  console.log('All examples completed!\n');
}

// Execute if run directly
if (require.main === module) {
  runAllExamples();
}
