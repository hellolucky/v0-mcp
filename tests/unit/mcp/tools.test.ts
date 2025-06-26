import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { V0Tools } from '../../../src/mcp/tools.js';
import { V0Service } from '../../../src/services/v0Service.js';

// Mock V0Service
jest.mock('../../../src/services/v0Service.js');
const MockedV0Service = V0Service as jest.MockedClass<typeof V0Service>;

describe('V0Tools', () => {
  let v0Tools: V0Tools;
  let mockV0Service: jest.Mocked<V0Service>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock V0Service instance
    mockV0Service = {
      generateUI: jest.fn(),
      generateFromImage: jest.fn(),
      chatComplete: jest.fn(),
    } as any;

    MockedV0Service.mockImplementation(() => mockV0Service);
    
    v0Tools = new V0Tools();
  });

  describe('listTools', () => {
    it('should return all available tools', () => {
      // Act
      const tools = v0Tools.listTools();

      // Assert
      expect(tools).toHaveLength(4);
      expect(tools.map(tool => tool.name)).toEqual([
        'v0_generate_ui',
        'v0_generate_from_image',
        'v0_chat_complete',
        'v0_setup_check',
      ]);

      // Check tool schemas
      const generateUITool = tools.find(tool => tool.name === 'v0_generate_ui');
      expect(generateUITool?.inputSchema.properties?.prompt).toBeDefined();
      expect(generateUITool?.inputSchema.required).toContain('prompt');
      
      const generateFromImageTool = tools.find(tool => tool.name === 'v0_generate_from_image');
      expect(generateFromImageTool?.inputSchema.properties?.imageUrl).toBeDefined();
      expect(generateFromImageTool?.inputSchema.required).toContain('imageUrl');
      
      const chatCompleteTool = tools.find(tool => tool.name === 'v0_chat_complete');
      expect(chatCompleteTool?.inputSchema.properties?.messages).toBeDefined();
      expect(chatCompleteTool?.inputSchema.required).toContain('messages');
    });
  });

  describe('callTool', () => {
    describe('v0_generate_ui', () => {
      it('should handle successful UI generation', async () => {
        // Arrange
        const mockResult = {
          success: true,
          content: 'Generated UI component',
          metadata: { model: 'v0-1.5-md' },
        };
        mockV0Service.generateUI.mockResolvedValue(mockResult);

        const input = {
          prompt: 'Create a login form',
          model: 'v0-1.5-md',
          stream: false,
        };

        // Act
        const result = await v0Tools.callTool('v0_generate_ui', input);

        // Assert
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        expect(result.content[0].text).toContain('Generated UI Component');
        expect(result.content[0].text).toContain('Create a login form');
        expect(result.content[0].text).toContain('Generated UI component');
        expect(mockV0Service.generateUI).toHaveBeenCalledWith(
          'Create a login form',
          'v0-1.5-md',
          false,
          undefined
        );
      });

      it('should handle UI generation with context', async () => {
        // Arrange
        const mockResult = {
          success: true,
          content: 'Enhanced UI component',
          metadata: { model: 'v0-1.5-lg' },
        };
        mockV0Service.generateUI.mockResolvedValue(mockResult);

        const input = {
          prompt: 'Add validation',
          model: 'v0-1.5-lg',
          stream: true,
          context: 'existing form code',
        };

        // Act
        await v0Tools.callTool('v0_generate_ui', input);

        // Assert
        expect(mockV0Service.generateUI).toHaveBeenCalledWith(
          'Add validation',
          'v0-1.5-lg',
          true,
          'existing form code'
        );
      });

      it('should handle UI generation failure', async () => {
        // Arrange
        const mockResult = {
          success: false,
          error: 'API rate limit exceeded',
        };
        mockV0Service.generateUI.mockResolvedValue(mockResult);

        // Act & Assert
        await expect(v0Tools.callTool('v0_generate_ui', { prompt: 'test' }))
          .rejects.toThrow('API rate limit exceeded');
      });

      it('should handle invalid input', async () => {
        // Act
        const result = await v0Tools.callTool('v0_generate_ui', {});

        // Assert
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Error:');
      });
    });

    describe('v0_generate_from_image', () => {
      it('should handle successful image to UI generation', async () => {
        // Arrange
        const mockResult = {
          success: true,
          content: 'Generated UI from image',
          metadata: { model: 'v0-1.5-md' },
        };
        mockV0Service.generateFromImage.mockResolvedValue(mockResult);

        const input = {
          imageUrl: 'https://example.com/design.png',
          prompt: 'Make it responsive',
          model: 'v0-1.5-md',
        };

        // Act
        const result = await v0Tools.callTool('v0_generate_from_image', input);

        // Assert
        expect(result.content).toHaveLength(1);
        expect(result.content[0].text).toContain('Generated UI from Image');
        expect(result.content[0].text).toContain('https://example.com/design.png');
        expect(result.content[0].text).toContain('Make it responsive');
        expect(mockV0Service.generateFromImage).toHaveBeenCalledWith(
          'https://example.com/design.png',
          'v0-1.5-md',
          'Make it responsive'
        );
      });

      it('should handle image generation without additional prompt', async () => {
        // Arrange
        const mockResult = {
          success: true,
          content: 'UI from image only',
          metadata: { model: 'v0-1.5-md' },
        };
        mockV0Service.generateFromImage.mockResolvedValue(mockResult);

        const input = {
          imageUrl: 'https://example.com/design.png',
        };

        // Act
        await v0Tools.callTool('v0_generate_from_image', input);

        // Assert
        expect(mockV0Service.generateFromImage).toHaveBeenCalledWith(
          'https://example.com/design.png',
          'v0-1.5-md',
          undefined
        );
      });
    });

    describe('v0_chat_complete', () => {
      it('should handle successful chat completion', async () => {
        // Arrange
        const mockResult = {
          success: true,
          content: 'Chat response',
          metadata: { model: 'v0-1.5-md' },
        };
        mockV0Service.chatComplete.mockResolvedValue(mockResult);

        const input = {
          messages: [
            { role: 'user' as const, content: 'Create a button' },
            { role: 'assistant' as const, content: 'Here is a button' },
            { role: 'user' as const, content: 'Make it blue' },
          ],
          model: 'v0-1.5-lg',
          stream: true,
        };

        // Act
        const result = await v0Tools.callTool('v0_chat_complete', input);

        // Assert
        expect(result.content).toHaveLength(1);
        expect(result.content[0].text).toBe('Chat response');
        expect(mockV0Service.chatComplete).toHaveBeenCalledWith(
          input.messages,
          'v0-1.5-lg',
          true
        );
      });
    });

    describe('v0_setup_check', () => {
      it('should handle successful setup check', async () => {
        // Arrange
        const mockResult = {
          success: true,
          content: 'Test content',
          metadata: { 
            model: 'v0-1.5-md',
            usage: { totalTokens: 25 }
          },
        };
        mockV0Service.generateUI.mockResolvedValue(mockResult);

        // Act
        const result = await v0Tools.callTool('v0_setup_check', {});

        // Assert
        expect(result.content).toHaveLength(1);
        expect(result.content[0].text).toContain('✅ v0 API Setup Check Passed');
        expect(result.content[0].text).toContain('Connected');
        expect(result.content[0].text).toContain('v0-1.5-md');
        expect(result.content[0].text).toContain('25 tokens');
        expect(mockV0Service.generateUI).toHaveBeenCalledWith(
          'Generate a simple hello world div',
          'v0-1.5-md',
          false
        );
      });

      it('should handle failed setup check', async () => {
        // Arrange
        const mockResult = {
          success: false,
          error: 'Invalid API key',
        };
        mockV0Service.generateUI.mockResolvedValue(mockResult);

        // Act
        const result = await v0Tools.callTool('v0_setup_check', {});

        // Assert
        expect(result.content).toHaveLength(1);
        expect(result.content[0].text).toContain('❌ v0 API Setup Check Failed');
        expect(result.content[0].text).toContain('Invalid API key');
        expect(result.content[0].text).toContain('V0_API_KEY environment variable');
      });

      it('should handle setup check with thrown error', async () => {
        // Arrange
        mockV0Service.generateUI.mockRejectedValue(new Error('Network error'));

        // Act
        const result = await v0Tools.callTool('v0_setup_check', {});

        // Assert
        expect(result.content).toHaveLength(1);
        expect(result.content[0].text).toContain('❌ v0 API Setup Check Failed');
        expect(result.content[0].text).toContain('Network error');
      });
    });

    describe('error handling', () => {
      it('should handle unknown tool name', async () => {
        // Act
        const result = await v0Tools.callTool('unknown_tool', {});

        // Assert
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Error: Unknown tool: unknown_tool');
      });

      it('should handle service errors gracefully', async () => {
        // Arrange
        mockV0Service.generateUI.mockRejectedValue(new Error('Service error'));

        // Act
        const result = await v0Tools.callTool('v0_generate_ui', { prompt: 'test' });

        // Assert
        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Error: Service error');
      });
    });
  });
});