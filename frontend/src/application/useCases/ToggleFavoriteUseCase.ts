import { IPatternRepository } from "../../domain/repositories/IPatternRepository";

export class ToggleFavoriteUseCase {
  constructor(private patternRepository: IPatternRepository) {}

  async execute(patternId: string): Promise<void> {
    if (!patternId) {
      throw new Error("O ID do risco é obrigatório para favoritar.");
    }
    await this.patternRepository.toggleFavorite(patternId);
  }
}
