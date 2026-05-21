import { useQuery } from '@tanstack/react-query';
import { GetCuratorialSuggestionsUseCase } from '@/src/application/useCases/GetCuratorialSuggestionsUseCase';
import { CuratorialSuggestionProvider } from '@/src/infrastructure/repositories/CuratorialSuggestionProvider';

export function useCuratorialSuggestions(patternId: string) {
  return useQuery({
    queryKey: ['suggestions', patternId],
    queryFn: () => {
      const repo = new CuratorialSuggestionProvider();
      const useCase = new GetCuratorialSuggestionsUseCase(repo);
      return useCase.execute(patternId);
    }
  });
}
