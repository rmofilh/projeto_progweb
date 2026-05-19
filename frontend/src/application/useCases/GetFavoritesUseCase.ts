import { Pattern } from "@/src/domain/entities/Pattern";
import { IPatternRepository } from "@/src/domain/repositories/IPatternRepository";

export class GetFavoritesUseCase {
  constructor(private repository: IPatternRepository) {}

  async execute(): Promise<Pattern[]> {
    // Aqui podemos ter regras de negócios antes de bater no banco
    const favorites = await this.repository.getFavorites();
    // Exemplo de regra: só retornar os 10 primeiros
    return favorites;
  }
}
