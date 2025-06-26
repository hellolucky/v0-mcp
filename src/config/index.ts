/**
 * Configuration management for v0-mcp
 */

import { config as dotenvConfig } from 'dotenv';
import { AppConfig, V0Model } from '../types/index.js';

// Load environment variables
dotenvConfig();

/**
 * Get required environment variable or throw error
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get optional environment variable with default value
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Application configuration
 */
export const config: AppConfig = {
  v0: {
    apiKey: getRequiredEnv('V0_API_KEY'),
    baseUrl: getOptionalEnv('V0_BASE_URL', 'https://api.v0.dev/v1'),
    defaultModel: (getOptionalEnv('V0_DEFAULT_MODEL', 'v0-1.5-md') as V0Model),
    timeout: parseInt(getOptionalEnv('V0_TIMEOUT', '60000'), 10),
  },
  mcp: {
    serverName: getOptionalEnv('MCP_SERVER_NAME', 'v0-mcp'),
    version: getOptionalEnv('MCP_SERVER_VERSION', '1.0.0'),
  },
  logging: {
    level: (getOptionalEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'),
  },
};

/**
 * Validate configuration
 */
export function validateConfig(): void {
  const requiredVars = ['V0_API_KEY'];
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Configuration validated successfully');
}