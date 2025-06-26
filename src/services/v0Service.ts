/**
 * v0 API Service using OpenAI-compatible endpoint
 */

import OpenAI from 'openai';
import { config } from '../config/index.js';
import { ToolResult, V0Model } from '../types/index.js';
import { logger, logApiCall } from '../utils/logger.js';
import { ErrorHandler, V0McpError } from '../utils/errors.js';

export class V0Service {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.v0.apiKey,
      baseURL: config.v0.baseUrl,
      timeout: config.v0.timeout,
    });
  }

  /**
   * Generate UI component from text prompt
   */
  async generateUI(
    prompt: string,
    model: V0Model = config.v0.defaultModel,
    stream: boolean = false,
    context?: string
  ): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting UI generation', {
        model,
        stream,
        hasContext: !!context,
        promptLength: prompt.length,
      });

      const systemPrompt = `You are a skilled UI/UX developer. Generate clean, modern, and functional UI components based on the user's requirements. Use React with TypeScript and Tailwind CSS unless specified otherwise.`;
      
      const userPrompt = context 
        ? `Context: ${context}\n\nRequest: ${prompt}`
        : prompt;

      let result: ToolResult;
      if (stream) {
        result = await this.handleStreamResponse(model, systemPrompt, userPrompt);
      } else {
        result = await this.handleSyncResponse(model, systemPrompt, userPrompt);
      }

      // Log successful API call
      const duration = Date.now() - startTime;
      if (result.success && result.metadata?.usage) {
        logApiCall(
          'generateUI',
          model,
          result.metadata.usage.promptTokens,
          result.metadata.usage.completionTokens,
          duration
        );
      }

      return result;
    } catch (error) {
      const mcpError = ErrorHandler.handleError(error, 'generateUI');
      return this.handleError(mcpError);
    }
  }

  /**
   * Generate UI from image
   */
  async generateFromImage(
    imageUrl: string,
    model: V0Model = config.v0.defaultModel,
    prompt?: string
  ): Promise<ToolResult> {
    try {
      const systemPrompt = `You are a skilled UI/UX developer. Analyze the provided image and generate corresponding UI components. Use React with TypeScript and Tailwind CSS.`;
      
      const userPrompt = prompt 
        ? `Based on this image: ${imageUrl}\nAdditional requirements: ${prompt}`
        : `Generate UI components based on this image: ${imageUrl}`;

      const response = await this.client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated from v0 API');
      }

      return {
        success: true,
        content: content.trim(),
        metadata: {
          model,
          usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          } : undefined,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Chat completion with conversation context
   */
  async chatComplete(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    model: V0Model = config.v0.defaultModel,
    stream: boolean = false
  ): Promise<ToolResult> {
    try {
      if (stream) {
        const response = await this.client.chat.completions.create({
          model,
          messages,
          stream: true,
        });

        let content = '';
        for await (const chunk of response) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            content += delta;
          }
        }

        return {
          success: true,
          content: content.trim(),
          metadata: { model },
        };
      } else {
        const response = await this.client.chat.completions.create({
          model,
          messages,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content generated from v0 API');
        }

        return {
          success: true,
          content: content.trim(),
          metadata: {
            model,
            usage: response.usage ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            } : undefined,
          },
        };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle synchronous response
   */
  private async handleSyncResponse(
    model: V0Model,
    systemPrompt: string,
    userPrompt: string
  ): Promise<ToolResult> {
    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from v0 API');
    }

    return {
      success: true,
      content: content.trim(),
      metadata: {
        model,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      },
    };
  }

  /**
   * Handle streaming response
   */
  private async handleStreamResponse(
    model: V0Model,
    systemPrompt: string,
    userPrompt: string
  ): Promise<ToolResult> {
    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
    });

    let content = '';
    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        content += delta;
      }
    }

    return {
      success: true,
      content: content.trim(),
      metadata: { model },
    };
  }

  /**
   * Handle API errors with enhanced error information
   */
  private handleError(error: V0McpError | unknown): ToolResult {
    let mcpError: V0McpError;
    
    if (error instanceof V0McpError) {
      mcpError = error;
    } else {
      mcpError = ErrorHandler.handleError(error, 'v0Service');
    }

    const userMessage = ErrorHandler.createUserMessage(mcpError);

    return {
      success: false,
      error: userMessage,
      metadata: {
        errorType: mcpError.type,
        statusCode: mcpError.statusCode,
        retryable: mcpError.retryable,
        context: mcpError.context,
      },
    };
  }
}