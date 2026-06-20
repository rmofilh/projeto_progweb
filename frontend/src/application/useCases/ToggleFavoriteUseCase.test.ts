import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToggleFavoriteUseCase } from './ToggleFavoriteUseCase';
import type { IPatternRepository } from '@/src/domain/repositories/IPatternRepository';

describe('ToggleFavoriteUseCase', () => {
  let repo: IPatternRepository;
  let useCase: ToggleFavoriteUseCase;

  beforeEach(() => {
    repo = {
      getFavorites: vi.fn(),
      toggleFavorite: vi.fn(),
      listAll: vi.fn(),
      findById: vi.fn(),
      listCollections: vi.fn(),
      listByCollection: vi.fn(),
    };
    useCase = new ToggleFavoriteUseCase(repo);
  });

  it('should throw if patternId is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow('O ID do risco é obrigatório para favoritar.');
  });

  it('should throw if user already has 100 favorites', async () => {
    const manyFavorites = Array.from({ length: 100 }, (_, i) => ({
      id: String(i), title: `P${i}`, imagePath: '', thumbnailPath: '',
      scaleCmReference: 1, difficulty: 1 as const,
    }));
    (repo.getFavorites as ReturnType<typeof vi.fn>).mockResolvedValue(manyFavorites);

    await expect(useCase.execute('new-id')).rejects.toThrow('Limite de 100 favoritos atingido no Baú Pessoal.');
  });

  it('should call toggleFavorite when under limit', async () => {
    (repo.getFavorites as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await useCase.execute('pattern-1');

    expect(repo.toggleFavorite).toHaveBeenCalledWith('pattern-1');
  });

  it('should call toggleFavorite when pattern is already favorited', async () => {
    const existing = [{ id: 'pattern-1', title: 'Existing', imagePath: '', thumbnailPath: '', scaleCmReference: 1, difficulty: 1 as const }];
    (repo.getFavorites as ReturnType<typeof vi.fn>).mockResolvedValue(existing);

    await useCase.execute('pattern-1');

    expect(repo.toggleFavorite).toHaveBeenCalledWith('pattern-1');
  });

  it('should allow favoriting when at 99 favorites', async () => {
    const manyFavorites = Array.from({ length: 99 }, (_, i) => ({
      id: String(i), title: `P${i}`, imagePath: '', thumbnailPath: '',
      scaleCmReference: 1, difficulty: 1 as const,
    }));
    (repo.getFavorites as ReturnType<typeof vi.fn>).mockResolvedValue(manyFavorites);

    await useCase.execute('new-id');

    expect(repo.toggleFavorite).toHaveBeenCalledWith('new-id');
  });
});
