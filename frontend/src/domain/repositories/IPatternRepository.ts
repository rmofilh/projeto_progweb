import { Pattern } from "../entities/Pattern";
import { Collection } from "../entities/Collection";

export interface IPatternRepository {
  listAll(): Promise<Pattern[]>;
  findById(id: string): Promise<Pattern | null>;
  listCollections(): Promise<Collection[]>;
  listByCollection(collectionId: string): Promise<Pattern[]>;
  getFavorites(): Promise<Pattern[]>;
  toggleFavorite(patternId: string): Promise<void>;
}
