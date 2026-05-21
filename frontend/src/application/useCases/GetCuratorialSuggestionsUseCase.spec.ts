import { describe, it, expect, vi } from 'vitest';
import { GetCuratorialSuggestionsUseCase } from './GetCuratorialSuggestionsUseCase';
import { ICuratorialSuggestionRepository } from '../../domain/repositories/ICuratorialSuggestionRepository';

describe('GetCuratorialSuggestionsUseCase (Application Layer)', () => {
  it('should call repository getSuggestions with correct id and return data', async () => {
    // Arrange
    const mockSuggestion = { threads: ['DMC 310'], stitches: ['Ponto Atrás'] };
    const mockRepo: ICuratorialSuggestionRepository = {
      getSuggestions: vi.fn().mockResolvedValue(mockSuggestion),
    };
    const useCase = new GetCuratorialSuggestionsUseCase(mockRepo);
    const patternId = '1';

    // Act
    const result = await useCase.execute(patternId);

    // Assert
    expect(mockRepo.getSuggestions).toHaveBeenCalledWith(patternId);
    expect(result).toEqual(mockSuggestion);
  });

  it('should throw error if patternId is empty', async () => {
    // Arrange
    const mockRepo: ICuratorialSuggestionRepository = {
      getSuggestions: vi.fn(),
    };
    const useCase = new GetCuratorialSuggestionsUseCase(mockRepo);

    // Act & Assert
    await expect(useCase.execute('')).rejects.toThrow('O ID do risco é obrigatório.');
    expect(mockRepo.getSuggestions).not.toHaveBeenCalled();
  });
});
