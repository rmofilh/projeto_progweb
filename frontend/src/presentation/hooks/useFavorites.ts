import { useQuery } from "@tanstack/react-query";
import { GetFavoritesUseCase } from "@/src/application/useCases/GetFavoritesUseCase";
import { getPatternRepository } from "@/src/infrastructure/repositories";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const repository = getPatternRepository();
      const useCase = new GetFavoritesUseCase(repository);
      return await useCase.execute();
    },
  });
}
