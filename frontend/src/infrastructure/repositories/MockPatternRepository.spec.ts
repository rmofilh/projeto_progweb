import { describe, it, expect } from 'vitest';
import { MockPatternRepository } from './MockPatternRepository';

describe('MockPatternRepository (Infrastructure Layer)', () => {
  const repo = new MockPatternRepository();

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

  it('should return favorites (mock slice)', async () => {
    const favorites = await repo.getFavorites();
    expect(Array.isArray(favorites)).toBe(true);
  });
});
