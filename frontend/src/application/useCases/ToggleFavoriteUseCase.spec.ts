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
      listCollections: vi.fn(),
      listByCollection: vi.fn(),
      getFavorites: vi.fn().mockResolvedValue([]),
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
      listCollections: vi.fn(),
      listByCollection: vi.fn(),
      getFavorites: vi.fn().mockResolvedValue([]),
      toggleFavorite: vi.fn(),
    };
    const useCase = new ToggleFavoriteUseCase(mockRepo);

    // Act & Assert
    await expect(useCase.execute('')).rejects.toThrow('O ID do risco é obrigatório para favoritar.');
    expect(mockRepo.toggleFavorite).not.toHaveBeenCalled();
  });

  it('should throw error when trying to add a new favorite and list already has 100 items', async () => {
    // Arrange
    const mockFavorites = Array.from({ length: 100 }, (_, i) => ({ id: `p${i}` } as Pattern));
    const mockRepo: IPatternRepository = {
      listAll: vi.fn(),
      findById: vi.fn(),
      listCollections: vi.fn(),
      listByCollection: vi.fn(),
      getFavorites: vi.fn().mockResolvedValue(mockFavorites),
      toggleFavorite: vi.fn(),
    };
    const useCase = new ToggleFavoriteUseCase(mockRepo);

    // Act & Assert
    await expect(useCase.execute('new_pattern')).rejects.toThrow('Limite de 100 favoritos atingido no Baú Pessoal.');
    expect(mockRepo.toggleFavorite).not.toHaveBeenCalled();
  });

  it('should allow toggling (removing) an existing favorite even if list has 100 items', async () => {
    // Arrange
    const mockFavorites = Array.from({ length: 100 }, (_, i) => ({ id: `p${i}` } as Pattern));
    const mockRepo: IPatternRepository = {
      listAll: vi.fn(),
      findById: vi.fn(),
      getFavorites: vi.fn().mockResolvedValue(mockFavorites),
      toggleFavorite: vi.fn().mockResolvedValue(undefined),
      listCollections: vi.fn(),
      listByCollection: vi.fn(),
    };
    const useCase = new ToggleFavoriteUseCase(mockRepo);

    // Act
    await useCase.execute('p50');

    // Assert
    expect(mockRepo.toggleFavorite).toHaveBeenCalledWith('p50');
  });
});
