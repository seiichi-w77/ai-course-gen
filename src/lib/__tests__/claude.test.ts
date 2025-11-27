import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import { streamMessage, getMessage } from '../claude';

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk');

describe('Claude API Library', () => {
  let mockAnthropicInstance: {
    messages: {
      stream: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock Anthropic instance
    mockAnthropicInstance = {
      messages: {
        stream: vi.fn(),
        create: vi.fn(),
      },
    };

    // Mock the Anthropic constructor to return our mock instance
    vi.mocked(Anthropic).mockImplementation(() => mockAnthropicInstance as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('streamMessage', () => {
    it('should stream text chunks from Claude API', async () => {
      const mockChunks = [
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Hello' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: ', ' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'world!' },
        },
      ];

      // Create async iterable mock
      async function* mockAsyncIterator() {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      }

      mockAnthropicInstance.messages.stream.mockReturnValue(mockAsyncIterator());

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Say hello',
        },
      ];

      const systemPrompt = 'You are a helpful assistant.';

      const result: string[] = [];
      for await (const chunk of streamMessage(messages, systemPrompt)) {
        result.push(chunk);
      }

      expect(result).toEqual(['Hello', ', ', 'world!']);
      expect(mockAnthropicInstance.messages.stream).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      });
    });

    it('should work without system prompt', async () => {
      async function* mockAsyncIterator() {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Response' },
        };
      }

      mockAnthropicInstance.messages.stream.mockReturnValue(mockAsyncIterator());

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      const result: string[] = [];
      for await (const chunk of streamMessage(messages)) {
        result.push(chunk);
      }

      expect(result).toEqual(['Response']);
      expect(mockAnthropicInstance.messages.stream).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: undefined,
        messages,
      });
    });

    it('should filter out non-text chunks', async () => {
      const mockChunks = [
        {
          type: 'content_block_start',
          content_block: { type: 'text', text: '' },
        },
        {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Text chunk' },
        },
        {
          type: 'message_delta',
          delta: { stop_reason: 'end_turn' },
        },
      ];

      async function* mockAsyncIterator() {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      }

      mockAnthropicInstance.messages.stream.mockReturnValue(mockAsyncIterator());

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      const result: string[] = [];
      for await (const chunk of streamMessage(messages)) {
        result.push(chunk);
      }

      // Should only include the text_delta chunk
      expect(result).toEqual(['Text chunk']);
    });

    it('should handle empty stream', async () => {
      async function* mockAsyncIterator() {
        // Empty stream
      }

      mockAnthropicInstance.messages.stream.mockReturnValue(mockAsyncIterator());

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      const result: string[] = [];
      for await (const chunk of streamMessage(messages)) {
        result.push(chunk);
      }

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      async function* mockAsyncIterator() {
        throw new Error('API error: rate limit exceeded');
      }

      mockAnthropicInstance.messages.stream.mockReturnValue(mockAsyncIterator());

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      await expect(async () => {
        for await (const _chunk of streamMessage(messages)) {
          // Should throw before yielding any chunks
        }
      }).rejects.toThrow('API error: rate limit exceeded');
    });

    it('should handle multiple messages in conversation', async () => {
      async function* mockAsyncIterator() {
        yield {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'Follow-up response' },
        };
      }

      mockAnthropicInstance.messages.stream.mockReturnValue(mockAsyncIterator());

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'First message',
        },
        {
          role: 'assistant',
          content: 'First response',
        },
        {
          role: 'user',
          content: 'Second message',
        },
      ];

      const result: string[] = [];
      for await (const chunk of streamMessage(messages)) {
        result.push(chunk);
      }

      expect(result).toEqual(['Follow-up response']);
      expect(mockAnthropicInstance.messages.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages,
        })
      );
    });
  });

  describe('getMessage', () => {
    it('should get complete message from Claude API', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'This is a complete response from Claude.',
          },
        ],
      };

      mockAnthropicInstance.messages.create.mockResolvedValue(mockResponse);

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Tell me something',
        },
      ];

      const systemPrompt = 'You are a helpful assistant.';

      const result = await getMessage(messages, systemPrompt);

      expect(result).toBe('This is a complete response from Claude.');
      expect(mockAnthropicInstance.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages,
      });
    });

    it('should work without system prompt', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Response without system prompt',
          },
        ],
      };

      mockAnthropicInstance.messages.create.mockResolvedValue(mockResponse);

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      const result = await getMessage(messages);

      expect(result).toBe('Response without system prompt');
      expect(mockAnthropicInstance.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: undefined,
        messages,
      });
    });

    it('should throw error when no text content in response', async () => {
      const mockResponse = {
        content: [
          {
            type: 'image',
            source: { type: 'base64', data: 'abc123' },
          },
        ],
      };

      mockAnthropicInstance.messages.create.mockResolvedValue(mockResponse);

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      await expect(getMessage(messages)).rejects.toThrow('No text content in response');
    });

    it('should throw error when content array is empty', async () => {
      const mockResponse = {
        content: [],
      };

      mockAnthropicInstance.messages.create.mockResolvedValue(mockResponse);

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      await expect(getMessage(messages)).rejects.toThrow('No text content in response');
    });

    it('should handle API errors', async () => {
      mockAnthropicInstance.messages.create.mockRejectedValue(
        new Error('API error: Authentication failed')
      );

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      await expect(getMessage(messages)).rejects.toThrow(
        'API error: Authentication failed'
      );
    });

    it('should return first text block when multiple content blocks exist', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'First text block',
          },
          {
            type: 'text',
            text: 'Second text block',
          },
        ],
      };

      mockAnthropicInstance.messages.create.mockResolvedValue(mockResponse);

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Test',
        },
      ];

      const result = await getMessage(messages);

      expect(result).toBe('First text block');
    });

    it('should handle conversation history', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Response with context',
          },
        ],
      };

      mockAnthropicInstance.messages.create.mockResolvedValue(mockResponse);

      const messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: 'Hello',
        },
        {
          role: 'assistant',
          content: 'Hi there!',
        },
        {
          role: 'user',
          content: 'How are you?',
        },
      ];

      const result = await getMessage(messages);

      expect(result).toBe('Response with context');
      expect(mockAnthropicInstance.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages,
        })
      );
    });
  });

  describe('API configuration', () => {
    it('should use correct model version', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Test',
          },
        ],
      };

      mockAnthropicInstance.messages.create.mockResolvedValue(mockResponse);

      await getMessage([{ role: 'user', content: 'Test' }]);

      expect(mockAnthropicInstance.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
        })
      );
    });

    it('should use correct max_tokens value', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Test',
          },
        ],
      };

      mockAnthropicInstance.messages.create.mockResolvedValue(mockResponse);

      await getMessage([{ role: 'user', content: 'Test' }]);

      expect(mockAnthropicInstance.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 4096,
        })
      );
    });
  });
});
