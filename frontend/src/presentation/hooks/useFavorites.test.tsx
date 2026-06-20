import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import QueryProvider from '@/src/presentation/providers/QueryProvider';
import { useFavorites } from './useFavorites';
import type { ReactNode } from 'react';

const mockFavorites = [
  { id: '1', title: 'Pattern 1', imagePath: '/1.png', thumbnailPath: '/1.png', scaleCmReference: 10, difficulty: 1 as const },
  { id: '2', title: 'Pattern 2', imagePath: '/2.png', thumbnailPath: '/2.png', scaleCmReference: 20, difficulty: 3 as const },
];

const mockRepo = {
  getFavorites: vi.fn().mockResolvedValue(mockFavorites),
  listAll: vi.fn(),
  findById: vi.fn(),
  listCollections: vi.fn(),
  listByCollection: vi.fn(),
  toggleFavorite: vi.fn(),
};

vi.mock('@/src/infrastructure/repositories', () => ({
  getPatternRepository: () => mockRepo,
}));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch favorites on mount', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockFavorites);
    expect(mockRepo.getFavorites).toHaveBeenCalledOnce();
  });

  it('should return empty array when no favorites exist', async () => {
    mockRepo.getFavorites.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useFavorites(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('should have loading state initially', () => {
    mockRepo.getFavorites.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });
});
