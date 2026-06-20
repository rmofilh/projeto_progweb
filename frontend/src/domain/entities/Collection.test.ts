import { describe, it, expect } from 'vitest';
import type { Collection } from './Collection';

describe('Collection entity', () => {
  it('should create a valid Collection object', () => {
    const collection: Collection = {
      id: 'c1',
      title: 'Natureza',
      coverImagePath: '/path/to/image.png',
    };
    expect(collection).toMatchObject({
      id: 'c1',
      title: 'Natureza',
      coverImagePath: '/path/to/image.png',
    });
  });

  it('should accept different values', () => {
    const collection: Collection = {
      id: 'c2',
      title: 'Animais',
      coverImagePath: '/animals.png',
    };
    expect(collection.id).toBe('c2');
    expect(collection.title).toBe('Animais');
    expect(collection.coverImagePath).toBe('/animals.png');
  });
});
