import { useQuery } from "@tanstack/react-query";
import { GetFavoritesUseCase } from "@/src/application/useCases/GetFavoritesUseCase";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const useCase = new GetFavoritesUseCase();
      return await useCase.execute();
    },
  });
}
