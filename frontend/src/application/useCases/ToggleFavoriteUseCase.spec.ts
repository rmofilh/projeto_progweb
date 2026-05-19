import { describe, it, expect, vi } from 'vitest';
import { ToggleFavoriteUseCase } from './ToggleFavoriteUseCase';
import { IPatternRepository } from '../../domain/repositories/IPatternRepository';
import { Pattern } from '../../domain/entities/Pattern';

describe('ToggleFavoriteUseCase (Application Layer)', () => {
  it('should call repository toggleFavorite with correct id', async () => {
    // Arrange
    const mockRepo: IPatternRepository = {
      listAll: vi.fn(),
      findById: vi.fn(),
      getFavorites: vi.fn(),
      toggleFavorite: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new ToggleFavoriteUseCase(mockRepo);
    const patternId = 'p1';

    // Act
    await useCase.execute(patternId);

    // Assert
    expect(mockRepo.toggleFavorite).toHaveBeenCalledWith(patternId);
  });

  it('should throw error if patternId is empty', async () => {
    // Arrange
    const mockRepo: IPatternRepository = {
      listAll: vi.fn(),
      findById: vi.fn(),
      getFavorites: vi.fn(),
      toggleFavorite: vi.fn(),
    };
    const useCase = new ToggleFavoriteUseCase(mockRepo);

    // Act & Assert
    await expect(useCase.execute('')).rejects.toThrow('O ID do risco é obrigatório para favoritar.');
    expect(mockRepo.toggleFavorite).not.toHaveBeenCalled();
  });
});
