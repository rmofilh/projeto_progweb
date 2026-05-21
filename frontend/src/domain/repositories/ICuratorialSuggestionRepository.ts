export interface Suggestion {
  threads: string[];
  stitches: string[];
}

export interface ICuratorialSuggestionRepository {
  getSuggestions(patternId: string): Promise<Suggestion | null>;
}
