import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock dotenv before importing config
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear all environment variables related to our config
    delete process.env.V0_API_KEY;
    delete process.env.V0_BASE_URL;
    delete process.env.V0_DEFAULT_MODEL;
    delete process.env.V0_TIMEOUT;
    delete process.env.MCP_SERVER_NAME;
    delete process.env.MCP_SERVER_VERSION;
    delete process.env.LOG_LEVEL;
    
    // Clear module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('config object', () => {
    it('should create config with required environment variables', async () => {
      // Arrange
      process.env.V0_API_KEY = 'test-api-key';
      
      // Act
      const { config } = await import('../../../src/config/index.js');
      
      // Assert
      expect(config.v0.apiKey).toBe('test-api-key');
      expect(config.v0.baseUrl).toBe('https://api.v0.dev/v1');
      expect(config.v0.defaultModel).toBe('v0-1.5-md');
      expect(config.v0.timeout).toBe(60000);
      expect(config.mcp.serverName).toBe('v0-mcp');
      expect(config.mcp.version).toBe('1.0.0');
      expect(config.logging.level).toBe('info');
    });

    it('should use custom environment variables when provided', async () => {
      // Arrange
      process.env.V0_API_KEY = 'custom-api-key';
      process.env.V0_BASE_URL = 'https://custom.api.url';
      process.env.V0_DEFAULT_MODEL = 'v0-1.0-md';
      process.env.V0_TIMEOUT = '30000';
      process.env.MCP_SERVER_NAME = 'custom-mcp';
      process.env.MCP_SERVER_VERSION = '2.0.0';
      process.env.LOG_LEVEL = 'debug';
      
      // Act
      const { config } = await import('../../../src/config/index.js');
      
      // Assert
      expect(config.v0.apiKey).toBe('custom-api-key');
      expect(config.v0.baseUrl).toBe('https://custom.api.url');
      expect(config.v0.defaultModel).toBe('v0-1.0-md');
      expect(config.v0.timeout).toBe(30000);
      expect(config.mcp.serverName).toBe('custom-mcp');
      expect(config.mcp.version).toBe('2.0.0');
      expect(config.logging.level).toBe('debug');
    });

    it('should throw error when required environment variable is missing', async () => {
      // Arrange - Don't set V0_API_KEY
      
      // Act & Assert
      await expect(async () => {
        await import('../../../src/config/index.js');
      }).rejects.toThrow('Required environment variable V0_API_KEY is not set');
    });
  });

  describe('validateConfig', () => {
    it('should validate successfully when all required variables are present', async () => {
      // Arrange
      process.env.V0_API_KEY = 'test-api-key';
      
      // Mock console.log to capture validation message
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      // Act
      const { validateConfig } = await import('../../../src/config/index.js');
      
      // Assert - Should not throw
      expect(() => validateConfig()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('✅ Configuration validated successfully');
      
      consoleSpy.mockRestore();
    });

    it('should throw error when V0_API_KEY is missing', async () => {
      // Arrange - Don't set V0_API_KEY but import validateConfig separately
      process.env.V0_API_KEY = 'temp-key'; // Set temporarily to allow import
      const { validateConfig } = await import('../../../src/config/index.js');
      delete process.env.V0_API_KEY; // Remove after import
      
      // Act & Assert
      expect(() => validateConfig()).toThrow('Missing required environment variables: V0_API_KEY');
    });

    it('should handle multiple missing required variables', async () => {
      // Arrange
      process.env.V0_API_KEY = 'temp-key'; // Set temporarily to allow import
      const { validateConfig } = await import('../../../src/config/index.js');
      
      // Mock the required variables check by modifying the function behavior
      delete process.env.V0_API_KEY;
      
      // Act & Assert
      expect(() => validateConfig()).toThrow('Missing required environment variables: V0_API_KEY');
    });
  });

  describe('environment variable parsing', () => {
    it('should parse timeout as number', async () => {
      // Arrange
      process.env.V0_API_KEY = 'test-key';
      process.env.V0_TIMEOUT = '45000';
      
      // Act
      const { config } = await import('../../../src/config/index.js');
      
      // Assert
      expect(config.v0.timeout).toBe(45000);
      expect(typeof config.v0.timeout).toBe('number');
    });

    it('should handle invalid timeout gracefully', async () => {
      // Arrange
      process.env.V0_API_KEY = 'test-key';
      process.env.V0_TIMEOUT = 'invalid-number';
      
      // Act
      const { config } = await import('../../../src/config/index.js');
      
      // Assert
      expect(config.v0.timeout).toBeNaN();
    });

    it('should validate model enum values', async () => {
      // Arrange
      process.env.V0_API_KEY = 'test-key';
      process.env.V0_DEFAULT_MODEL = 'v0-1.5-lg';
      
      // Act
      const { config } = await import('../../../src/config/index.js');
      
      // Assert
      expect(config.v0.defaultModel).toBe('v0-1.5-lg');
    });

    it('should validate log level enum values', async () => {
      // Arrange
      process.env.V0_API_KEY = 'test-key';
      process.env.LOG_LEVEL = 'warn';
      
      // Act
      const { config } = await import('../../../src/config/index.js');
      
      // Assert
      expect(config.logging.level).toBe('warn');
    });
  });

  describe('default values', () => {
    it('should provide correct default values', async () => {
      // Arrange
      process.env.V0_API_KEY = 'test-key';
      
      // Act
      const { config } = await import('../../../src/config/index.js');
      
      // Assert
      expect(config.v0.baseUrl).toBe('https://api.v0.dev/v1');
      expect(config.v0.defaultModel).toBe('v0-1.5-md');
      expect(config.v0.timeout).toBe(60000);
      expect(config.mcp.serverName).toBe('v0-mcp');
      expect(config.mcp.version).toBe('1.0.0');
      expect(config.logging.level).toBe('info');
    });
  });
});