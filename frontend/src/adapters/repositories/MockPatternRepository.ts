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
  },
  {
    id: "2",
    title: "Gato na Lua",
    imagePath: "/pattern-animal.png",
    thumbnailPath: "/pattern-animal.png",
    scaleCmReference: 12,
    difficulty: 2,
  },
  {
    id: "3",
    title: "Mandala Geométrica",
    imagePath: "/pattern-geometric.png",
    thumbnailPath: "/pattern-geometric.png",
    scaleCmReference: 20,
    difficulty: 4,
  },
];

const MOCK_COLLECTIONS: Collection[] = [
  { id: "c1", title: "Natureza", coverImagePath: "/pattern-floral.png" },
  { id: "c2", title: "Animais", coverImagePath: "/pattern-animal.png" },
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

  async getFavorites(): Promise<Pattern[]> {
    return MOCK_PATTERNS.slice(0, 1);
  }

  async toggleFavorite(patternId: string): Promise<void> {
    console.log(`Toggling favorite for ${patternId}`);
  }
}
