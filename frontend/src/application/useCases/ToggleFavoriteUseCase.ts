import { IPatternRepository } from "../../domain/repositories/IPatternRepository";

export class ToggleFavoriteUseCase {
  constructor(private patternRepository: IPatternRepository) {}

  async execute(patternId: string): Promise<void> {
    if (!patternId) {
      throw new Error("O ID do risco é obrigatório para favoritar.");
    }

    const favorites = await this.patternRepository.getFavorites();
    const isFavorited = favorites.some(p => p.id === patternId);

    if (!isFavorited && favorites.length >= 100) {
      throw new Error("Limite de 100 favoritos atingido no Baú Pessoal.");
    }

    await this.patternRepository.toggleFavorite(patternId);
  }
}
