import { IPatternRepository } from "../../domain/repositories/IPatternRepository";
import { Pattern } from "../../domain/entities/Pattern";
import { Collection } from "../../domain/entities/Collection";

const MOCK_PATTERNS: Pattern[] = [
  {
    id: "1",
    title: "Folha de Samambaia",
    imagePath: "/pattern-fern.svg",
    thumbnailPath: "/pattern-fern.svg",
    scaleCmReference: 18,
    difficulty: 2,
    collectionId: "c1",
  },
  {
    id: "2",
    title: "Rosas Selvagens",
    imagePath: "/pattern-roses.svg",
    thumbnailPath: "/pattern-roses.svg",
    scaleCmReference: 16,
    difficulty: 3,
    collectionId: "c1",
  },
  {
    id: "3",
    title: "Gato na Lua",
    imagePath: "/pattern-cat-moon.svg",
    thumbnailPath: "/pattern-cat-moon.svg",
    scaleCmReference: 14,
    difficulty: 2,
    collectionId: "c2",
  },
  {
    id: "4",
    title: "Lobo Solitário",
    imagePath: "/pattern-wolf.svg",
    thumbnailPath: "/pattern-wolf.svg",
    scaleCmReference: 22,
    difficulty: 5,
    collectionId: "c2",
  },
  {
    id: "5",
    title: "Beija-Flor",
    imagePath: "/pattern-hummingbird.svg",
    thumbnailPath: "/pattern-hummingbird.svg",
    scaleCmReference: 12,
    difficulty: 3,
    collectionId: "c2",
  },
  {
    id: "6",
    title: "Mandala Geométrica",
    imagePath: "/pattern-mandala.svg",
    thumbnailPath: "/pattern-mandala.svg",
    scaleCmReference: 20,
    difficulty: 4,
    collectionId: "c3",
  },
  {
    id: "7",
    title: "Estrela Teia",
    imagePath: "/pattern-star.svg",
    thumbnailPath: "/pattern-star.svg",
    scaleCmReference: 18,
    difficulty: 5,
    collectionId: "c3",
  },
  {
    id: "8",
    title: "Caleidoscópio",
    imagePath: "/pattern-kaleidoscope.svg",
    thumbnailPath: "/pattern-kaleidoscope.svg",
    scaleCmReference: 16,
    difficulty: 3,
    collectionId: "c3",
  },
  {
    id: "9",
    title: "Buquê de Primavera",
    imagePath: "/pattern-bouquet.svg",
    thumbnailPath: "/pattern-bouquet.svg",
    scaleCmReference: 15,
    difficulty: 1,
    collectionId: "c4",
  },
  {
    id: "10",
    title: "Lavandas",
    imagePath: "/pattern-lavender.svg",
    thumbnailPath: "/pattern-lavender.svg",
    scaleCmReference: 14,
    difficulty: 1,
    collectionId: "c4",
  },
  {
    id: "11",
    title: "Girassol",
    imagePath: "/pattern-sunflower.svg",
    thumbnailPath: "/pattern-sunflower.svg",
    scaleCmReference: 20,
    difficulty: 2,
    collectionId: "c4",
  },
];

const MOCK_COLLECTIONS: Collection[] = [
  { id: "c1", title: "Natureza", coverImagePath: "/pattern-fern.svg" },
  { id: "c2", title: "Animais", coverImagePath: "/pattern-cat-moon.svg" },
  { id: "c3", title: "Geométrico", coverImagePath: "/pattern-mandala.svg" },
  { id: "c4", title: "Floral", coverImagePath: "/pattern-bouquet.svg" },
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
