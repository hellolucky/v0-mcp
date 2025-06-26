/**
 * Enhanced error handling utilities for v0-mcp
 */

import OpenAI from 'openai';
import { logError } from './logger.js';

export enum ErrorType {
  // eslint-disable-next-line no-unused-vars
  API_ERROR = 'API_ERROR',
  // eslint-disable-next-line no-unused-vars
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  // eslint-disable-next-line no-unused-vars
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  // eslint-disable-next-line no-unused-vars
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  // eslint-disable-next-line no-unused-vars
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  // eslint-disable-next-line no-unused-vars
  NETWORK_ERROR = 'NETWORK_ERROR',
  // eslint-disable-next-line no-unused-vars
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  statusCode?: number;
  retryable: boolean;
  context?: string;
  originalError?: Error;
}

export class V0McpError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly context?: string;
  public readonly originalError?: Error;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'V0McpError';
    this.type = details.type;
    this.statusCode = details.statusCode;
    this.retryable = details.retryable;
    this.context = details.context;
    this.originalError = details.originalError;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      retryable: this.retryable,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Enhanced error handler that categorizes and logs errors appropriately
 */
export class ErrorHandler {
  static handleError(error: unknown, context: string): V0McpError {
    let mcpError: V0McpError;

    if (error instanceof V0McpError) {
      mcpError = error;
    } else if (error instanceof OpenAI.APIError) {
      mcpError = this.handleOpenAIError(error, context);
    } else if (error instanceof Error) {
      mcpError = this.handleGenericError(error, context);
    } else {
      mcpError = new V0McpError({
        type: ErrorType.UNKNOWN_ERROR,
        message: String(error) || 'An unknown error occurred',
        retryable: false,
        context,
      });
    }

    // Log the error with context
    logError(mcpError.originalError || mcpError, context, {
      errorType: mcpError.type,
      statusCode: mcpError.statusCode,
      retryable: mcpError.retryable,
    });

    return mcpError;
  }

  private static handleOpenAIError(error: any, context: string): V0McpError {
    const statusCode = error.status;
    let type: ErrorType;
    let retryable = false;

    // Categorize based on status code
    switch (statusCode) {
      case 401:
        type = ErrorType.AUTHENTICATION_ERROR;
        break;
      case 429:
        type = ErrorType.RATE_LIMIT_ERROR;
        retryable = true;
        break;
      case 408:
      case 504:
        type = ErrorType.TIMEOUT_ERROR;
        retryable = true;
        break;
      case 500:
      case 502:
      case 503:
        type = ErrorType.API_ERROR;
        retryable = true;
        break;
      default:
        type = ErrorType.API_ERROR;
        retryable = statusCode >= 500;
    }

    return new V0McpError({
      type,
      message: `v0 API Error (${statusCode}): ${error.message}`,
      statusCode,
      retryable,
      context,
      originalError: error,
    });
  }

  private static handleGenericError(error: Error, context: string): V0McpError {
    let type: ErrorType;
    let retryable = false;

    // Check for network-related errors
    if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ECONNRESET')
    ) {
      type = ErrorType.NETWORK_ERROR;
      retryable = true;
    } else if (
      error.message.includes('timeout') ||
      error.message.includes('ETIMEDOUT')
    ) {
      type = ErrorType.TIMEOUT_ERROR;
      retryable = true;
    } else if (error.name === 'ValidationError' || error.message.includes('validation')) {
      type = ErrorType.VALIDATION_ERROR;
      retryable = false;
    } else {
      type = ErrorType.UNKNOWN_ERROR;
      retryable = false;
    }

    return new V0McpError({
      type,
      message: error.message,
      retryable,
      context,
      originalError: error,
    });
  }

  /**
   * Create a user-friendly error message
   */
  static createUserMessage(error: V0McpError): string {
    switch (error.type) {
      case ErrorType.AUTHENTICATION_ERROR:
        return 'Authentication failed. Please check your v0 API key.';
      
      case ErrorType.RATE_LIMIT_ERROR:
        return 'Rate limit exceeded. Please try again later.';
      
      case ErrorType.TIMEOUT_ERROR:
        return 'Request timed out. Please try again.';
      
      case ErrorType.NETWORK_ERROR:
        return 'Network error occurred. Please check your connection and try again.';
      
      case ErrorType.VALIDATION_ERROR:
        return `Invalid input: ${error.message}`;
      
      case ErrorType.API_ERROR:
        if (error.retryable) {
          return 'v0 API is temporarily unavailable. Please try again later.';
        }
        return `API error: ${error.message}`;
      
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Determine if an error should be retried
   */
  static shouldRetry(error: V0McpError, attemptCount: number, maxRetries = 3): boolean {
    if (attemptCount >= maxRetries) {
      return false;
    }

    return error.retryable;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  static getRetryDelay(attemptCount: number, baseDelay = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attemptCount), 30000); // Max 30 seconds
  }
}