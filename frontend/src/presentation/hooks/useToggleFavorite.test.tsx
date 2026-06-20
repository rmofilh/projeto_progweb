import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QueryProvider from '@/src/presentation/providers/QueryProvider';
import { useToggleFavorite } from './useToggleFavorite';
import type { ReactNode } from 'react';

const mockRepo = {
  getFavorites: vi.fn().mockResolvedValue([]),
  toggleFavorite: vi.fn().mockResolvedValue(undefined),
  listAll: vi.fn(),
  findById: vi.fn(),
  listCollections: vi.fn(),
  listByCollection: vi.fn(),
};

let invalidatedKeys: string[][] = [];

vi.mock('@/src/infrastructure/repositories', () => ({
  getPatternRepository: () => mockRepo,
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(({ queryKey }: { queryKey: string[] }) => {
        invalidatedKeys.push(queryKey);
      }),
    }),
  };
});

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

describe('useToggleFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidatedKeys = [];
  });

  it('should call toggleFavorite on mutation', async () => {
    const { result } = renderHook(() => useToggleFavorite(), { wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockRepo.toggleFavorite).toHaveBeenCalledWith('pattern-1');
  });

  it('should invalidate favorites query on success', async () => {
    const { result } = renderHook(() => useToggleFavorite(), { wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidatedKeys).toContainEqual(['favorites']);
  });

  it('should show error toast on failure', async () => {
    const { toast } = await import('sonner');
    mockRepo.toggleFavorite.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useToggleFavorite(), { wrapper });

    result.current.mutate('pattern-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalled();
  });
});
