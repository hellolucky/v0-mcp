import { describe, it, expect } from '@jest/globals';
import {
  V0ModelSchema,
  GenerateUISchema,
  GenerateFromImageSchema,
  ChatCompleteSchema,
} from '../../../src/types/index.js';

describe('Type Definitions', () => {
  describe('V0ModelSchema', () => {
    it('should accept valid model names', () => {
      // Act & Assert
      expect(() => V0ModelSchema.parse('v0-1.5-md')).not.toThrow();
      expect(() => V0ModelSchema.parse('v0-1.5-lg')).not.toThrow();
      expect(() => V0ModelSchema.parse('v0-1.0-md')).not.toThrow();
    });

    it('should reject invalid model names', () => {
      // Act & Assert
      expect(() => V0ModelSchema.parse('invalid-model')).toThrow();
      expect(() => V0ModelSchema.parse('gpt-4')).toThrow();
      expect(() => V0ModelSchema.parse('')).toThrow();
      expect(() => V0ModelSchema.parse(null)).toThrow();
    });
  });

  describe('GenerateUISchema', () => {
    it('should validate valid input', () => {
      // Arrange
      const validInput = {
        prompt: 'Create a login form',
        model: 'v0-1.5-md',
        stream: false,
        context: 'Optional context',
      };

      // Act
      const result = GenerateUISchema.parse(validInput);

      // Assert
      expect(result.prompt).toBe('Create a login form');
      expect(result.model).toBe('v0-1.5-md');
      expect(result.stream).toBe(false);
      expect(result.context).toBe('Optional context');
    });

    it('should apply default values', () => {
      // Arrange
      const minimalInput = {
        prompt: 'Create a button',
      };

      // Act
      const result = GenerateUISchema.parse(minimalInput);

      // Assert
      expect(result.prompt).toBe('Create a button');
      expect(result.model).toBe('v0-1.5-md'); // default
      expect(result.stream).toBe(false); // default
      expect(result.context).toBeUndefined();
    });

    it('should reject empty prompt', () => {
      // Arrange
      const invalidInput = {
        prompt: '',
      };

      // Act & Assert
      expect(() => GenerateUISchema.parse(invalidInput)).toThrow('Prompt is required');
    });

    it('should reject missing prompt', () => {
      // Arrange
      const invalidInput = {
        model: 'v0-1.5-md',
      };

      // Act & Assert
      expect(() => GenerateUISchema.parse(invalidInput)).toThrow();
    });

    it('should reject invalid model', () => {
      // Arrange
      const invalidInput = {
        prompt: 'Create a form',
        model: 'invalid-model',
      };

      // Act & Assert
      expect(() => GenerateUISchema.parse(invalidInput)).toThrow();
    });

    it('should validate stream boolean', () => {
      // Arrange
      const validInput = {
        prompt: 'Create a form',
        stream: true,
      };

      // Act
      const result = GenerateUISchema.parse(validInput);

      // Assert
      expect(result.stream).toBe(true);
    });

    it('should reject invalid stream value', () => {
      // Arrange
      const invalidInput = {
        prompt: 'Create a form',
        stream: 'true', // string instead of boolean
      };

      // Act & Assert
      expect(() => GenerateUISchema.parse(invalidInput)).toThrow();
    });
  });

  describe('GenerateFromImageSchema', () => {
    it('should validate valid input', () => {
      // Arrange
      const validInput = {
        imageUrl: 'https://example.com/image.png',
        prompt: 'Make it responsive',
        model: 'v0-1.5-lg',
      };

      // Act
      const result = GenerateFromImageSchema.parse(validInput);

      // Assert
      expect(result.imageUrl).toBe('https://example.com/image.png');
      expect(result.prompt).toBe('Make it responsive');
      expect(result.model).toBe('v0-1.5-lg');
    });

    it('should apply default model', () => {
      // Arrange
      const minimalInput = {
        imageUrl: 'https://example.com/design.jpg',
      };

      // Act
      const result = GenerateFromImageSchema.parse(minimalInput);

      // Assert
      expect(result.imageUrl).toBe('https://example.com/design.jpg');
      expect(result.model).toBe('v0-1.5-md'); // default
      expect(result.prompt).toBeUndefined();
    });

    it('should reject invalid URLs', () => {
      // Arrange
      const invalidInputs = [
        { imageUrl: 'not-a-url' },
        { imageUrl: 'ftp://example.com/image.png' },
        { imageUrl: '' },
        { imageUrl: 'relative/path.png' },
      ];

      // Act & Assert
      invalidInputs.forEach(input => {
        expect(() => GenerateFromImageSchema.parse(input)).toThrow('Valid image URL is required');
      });
    });

    it('should accept valid URLs', () => {
      // Arrange
      const validUrls = [
        'https://example.com/image.png',
        'http://example.com/design.jpg',
        'https://cdn.example.com/assets/mockup.webp',
      ];

      // Act & Assert
      validUrls.forEach(imageUrl => {
        expect(() => GenerateFromImageSchema.parse({ imageUrl })).not.toThrow();
      });
    });

    it('should reject missing imageUrl', () => {
      // Arrange
      const invalidInput = {
        prompt: 'Make it responsive',
      };

      // Act & Assert
      expect(() => GenerateFromImageSchema.parse(invalidInput)).toThrow();
    });
  });

  describe('ChatCompleteSchema', () => {
    it('should validate valid input', () => {
      // Arrange
      const validInput = {
        messages: [
          { role: 'user', content: 'Create a button' },
          { role: 'assistant', content: 'Here is a button component' },
          { role: 'user', content: 'Make it blue' },
        ],
        model: 'v0-1.5-lg',
        stream: true,
      };

      // Act
      const result = ChatCompleteSchema.parse(validInput);

      // Assert
      expect(result.messages).toHaveLength(3);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content).toBe('Create a button');
      expect(result.model).toBe('v0-1.5-lg');
      expect(result.stream).toBe(true);
    });

    it('should apply default values', () => {
      // Arrange
      const minimalInput = {
        messages: [
          { role: 'user', content: 'Hello' },
        ],
      };

      // Act
      const result = ChatCompleteSchema.parse(minimalInput);

      // Assert
      expect(result.messages).toHaveLength(1);
      expect(result.model).toBe('v0-1.5-md'); // default
      expect(result.stream).toBe(false); // default
    });

    it('should validate message roles', () => {
      // Arrange
      const validRoles = ['user', 'assistant', 'system'];

      // Act & Assert
      validRoles.forEach(role => {
        const input = {
          messages: [{ role, content: 'Test message' }],
        };
        expect(() => ChatCompleteSchema.parse(input)).not.toThrow();
      });
    });

    it('should reject invalid message roles', () => {
      // Arrange
      const invalidInput = {
        messages: [
          { role: 'invalid-role', content: 'Test message' },
        ],
      };

      // Act & Assert
      expect(() => ChatCompleteSchema.parse(invalidInput)).toThrow();
    });

    it('should reject empty messages array', () => {
      // Arrange
      const invalidInput = {
        messages: [],
      };

      // Act & Assert
      expect(() => ChatCompleteSchema.parse(invalidInput)).toThrow();
    });

    it('should reject missing messages', () => {
      // Arrange
      const invalidInput = {
        model: 'v0-1.5-md',
      };

      // Act & Assert
      expect(() => ChatCompleteSchema.parse(invalidInput)).toThrow();
    });

    it('should require content in messages', () => {
      // Arrange
      const invalidInput = {
        messages: [
          { role: 'user' }, // missing content
        ],
      };

      // Act & Assert
      expect(() => ChatCompleteSchema.parse(invalidInput)).toThrow();
    });

    it('should reject empty content in messages', () => {
      // Arrange
      const invalidInput = {
        messages: [
          { role: 'user', content: '' },
        ],
      };

      // Act & Assert
      expect(() => ChatCompleteSchema.parse(invalidInput)).toThrow();
    });

    it('should handle complex conversation', () => {
      // Arrange
      const complexInput = {
        messages: [
          { role: 'system', content: 'You are a helpful UI designer' },
          { role: 'user', content: 'Create a dashboard' },
          { role: 'assistant', content: 'I\'ll create a dashboard component' },
          { role: 'user', content: 'Add charts and metrics' },
          { role: 'assistant', content: 'Added charts and key metrics' },
          { role: 'user', content: 'Make it responsive for mobile' },
        ],
        model: 'v0-1.5-lg',
        stream: false,
      };

      // Act
      const result = ChatCompleteSchema.parse(complexInput);

      // Assert
      expect(result.messages).toHaveLength(6);
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[5].content).toBe('Make it responsive for mobile');
    });
  });
});