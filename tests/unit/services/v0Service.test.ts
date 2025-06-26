import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import OpenAI from 'openai';
import { V0Service } from '../../../src/services/v0Service.js';

// Mock OpenAI
jest.mock('openai');
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

// Mock config
jest.mock('../../../src/config/index.js', () => ({
  config: {
    v0: {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.v0.dev/v1',
      defaultModel: 'v0-1.5-md',
      timeout: 60000,
    },
  },
}));

describe('V0Service', () => {
  let v0Service: V0Service;
  let mockOpenAIInstance: jest.Mocked<OpenAI>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock OpenAI instance
    mockOpenAIInstance = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    } as any;

    MockedOpenAI.mockImplementation(() => mockOpenAIInstance);
    
    v0Service = new V0Service();
  });

  describe('generateUI', () => {
    it('should generate UI successfully', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated UI component code',
            },
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse as any);

      // Act
      const result = await v0Service.generateUI('Create a login form');

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe('Generated UI component code');
      expect(result.metadata?.model).toBe('v0-1.5-md');
      expect(result.metadata?.usage?.totalTokens).toBe(150);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'v0-1.5-md',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('You are a skilled UI/UX developer'),
          },
          {
            role: 'user',
            content: 'Create a login form',
          },
        ],
      });
    });

    it('should generate UI with context', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated UI with context',
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse as any);

      // Act
      const result = await v0Service.generateUI(
        'Add a submit button',
        'v0-1.5-lg',
        false,
        'existing form context'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'v0-1.5-lg',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('You are a skilled UI/UX developer'),
          },
          {
            role: 'user',
            content: 'Context: existing form context\n\nRequest: Add a submit button',
          },
        ],
      });
    });

    it('should handle streaming response', async () => {
      // Arrange
      const mockStreamResponse = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Generated ' } }] };
          yield { choices: [{ delta: { content: 'UI component' } }] };
        },
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockStreamResponse as any);

      // Act
      const result = await v0Service.generateUI('Create a form', 'v0-1.5-md', true);

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe('Generated UI component');
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'v0-1.5-md',
        messages: expect.any(Array),
        stream: true,
      });
    });

    it('should handle API errors', async () => {
      // Arrange
      const apiError = new OpenAI.APIError(
        'Bad Request',
        { status: 400, headers: {}, error: { message: 'Bad Request' } },
        'Bad Request',
        { status: 400, headers: {}, url: 'test-url' }
      );

      mockOpenAIInstance.chat.completions.create.mockRejectedValue(apiError);

      // Act
      const result = await v0Service.generateUI('Create a form');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('v0 API Error (400)');
    });

    it('should handle empty response', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse as any);

      // Act
      const result = await v0Service.generateUI('Create a form');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('No content generated from v0 API');
    });
  });

  describe('generateFromImage', () => {
    it('should generate UI from image successfully', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated UI from image',
            },
          },
        ],
        usage: {
          prompt_tokens: 75,
          completion_tokens: 125,
          total_tokens: 200,
        },
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse as any);

      // Act
      const result = await v0Service.generateFromImage(
        'https://example.com/image.png',
        'v0-1.5-md',
        'Make it responsive'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe('Generated UI from image');
      expect(result.metadata?.usage?.totalTokens).toBe(200);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'v0-1.5-md',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('Analyze the provided image'),
          },
          {
            role: 'user',
            content: 'Based on this image: https://example.com/image.png\nAdditional requirements: Make it responsive',
          },
        ],
      });
    });

    it('should generate UI from image without additional prompt', async () => {
      // Arrange
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Generated UI from image only',
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse as any);

      // Act
      const result = await v0Service.generateFromImage('https://example.com/image.png');

      // Assert
      expect(result.success).toBe(true);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'v0-1.5-md',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('Analyze the provided image'),
          },
          {
            role: 'user',
            content: 'Generate UI components based on this image: https://example.com/image.png',
          },
        ],
      });
    });
  });

  describe('chatComplete', () => {
    it('should complete chat successfully', async () => {
      // Arrange
      const messages = [
        { role: 'user' as const, content: 'Create a button' },
        { role: 'assistant' as const, content: 'Here is a button component' },
        { role: 'user' as const, content: 'Make it blue' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Here is a blue button component',
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockResponse as any);

      // Act
      const result = await v0Service.chatComplete(messages);

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe('Here is a blue button component');
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'v0-1.5-md',
        messages,
      });
    });

    it('should handle streaming chat completion', async () => {
      // Arrange
      const messages = [{ role: 'user' as const, content: 'Create a form' }];
      
      const mockStreamResponse = {
        [Symbol.asyncIterator]: async function* () {
          yield { choices: [{ delta: { content: 'Creating ' } }] };
          yield { choices: [{ delta: { content: 'form component' } }] };
        },
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(mockStreamResponse as any);

      // Act
      const result = await v0Service.chatComplete(messages, 'v0-1.5-lg', true);

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toBe('Creating form component');
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'v0-1.5-lg',
        messages,
        stream: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle OpenAI API errors correctly', async () => {
      // Arrange
      const apiError = new OpenAI.APIError(
        'Rate limit exceeded',
        { status: 429, headers: {}, error: { message: 'Rate limit exceeded' } },
        'Rate limit exceeded',
        { status: 429, headers: {}, url: 'test-url' }
      );

      mockOpenAIInstance.chat.completions.create.mockRejectedValue(apiError);

      // Act
      const result = await v0Service.generateUI('test prompt');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('v0 API Error (429): Rate limit exceeded');
    });

    it('should handle generic errors', async () => {
      // Arrange
      const genericError = new Error('Network error');
      mockOpenAIInstance.chat.completions.create.mockRejectedValue(genericError);

      // Act
      const result = await v0Service.generateUI('test prompt');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockOpenAIInstance.chat.completions.create.mockRejectedValue('Unknown error');

      // Act
      const result = await v0Service.generateUI('test prompt');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });
  });
});