import { Artist, SKILL_POINTS, GRADE_THRESHOLDS, LetterGrade } from "../types";

export const calculateArtistPoints = (
  artist: Artist,
  bestSkills: string[],
  goodSkills: string[],
  okaySkills: string[],
  badSkills: string[],
  worstSkills: string[],
  bestSkills3: string[],
  goodSkills3: string[],
  okaySkills3: string[],
  badSkills3: string[],
  worstSkills3: string[]
): number => {
  let points = 0;
  artist.skills.forEach((skill, index) => {
    if (!skill || index === 0) return;
    const isBest = index === 1 ? bestSkills.includes(skill) : bestSkills3.includes(skill);
    const isGood = index === 1 ? goodSkills.includes(skill) : goodSkills3.includes(skill);
    const isOkay = index === 1 ? okaySkills.includes(skill) : okaySkills3.includes(skill);
    const isBad = index === 1 ? badSkills.includes(skill) : badSkills3.includes(skill);
    const isWorst = index === 1 ? worstSkills.includes(skill) : worstSkills3.includes(skill);
    if (isBest) points += SKILL_POINTS.BEST;
    else if (isGood) points += SKILL_POINTS.GOOD;
    else if (isOkay) points += SKILL_POINTS.OKAY;
    else if (isBad) points += SKILL_POINTS.BAD;
    else if (isWorst) points += SKILL_POINTS.WORST;
  });
  return points;
};

export const getLetterGrade = (points: number): LetterGrade => {
  if (points >= GRADE_THRESHOLDS.S) return LetterGrade.S;
  if (points >= GRADE_THRESHOLDS.A) return LetterGrade.A;
  if (points >= GRADE_THRESHOLDS.B) return LetterGrade.B;
  if (points >= GRADE_THRESHOLDS.C) return LetterGrade.C;
  return LetterGrade.F;
};

const SR_GRADE_THRESHOLDS = { S: 14, A: 10, B: 5, C: 0 } as const;

export const getSrLetterGrade = (points: number): string => {
  if (points >= SR_GRADE_THRESHOLDS.S) return "S";
  if (points >= SR_GRADE_THRESHOLDS.A) return "A";
  if (points >= SR_GRADE_THRESHOLDS.B) return "B";
  if (points >= SR_GRADE_THRESHOLDS.C) return "C";
  return "F";
};
