import { describe, it, expect } from 'vitest';
import { MockPatternRepository } from './MockPatternRepository';

describe('MockPatternRepository (Infrastructure Layer)', () => {
  const repo = new MockPatternRepository();

  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should list all patterns from mock data', async () => {
    const patterns = await repo.listAll();
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0]).toHaveProperty('id');
  });

  it('should find a pattern by its ID', async () => {
    const pattern = await repo.findById('1');
    expect(pattern).not.toBeNull();
    expect(pattern?.id).toBe('1');
  });

  it('should return null for non-existent ID', async () => {
    const pattern = await repo.findById('999');
    expect(pattern).toBeNull();
  });

  it('should list collections', async () => {
    const collections = await repo.listCollections();
    expect(collections.length).toBeGreaterThan(0);
  });

  it('should toggle and return favorites using localStorage', async () => {
    const initialFavorites = await repo.getFavorites();
    expect(initialFavorites).toHaveLength(0);

    await repo.toggleFavorite('1');
    const afterAdding = await repo.getFavorites();
    expect(afterAdding).toHaveLength(1);
    expect(afterAdding[0].id).toBe('1');

    await repo.toggleFavorite('1');
    const afterRemoving = await repo.getFavorites();
    expect(afterRemoving).toHaveLength(0);
  });
});
