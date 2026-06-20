import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getPatternRepository } from "@/src/infrastructure/repositories";
import { ToggleFavoriteUseCase } from "@/src/application/useCases/ToggleFavoriteUseCase";
import { toast } from "sonner";

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patternId: string) => {
      const repo = getPatternRepository();
      const useCase = new ToggleFavoriteUseCase(repo);
      await useCase.execute(patternId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error: unknown) => {
      toast.error("Erro ao favoritar", {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  });
}
