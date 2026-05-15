import { Pattern } from "@/src/domain/entities/Pattern";
import { MockPatternRepository } from "@/src/infrastructure/repositories/MockPatternRepository";

export class GetFavoritesUseCase {
  private repository: MockPatternRepository;

  constructor() {
    // No futuro, isso pode vir via injeção de dependência DI
    this.repository = new MockPatternRepository();
  }

  async execute(): Promise<Pattern[]> {
    // Aqui podemos ter regras de negócios antes de bater no banco
    const favorites = await this.repository.getFavorites();
    // Exemplo de regra: só retornar os 10 primeiros
    return favorites;
  }
}
