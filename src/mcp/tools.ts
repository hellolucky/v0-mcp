/**
 * MCP Tool definitions for v0 API integration
 */

import {
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { V0Service } from '../services/v0Service.js';
import {
  GenerateUISchema,
  GenerateFromImageSchema,
  ChatCompleteSchema,
  GenerateUIInput,
  GenerateFromImageInput,
  ChatCompleteInput,
} from '../types/index.js';
import { logger, logToolCall } from '../utils/logger.js';
import { ErrorHandler } from '../utils/errors.js';

export class V0Tools {
  private v0Service: V0Service;

  constructor() {
    this.v0Service = new V0Service();
  }

  /**
   * List all available tools
   */
  listTools(): Tool[] {
    return [
      {
        name: 'v0_generate_ui',
        description: 'Generate UI components using v0 AI. Creates React components with TypeScript and Tailwind CSS based on natural language descriptions.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Detailed description of the UI component to generate (e.g., "A modern login form with email, password fields and a blue submit button")',
            },
            model: {
              type: 'string',
              enum: ['v0-1.5-md', 'v0-1.5-lg', 'v0-1.0-md'],
              default: 'v0-1.5-md',
              description: 'v0 model to use for generation',
            },
            stream: {
              type: 'boolean',
              default: false,
              description: 'Whether to stream the response (shows generation progress)',
            },
            context: {
              type: 'string',
              description: 'Optional context or existing code to build upon',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'v0_generate_from_image',
        description: 'Generate UI components from an image reference. Analyzes the provided image and creates corresponding React components.',
        inputSchema: {
          type: 'object',
          properties: {
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL of the image to analyze and convert to UI components',
            },
            prompt: {
              type: 'string',
              description: 'Optional additional instructions for the generation',
            },
            model: {
              type: 'string',
              enum: ['v0-1.5-md', 'v0-1.5-lg', 'v0-1.0-md'],
              default: 'v0-1.5-md',
              description: 'v0 model to use for generation',
            },
          },
          required: ['imageUrl'],
        },
      },
      {
        name: 'v0_chat_complete',
        description: 'Have a conversation with v0 for iterative UI development. Allows back-and-forth refinement of UI components.',
        inputSchema: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['user', 'assistant', 'system'],
                  },
                  content: {
                    type: 'string',
                  },
                },
                required: ['role', 'content'],
              },
              description: 'Conversation history for context-aware generation',
            },
            model: {
              type: 'string',
              enum: ['v0-1.5-md', 'v0-1.5-lg', 'v0-1.0-md'],
              default: 'v0-1.5-md',
              description: 'v0 model to use for generation',
            },
            stream: {
              type: 'boolean',
              default: false,
              description: 'Whether to stream the response',
            },
          },
          required: ['messages'],
        },
      },
      {
        name: 'v0_setup_check',
        description: 'Check v0 API configuration and connectivity. Validates API key and endpoint accessibility.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ];
  }

  /**
   * Execute a tool call with enhanced logging and error handling
   */
  async callTool(name: string, arguments_: unknown): Promise<any> {
    const startTime = Date.now();
    
    try {
      logger.info('Tool call started', {
        tool: name,
        hasArguments: !!arguments_,
      });

      let result: any;
      
      switch (name) {
        case 'v0_generate_ui':
          result = await this.handleGenerateUI(arguments_);
          break;
        
        case 'v0_generate_from_image':
          result = await this.handleGenerateFromImage(arguments_);
          break;
        
        case 'v0_chat_complete':
          result = await this.handleChatComplete(arguments_);
          break;
        
        case 'v0_setup_check':
          result = await this.handleSetupCheck();
          break;
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      // Log successful tool call
      const duration = Date.now() - startTime;
      logToolCall(name, true, duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const mcpError = ErrorHandler.handleError(error, `tool:${name}`);
      
      logToolCall(name, false, duration, {
        errorType: mcpError.type,
        errorMessage: mcpError.message,
      });

      const userMessage = ErrorHandler.createUserMessage(mcpError);

      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Error: ${userMessage}`,
        }],
      };
    }
  }

  /**
   * Handle v0_generate_ui tool call
   */
  private async handleGenerateUI(arguments_: unknown) {
    const input = GenerateUISchema.parse(arguments_) as GenerateUIInput;
    const result = await this.v0Service.generateUI(
      input.prompt,
      input.model,
      input.stream,
      input.context
    );

    if (result.success) {
      return {
        content: [{
          type: 'text',
          text: `# Generated UI Component\n\n**Model**: ${result.metadata?.model}\n**Prompt**: ${input.prompt}\n\n${result.content}`,
        }],
      };
    } else {
      throw new Error(result.error || 'Failed to generate UI component');
    }
  }

  /**
   * Handle v0_generate_from_image tool call
   */
  private async handleGenerateFromImage(arguments_: unknown) {
    const input = GenerateFromImageSchema.parse(arguments_) as GenerateFromImageInput;
    const result = await this.v0Service.generateFromImage(
      input.imageUrl,
      input.model,
      input.prompt
    );

    if (result.success) {
      return {
        content: [{
          type: 'text',
          text: `# Generated UI from Image\n\n**Image**: ${input.imageUrl}\n**Model**: ${result.metadata?.model}\n${input.prompt ? `**Additional Prompt**: ${input.prompt}\n` : ''}\n${result.content}`,
        }],
      };
    } else {
      throw new Error(result.error || 'Failed to generate UI from image');
    }
  }

  /**
   * Handle v0_chat_complete tool call
   */
  private async handleChatComplete(arguments_: unknown) {
    const input = ChatCompleteSchema.parse(arguments_) as ChatCompleteInput;
    const result = await this.v0Service.chatComplete(
      input.messages,
      input.model,
      input.stream
    );

    if (result.success) {
      return {
        content: [{
          type: 'text',
          text: result.content,
        }],
      };
    } else {
      throw new Error(result.error || 'Failed to complete chat');
    }
  }

  /**
   * Handle v0_setup_check tool call
   */
  private async handleSetupCheck() {
    try {
      // Test v0 API connectivity with a simple prompt
      const testResult = await this.v0Service.generateUI(
        'Generate a simple hello world div',
        'v0-1.5-md',
        false
      );

      if (testResult.success) {
        return {
          content: [{
            type: 'text',
            text: `✅ v0 API Setup Check Passed\n\n**Status**: Connected\n**Model**: ${testResult.metadata?.model}\n**Usage**: ${testResult.metadata?.usage ? `${testResult.metadata.usage.totalTokens} tokens` : 'N/A'}\n\nv0 MCP server is ready for use!`,
          }],
        };
      } else {
        throw new Error(testResult.error || 'API test failed');
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ v0 API Setup Check Failed\n\n**Error**: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check:\n1. V0_API_KEY environment variable is set\n2. API key is valid\n3. Network connectivity to v0 API`,
        }],
      };
    }
  }
}