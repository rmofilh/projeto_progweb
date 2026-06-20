import { Pattern, DifficultyLevel } from "../../domain/entities/Pattern";

export class PatternMapper {
  static toDomain(raw: Record<string, unknown>): Pattern {
    return {
      id: String(raw.id),
      title: String(raw.title),
      imagePath: raw.image_path as string,
      thumbnailPath: raw.thumbnail_path as string,
      scaleCmReference: Number(raw.scale_cm_reference),
      difficulty: raw.difficulty_level as DifficultyLevel,
      collectionId: raw.collection_id != null ? String(raw.collection_id) : undefined,
    };
  }

  static toDomainList(rawList: Record<string, unknown>[]): Pattern[] {
    return rawList.map(this.toDomain);
  }
}
