import { IPatternRepository } from "../../domain/repositories/IPatternRepository";
import { Pattern } from "../../domain/entities/Pattern";
import { Collection } from "../../domain/entities/Collection";
import { axiosClient } from "../http/axiosClient";
import { PatternMapper } from "../mappers/PatternMapper";
import { CollectionMapper } from "../mappers/CollectionMapper";

export class ApiPatternRepository implements IPatternRepository {
  async listAll(): Promise<Pattern[]> {
    const { data } = await axiosClient.get("/v1/catalog/patterns");
    return PatternMapper.toDomainList(data);
  }

  async findById(id: string): Promise<Pattern | null> {
    const { data } = await axiosClient.get(`/v1/catalog/patterns/${id}`);
    return PatternMapper.toDomain(data);
  }

  async listCollections(): Promise<Collection[]> {
    const { data } = await axiosClient.get("/v1/catalog/collections");
    return CollectionMapper.toDomainList(data);
  }

  async listByCollection(collectionId: string): Promise<Pattern[]> {
    const { data } = await axiosClient.get("/v1/catalog/patterns", {
      params: { collection_id: collectionId },
    });
    return PatternMapper.toDomainList(data);
  }

  async getFavorites(): Promise<Pattern[]> {
    const { data } = await axiosClient.get("/v1/favorites");
    return PatternMapper.toDomainList(data);
  }

  async toggleFavorite(patternId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const isFavorited = favorites.some(f => f.id === patternId);

    if (isFavorited) {
      await axiosClient.delete(`/v1/favorites/${patternId}`);
    } else {
      await axiosClient.post(`/v1/favorites/${patternId}`);
    }
  }
}
