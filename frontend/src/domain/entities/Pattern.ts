export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface Pattern {
  id: string;
  title: string;
  imagePath: string;
  thumbnailPath: string;
  scaleCmReference: number;
  difficulty: DifficultyLevel;
  collectionId?: string;
}

export function getDifficultyLabel(level: DifficultyLevel): string {
  const labels: Record<DifficultyLevel, string> = {
    1: "Iniciante",
    2: "Fácil",
    3: "Médio",
    4: "Avançado",
    5: "Mestre",
  };
  return labels[level];
}
