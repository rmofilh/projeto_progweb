import { describe, it, expect } from 'vitest';
import { CollectionMapper } from './CollectionMapper';

describe('CollectionMapper', () => {
  const raw = {
    id: 'c1',
    title: 'Natureza',
    cover_image_path: '/nature.png',
  };

  it('should map raw API data to domain Collection', () => {
    const collection = CollectionMapper.toDomain(raw);
    expect(collection.id).toBe('c1');
    expect(collection.title).toBe('Natureza');
    expect(collection.coverImagePath).toBe('/nature.png');
  });

  it('should map snake_case cover_image_path to camelCase', () => {
    const collection = CollectionMapper.toDomain(raw);
    expect(collection.coverImagePath).toBe(raw.cover_image_path);
  });

  it('should map list of raw data', () => {
    const collections = CollectionMapper.toDomainList([
      raw,
      { id: 'c2', title: 'Animais', cover_image_path: '/animals.png' },
    ]);
    expect(collections).toHaveLength(2);
    expect(collections[1].title).toBe('Animais');
  });

  it('should return empty array for empty input', () => {
    expect(CollectionMapper.toDomainList([])).toEqual([]);
  });
});
