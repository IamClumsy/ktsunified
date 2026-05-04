export interface Artist {
  id: number;
  name: string;
  group: string;
  genre: string;
  position: string;
  rank: string;
  rating?: number | null;
  skills: string[];
  thoughts?: string;
  build?: string;
  photos?: string;
}

export enum LetterGrade {
  S = "S",
  A = "A",
  B = "B",
  C = "C",
  F = "F",
}

export const SKILL_POINTS = {
  BEST: 10,
  GOOD: 6,
  OKAY: 3,
  BAD: 0,
  WORST: -1,
} as const;

export const GRADE_THRESHOLDS = {
  S: 16,
  A: 11,
  B: 6,
  C: 2,
} as const;
