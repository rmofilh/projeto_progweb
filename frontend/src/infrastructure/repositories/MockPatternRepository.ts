import { IPatternRepository } from "../../domain/repositories/IPatternRepository";
import { Pattern } from "../../domain/entities/Pattern";
import { Collection } from "../../domain/entities/Collection";

const MOCK_PATTERNS: Pattern[] = [
  {
    id: "1",
    title: "Buquê de Primavera",
    imagePath: "/pattern-floral.png",
    thumbnailPath: "/pattern-floral.png",
    scaleCmReference: 15,
    difficulty: 1,
    collectionId: "c1",
  },
  {
    id: "2",
    title: "Gato na Lua",
    imagePath: "/pattern-animal.png",
    thumbnailPath: "/pattern-animal.png",
    scaleCmReference: 12,
    difficulty: 2,
    collectionId: "c2",
  },
  {
    id: "3",
    title: "Mandala Geométrica",
    imagePath: "/pattern-geometric.png",
    thumbnailPath: "/pattern-geometric.png",
    scaleCmReference: 20,
    difficulty: 4,
    collectionId: "c3",
  },
  {
    id: "4",
    title: "Rosas Selvagens",
    imagePath: "/pattern-floral.png",
    thumbnailPath: "/pattern-floral.png",
    scaleCmReference: 18,
    difficulty: 3,
    collectionId: "c1",
  },
  {
    id: "5",
    title: "Lobo Solitário",
    imagePath: "/pattern-animal.png",
    thumbnailPath: "/pattern-animal.png",
    scaleCmReference: 22,
    difficulty: 5,
    collectionId: "c2",
  }
];

const MOCK_COLLECTIONS: Collection[] = [
  { id: "c1", title: "Natureza", coverImagePath: "/pattern-floral.png" },
  { id: "c2", title: "Animais", coverImagePath: "/pattern-animal.png" },
  { id: "c3", title: "Abstrato", coverImagePath: "/pattern-geometric.png" },
];

export class MockPatternRepository implements IPatternRepository {
  async listAll(): Promise<Pattern[]> {
    return MOCK_PATTERNS;
  }

  async findById(id: string): Promise<Pattern | null> {
    return MOCK_PATTERNS.find(p => p.id === id) || null;
  }

  async listCollections(): Promise<Collection[]> {
    return MOCK_COLLECTIONS;
  }

  async listByCollection(collectionId: string): Promise<Pattern[]> {
    return MOCK_PATTERNS.filter(p => p.collectionId === collectionId);
  }

  private getFavoriteIds(): string[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const stored = localStorage.getItem('fioeluz_favorites');
    return stored ? JSON.parse(stored) : [];
  }

  async getFavorites(): Promise<Pattern[]> {
    const favoriteIds = this.getFavoriteIds();
    return MOCK_PATTERNS.filter(p => favoriteIds.includes(p.id));
  }

  async toggleFavorite(patternId: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    let favoriteIds = this.getFavoriteIds();
    
    if (favoriteIds.includes(patternId)) {
      favoriteIds = favoriteIds.filter(id => id !== patternId);
    } else {
      favoriteIds.push(patternId);
    }
    
    localStorage.setItem('fioeluz_favorites', JSON.stringify(favoriteIds));
  }
}
