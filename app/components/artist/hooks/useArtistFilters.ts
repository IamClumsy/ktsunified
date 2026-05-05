import { useMemo, useCallback } from "react";
import { Artist, LetterGrade } from "../types";
import { calculateArtistPoints, getLetterGrade } from "../utils/artistCalculations";

interface FilterState {
  searchTerm: string;
  selectedGroup: string;
  selectedRole: string;
  selectedGenre: string;
  selectedSkill: string;
  selectedSkill3: string;
  selectedBuild: string;
  selectedRanking: string;
  selectedPhotos: string;
}

interface SkillArrays {
  bestSkills: string[];
  goodSkills: string[];
  okaySkills: string[];
  badSkills: string[];
  worstSkills: string[];
  bestSkills3: string[];
  goodSkills3: string[];
  okaySkills3: string[];
  badSkills3: string[];
  worstSkills3: string[];
}

export const useArtistFilters = ({
  artists,
  filters,
  skillArrays,
}: {
  artists: Artist[];
  filters: FilterState;
  skillArrays: SkillArrays;
}) => {
  const calculatePoints = useCallback(
    (artist: Artist) =>
      calculateArtistPoints(
        artist,
        skillArrays.bestSkills,
        skillArrays.goodSkills,
        skillArrays.okaySkills,
        skillArrays.badSkills,
        skillArrays.worstSkills,
        skillArrays.bestSkills3,
        skillArrays.goodSkills3,
        skillArrays.okaySkills3,
        skillArrays.badSkills3,
        skillArrays.worstSkills3
      ),
    [skillArrays]
  );

  const filteredArtists = useMemo(() => {
    return artists
      .filter((artist) => {
        const matchesSearch = filters.searchTerm === "" || artist.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesGroup = filters.selectedGroup === "" || artist.group === filters.selectedGroup;
        const matchesRole = filters.selectedRole === "" || artist.position === filters.selectedRole;
        const matchesGenre = filters.selectedGenre === "" || artist.genre === filters.selectedGenre;
        const matchesSkill = filters.selectedSkill === "" || artist.skills[1] === filters.selectedSkill;
        const matchesSkill3 = filters.selectedSkill3 === "" || artist.skills[2] === filters.selectedSkill3;
        const matchesBuild =
          filters.selectedBuild === "" ||
          (artist.build && artist.build.toLowerCase().includes(filters.selectedBuild.toLowerCase()));
        const matchesRanking =
          filters.selectedRanking === "" ||
          getLetterGrade(calculatePoints(artist)) === (filters.selectedRanking as LetterGrade);
        const matchesPhotos = filters.selectedPhotos === "" || artist.photos === filters.selectedPhotos;
        return (
          matchesSearch &&
          matchesGroup &&
          matchesRole &&
          matchesGenre &&
          matchesSkill &&
          matchesSkill3 &&
          matchesBuild &&
          matchesRanking &&
          matchesPhotos
        );
      })
      .sort((a, b) => {
        const genreCompare = a.genre.localeCompare(b.genre, undefined, { sensitivity: "base" });
        if (genreCompare !== 0) return genreCompare;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
  }, [artists, filters, calculatePoints]);

  return { filteredArtists, calculatePoints };
};
