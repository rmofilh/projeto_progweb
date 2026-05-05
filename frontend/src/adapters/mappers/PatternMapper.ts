import { Pattern, DifficultyLevel } from "../../domain/entities/Pattern";

export class PatternMapper {
  /**
   * Converte o JSON bruto da API para a Entidade de Domínio Pattern.
   */
  static toDomain(raw: any): Pattern {
    return {
      id: raw.id,
      title: raw.title,
      imagePath: raw.image_path,
      thumbnailPath: raw.thumbnail_path,
      scaleCmReference: Number(raw.scale_cm_reference),
      difficulty: raw.difficulty_level as DifficultyLevel,
      collectionId: raw.collection_id,
    };
  }

  static toDomainList(rawList: any[]): Pattern[] {
    return rawList.map(this.toDomain);
  }
}
