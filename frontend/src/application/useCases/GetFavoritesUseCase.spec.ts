import { describe, it, expect, vi } from 'vitest';
import { GetFavoritesUseCase } from './GetFavoritesUseCase';
import { MockPatternRepository } from '@/src/infrastructure/repositories/MockPatternRepository';

describe('GetFavoritesUseCase (Application Layer)', () => {
  it('should call repository.getFavorites and return its data', async () => {
    // Arrange
    const mockPatterns = [
      { id: '1', title: 'Pattern 1', difficulty: 1 },
      { id: '2', title: 'Pattern 2', difficulty: 2 },
    ];
    
    // Spying on the repository method before instantiation
    const getFavoritesSpy = vi.spyOn(MockPatternRepository.prototype, 'getFavorites')
      .mockResolvedValue(mockPatterns as any);

    const useCase = new GetFavoritesUseCase();

    // Act
    const result = await useCase.execute();

    // Assert
    expect(getFavoritesSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockPatterns);
    expect(result).toHaveLength(2);

    // Cleanup
    getFavoritesSpy.mockRestore();
  });
});
