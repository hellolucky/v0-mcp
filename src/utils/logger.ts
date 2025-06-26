/**
 * Structured logging utility for v0-mcp
 */

import winston from 'winston';
import { config } from '../config/index.js';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const baseLog: any = {
        timestamp,
        level: level.toUpperCase(),
        message,
        service: 'v0-mcp',
        ...meta,
      };

      if (stack) {
        baseLog.stack = stack;
      }

      return JSON.stringify(baseLog);
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          let logMessage = `${timestamp} [${level}]: ${message}`;
          
          if (Object.keys(meta).length > 0) {
            logMessage += ` ${JSON.stringify(meta)}`;
          }
          
          if (stack) {
            logMessage += `\n${stack}`;
          }
          
          return logMessage;
        })
      ),
    }),
  ],
});

// Helper functions for structured logging
export const logApiCall = (
  method: string,
  model: string,
  promptTokens?: number,
  completionTokens?: number,
  duration?: number
) => {
  logger.info('API call completed', {
    method,
    model,
    tokens: {
      prompt: promptTokens,
      completion: completionTokens,
      total: (promptTokens || 0) + (completionTokens || 0),
    },
    duration,
  });
};

export const logError = (
  error: Error | unknown,
  context: string,
  additionalInfo?: Record<string, any>
) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error('Error occurred', {
    context,
    error: errorMessage,
    stack: errorStack,
    ...additionalInfo,
  });
};

export const logToolCall = (
  toolName: string,
  success: boolean,
  duration?: number,
  additionalInfo?: Record<string, any>
) => {
  logger.info('Tool call completed', {
    tool: toolName,
    success,
    duration,
    ...additionalInfo,
  });
};

export const logServerEvent = (
  event: string,
  details?: Record<string, any>
) => {
  logger.info('Server event', {
    event,
    ...details,
  });
};