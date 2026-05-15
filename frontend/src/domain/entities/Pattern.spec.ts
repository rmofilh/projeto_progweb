import { describe, it, expect } from 'vitest';
import { getDifficultyLabel, DifficultyLevel } from './Pattern';

describe('Pattern Domain', () => {
  describe('getDifficultyLabel', () => {
    it('should return correct labels for all difficulty levels', () => {
      // Arrange & Act & Assert
      expect(getDifficultyLabel(1)).toBe('Iniciante');
      expect(getDifficultyLabel(2)).toBe('Fácil');
      expect(getDifficultyLabel(3)).toBe('Médio');
      expect(getDifficultyLabel(4)).toBe('Avançado');
      expect(getDifficultyLabel(5)).toBe('Mestre');
    });

    it('should return undefined for invalid levels (Boundary Test)', () => {
      // Arrange
      const invalidLevel = 99 as unknown as DifficultyLevel;
      
      // Act
      const result = getDifficultyLabel(invalidLevel);
      
      // Assert
      expect(result).toBeUndefined();
    });
  });
});
