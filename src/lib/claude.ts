import Anthropic from '@anthropic-ai/sdk';

/**
 * Initialize Anthropic SDK client
 * Uses ANTHROPIC_API_KEY from environment variables
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Stream message generation with Claude
 * Supports streaming responses for real-time content delivery
 */
export async function* streamMessage(
  messages: Anthropic.Messages.MessageParam[],
  system?: string
): AsyncGenerator<string, void, unknown> {
  const stream = anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system,
    messages,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text;
    }
  }
}

/**
 * Send a single message to Claude and get complete response
 */
export async function getMessage(
  messages: Anthropic.Messages.MessageParam[],
  system?: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system,
    messages,
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  return textContent.text;
}
