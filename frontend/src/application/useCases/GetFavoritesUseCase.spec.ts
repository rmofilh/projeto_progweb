import { describe, it, expect, vi } from 'vitest';
import { GetFavoritesUseCase } from './GetFavoritesUseCase';
import { IPatternRepository } from '@/src/domain/repositories/IPatternRepository';

describe('GetFavoritesUseCase (Application Layer)', () => {
  it('should call repository.getFavorites and return its data', async () => {
    // Arrange
    const mockPatterns = [
      { id: '1', title: 'Pattern 1', difficulty: 1 },
      { id: '2', title: 'Pattern 2', difficulty: 2 },
    ];
    
    const fakeRepo: IPatternRepository = {
      getFavorites: vi.fn().mockResolvedValue(mockPatterns),
      listAll: vi.fn(),
      findById: vi.fn(),
      listCollections: vi.fn(),
      listByCollection: vi.fn(),
      toggleFavorite: vi.fn(),
    };

    const useCase = new GetFavoritesUseCase(fakeRepo);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(fakeRepo.getFavorites).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockPatterns);
    expect(result).toHaveLength(2);
  });
});
