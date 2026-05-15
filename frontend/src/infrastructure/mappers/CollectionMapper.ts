import { Collection } from "../../domain/entities/Collection";

export class CollectionMapper {
  static toDomain(raw: any): Collection {
    return {
      id: raw.id,
      title: raw.title,
      coverImagePath: raw.cover_image_path,
    };
  }

  static toDomainList(rawList: any[]): Collection[] {
    return rawList.map(this.toDomain);
  }
}
