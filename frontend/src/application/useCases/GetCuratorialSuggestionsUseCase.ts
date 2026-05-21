import { ICuratorialSuggestionRepository, Suggestion } from "../../domain/repositories/ICuratorialSuggestionRepository";

export class GetCuratorialSuggestionsUseCase {
  constructor(private suggestionRepository: ICuratorialSuggestionRepository) {}

  async execute(patternId: string): Promise<Suggestion | null> {
    if (!patternId) {
      throw new Error("O ID do risco é obrigatório.");
    }
    return await this.suggestionRepository.getSuggestions(patternId);
  }
}
