import { describe, it, expect } from 'vitest';
import { getDifficultyLabel } from './Pattern';

describe('getDifficultyLabel', () => {
  it('should return "Iniciante" for level 1', () => {
    expect(getDifficultyLabel(1)).toBe('Iniciante');
  });

  it('should return "Fácil" for level 2', () => {
    expect(getDifficultyLabel(2)).toBe('Fácil');
  });

  it('should return "Médio" for level 3', () => {
    expect(getDifficultyLabel(3)).toBe('Médio');
  });

  it('should return "Avançado" for level 4', () => {
    expect(getDifficultyLabel(4)).toBe('Avançado');
  });

  it('should return "Mestre" for level 5', () => {
    expect(getDifficultyLabel(5)).toBe('Mestre');
  });
});
