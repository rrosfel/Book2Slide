export interface Character {
  name: string;
  role: string;
  description: string;
  icon?: string; // Emoji or similar generic icon suggestion
}

export interface PlotPoint {
  stage: string;
  description: string;
}

export interface Theme {
  name: string;
  description: string;
  color: string; // Hex code
}

export interface KeyConcept {
  term: string;
  definition: string;
  icon?: string;
}

export interface BookInfographicData {
  title: string;
  author: string;
  tagline: string;
  summary: string;
  publicationYear: string;
  genre: string;
  targetAudience: string;
  characters: Character[];
  plotArc: PlotPoint[];
  themes: Theme[];
  keyConcepts: KeyConcept[];
  keyQuote: string;
  takeaways: string[];
  sources: string[];
}