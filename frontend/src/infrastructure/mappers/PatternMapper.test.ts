import { describe, it, expect } from 'vitest';
import { PatternMapper } from './PatternMapper';

describe('PatternMapper', () => {
  const raw = {
    id: '1',
    title: 'Test Pattern',
    image_path: '/img.png',
    thumbnail_path: '/thumb.png',
    scale_cm_reference: '15',
    difficulty_level: 3,
    collection_id: 'c1',
  };

  it('should map raw API data to domain Pattern', () => {
    const pattern = PatternMapper.toDomain(raw);
    expect(pattern.id).toBe('1');
    expect(pattern.title).toBe('Test Pattern');
    expect(pattern.imagePath).toBe('/img.png');
    expect(pattern.thumbnailPath).toBe('/thumb.png');
    expect(pattern.scaleCmReference).toBe(15);
    expect(pattern.difficulty).toBe(3);
    expect(pattern.collectionId).toBe('c1');
  });

  it('should map snake_case to camelCase', () => {
    const pattern = PatternMapper.toDomain(raw);
    expect(pattern.imagePath).toBe(raw.image_path);
    expect(pattern.thumbnailPath).toBe(raw.thumbnail_path);
    expect(pattern.scaleCmReference).toBe(Number(raw.scale_cm_reference));
    expect(pattern.difficulty).toBe(raw.difficulty_level);
    expect(pattern.collectionId).toBe(raw.collection_id);
  });

  it('should convert scale_cm_reference to number', () => {
    const pattern = PatternMapper.toDomain({ ...raw, scale_cm_reference: '20.5' });
    expect(pattern.scaleCmReference).toBe(20.5);
  });

  it('should map list of raw data', () => {
    const patterns = PatternMapper.toDomainList([raw, { ...raw, id: '2', title: 'Second' }]);
    expect(patterns).toHaveLength(2);
    expect(patterns[0].id).toBe('1');
    expect(patterns[1].title).toBe('Second');
  });

  it('should handle missing collection_id', () => {
    const { collection_id: _, ...noCollection } = raw;
    const pattern = PatternMapper.toDomain(noCollection);
    expect(pattern.collectionId).toBeUndefined();
  });

  it('should return empty array for empty input', () => {
    expect(PatternMapper.toDomainList([])).toEqual([]);
  });
});
