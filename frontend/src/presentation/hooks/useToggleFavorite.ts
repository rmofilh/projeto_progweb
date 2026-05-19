import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MockPatternRepository } from "@/src/infrastructure/repositories/MockPatternRepository";
import { ToggleFavoriteUseCase } from "@/src/application/useCases/ToggleFavoriteUseCase";
import { toast } from "sonner";

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patternId: string) => {
      const repo = new MockPatternRepository();
      const useCase = new ToggleFavoriteUseCase(repo);
      await useCase.execute(patternId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao favoritar", {
        description: error.message,
      });
    }
  });
}
