/**
 * Type definitions for v0-mcp
 */

import { z } from 'zod';

// v0 API Models
export const V0Model = z.enum(['v0-1.5-md', 'v0-1.5-lg', 'v0-1.0-md']);
export type V0Model = z.infer<typeof V0Model>;

// Tool Input Schemas
export const GenerateUISchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: V0Model.default('v0-1.5-md'),
  stream: z.boolean().default(false),
  context: z.string().optional(),
});

export const GenerateFromImageSchema = z.object({
  imageUrl: z.string().url('Valid image URL is required'),
  prompt: z.string().optional(),
  model: V0Model.default('v0-1.5-md'),
});

export const ChatCompleteSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: V0Model.default('v0-1.5-md'),
  stream: z.boolean().default(false),
});

// Tool Input Types
export type GenerateUIInput = z.infer<typeof GenerateUISchema>;
export type GenerateFromImageInput = z.infer<typeof GenerateFromImageSchema>;
export type ChatCompleteInput = z.infer<typeof ChatCompleteSchema>;

// Tool Output Types
export interface ToolResult {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    model?: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    } | undefined;
    errorType?: string | undefined;
    statusCode?: number | undefined;
    retryable?: boolean | undefined;
    context?: string | undefined;
  };
}

// Configuration Types
export interface V0Config {
  apiKey: string;
  baseUrl: string;
  defaultModel: V0Model;
  timeout: number;
}

export interface AppConfig {
  v0: V0Config;
  mcp: {
    serverName: string;
    version: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}