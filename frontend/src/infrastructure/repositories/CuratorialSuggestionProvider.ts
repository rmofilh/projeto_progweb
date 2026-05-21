import { ICuratorialSuggestionRepository, Suggestion } from "../../domain/repositories/ICuratorialSuggestionRepository";

export class CuratorialSuggestionProvider implements ICuratorialSuggestionRepository {
  async getSuggestions(patternId: string): Promise<Suggestion | null> {
    try {
      const response = await fetch('/suggestions.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data[patternId] || null;
    } catch (e) {
      console.error('Error loading suggestions', e);
      return null;
    }
  }
}
