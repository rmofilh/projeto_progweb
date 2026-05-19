import { useQuery } from "@tanstack/react-query";
import { GetFavoritesUseCase } from "@/src/application/useCases/GetFavoritesUseCase";
import { MockPatternRepository } from "@/src/infrastructure/repositories/MockPatternRepository";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const repository = new MockPatternRepository();
      const useCase = new GetFavoritesUseCase(repository);
      return await useCase.execute();
    },
  });
}
