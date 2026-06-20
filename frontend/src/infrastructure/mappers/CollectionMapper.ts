import { Collection } from "../../domain/entities/Collection";

export class CollectionMapper {
  static toDomain(raw: Record<string, unknown>): Collection {
    return {
      id: String(raw.id),
      title: String(raw.title),
      coverImagePath: raw.cover_image_path as string,
    };
  }

  static toDomainList(rawList: Record<string, unknown>[]): Collection[] {
    return rawList.map(this.toDomain);
  }
}
