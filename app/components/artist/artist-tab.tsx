"use client";

import { useState, useEffect, useMemo } from "react";
import artistsDataRaw from "@/src/data/artists.json";
import { Artist } from "./types";
import { categorizeSkills } from "./utils/skillCategorization";
import { useArtistFilters } from "./hooks/useArtistFilters";
import { FilterRow } from "./filter-row";
import { TableHeader } from "./table-header";
import { ArtistRow } from "./artist-row";

const artistsData = artistsDataRaw as Artist[];


export function ArtistTab() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkill3, setSelectedSkill3] = useState("");
  const [selectedBuild, setSelectedBuild] = useState("");
  const [selectedRanking, setSelectedRanking] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState("");

  useEffect(() => {
    setArtists(artistsData);
    try {
      localStorage.setItem("apexArtists", JSON.stringify(artistsData));
    } catch {}
  }, []);

  const groupOptions = useMemo(
    () => [...new Set(artists.map((a) => a.group))].sort((a, b) => a.localeCompare(b)),
    [artists]
  );
  const roles = useMemo(() => [...new Set(artists.map((a) => a.position))], [artists]);
  const genres = useMemo(() => [...new Set(artists.map((a) => a.genre))], [artists]);
  const allSkills = useMemo(
    () => [...new Set(artists.map((a) => a.skills[1]).filter(Boolean))],
    [artists]
  );
  const allSkills3 = useMemo(
    () => [...new Set(artists.map((a) => a.skills[2]).filter(Boolean))],
    [artists]
  );

  const skill2Categories = useMemo(() => categorizeSkills(allSkills), [allSkills]);
  const skill3Categories = useMemo(() => categorizeSkills(allSkills3), [allSkills3]);

  const buildOptions = useMemo(
    () => [...new Set(artists.map((a) => a.build).filter(Boolean))] as string[],
    [artists]
  );
  const photosOptions = useMemo(
    () => [...new Set(artists.map((a) => a.photos).filter(Boolean))] as string[],
    [artists]
  );

  const skillArrays = useMemo(
    () => ({
      bestSkills: skill2Categories.bestSkills,
      goodSkills: skill2Categories.goodSkills,
      okaySkills: skill2Categories.okaySkills,
      badSkills: skill2Categories.badSkills,
      worstSkills: skill2Categories.worstSkills,
      bestSkills3: skill3Categories.bestSkills,
      goodSkills3: skill3Categories.goodSkills,
      okaySkills3: skill3Categories.okaySkills,
      badSkills3: skill3Categories.badSkills,
      worstSkills3: skill3Categories.worstSkills,
    }),
    [skill2Categories, skill3Categories]
  );

  const { filteredArtists, calculatePoints } = useArtistFilters({
    artists,
    filters: {
      searchTerm,
      selectedGroup,
      selectedRole,
      selectedGenre,
      selectedSkill,
      selectedSkill3,
      selectedBuild,
      selectedRanking,
      selectedPhotos,
    },
    skillArrays,
  });

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="w-full flex flex-col items-center py-8 gap-8 px-4">
        <header className="relative flex flex-col items-center gap-4 app-header hero-banner">
          <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-5xl">
            <h1
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-pink-200 via-purple-200 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.7)] hero-title"
            >
              SSR Helper
            </h1>
          </div>
        </header>

        <main className="w-fit flex flex-col items-center bg-gradient-to-br from-violet-800/80 via-fuchsia-800/80 to-pink-700/80 rounded-2xl text-white shadow-[0_0_60px_rgba(219,39,119,0.6)] border-2 border-fuchsia-500/50 backdrop-blur-xl transition-all duration-300 mx-auto table-card">
          <div className="overflow-x-auto w-full px-2 py-4 table-wrapper">
            <table
              className="table-fixed table-force-white table-with-spacing italic"
              role="table"
              aria-label="SSR Artists table with filters"
            >
              <thead className="bg-transparent backdrop-blur-lg sticky top-0 z-10 shadow-xl">
                <FilterRow
                  artists={artists}
                  searchTerm={searchTerm}
                  selectedGenre={selectedGenre}
                  selectedRole={selectedRole}
                  selectedGroup={selectedGroup}
                  selectedSkill={selectedSkill}
                  selectedSkill3={selectedSkill3}
                  selectedRanking={selectedRanking}
                  selectedPhotos={selectedPhotos}
                  selectedBuild={selectedBuild}
                  genres={genres}
                  roles={roles}
                  groupOptions={groupOptions}
                  bestSkills={skill2Categories.bestSkills}
                  goodSkills={skill2Categories.goodSkills}
                  okaySkills={skill2Categories.okaySkills}
                  badSkills={skill2Categories.badSkills}
                  worstSkills={skill2Categories.worstSkills}
                  bestSkills3={skill3Categories.bestSkills}
                  goodSkills3={skill3Categories.goodSkills}
                  okaySkills3={skill3Categories.okaySkills}
                  badSkills3={skill3Categories.badSkills}
                  worstSkills3={skill3Categories.worstSkills}
                  buildOptions={buildOptions}
                  photosOptions={photosOptions}
                  onSearchChange={setSearchTerm}
                  onGenreChange={setSelectedGenre}
                  onRoleChange={setSelectedRole}
                  onGroupChange={setSelectedGroup}
                  onSkillChange={setSelectedSkill}
                  onSkill3Change={setSelectedSkill3}
                  onRankingChange={setSelectedRanking}
                  onPhotosChange={setSelectedPhotos}
                  onBuildChange={setSelectedBuild}
                />
                <TableHeader />
              </thead>
              <tbody className="bg-gray-800/80">
                {filteredArtists.map((artist) => (
                  <ArtistRow
                    key={artist.id}
                    artist={artist}
                    calculatePoints={calculatePoints}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-8 mb-4 px-6 py-4 backdrop-blur-sm rounded-2xl border-2 border-fuchsia-400/40 shadow-[0_0_30px_rgba(192,38,211,0.4)] relative z-10 legend-panel">
            <h3 className="text-xl font-bold text-white mb-4 text-center drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
              Skill Color Legend
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 place-items-center">
              {[
                { cls: "damage-to-player", color: "Gold", desc: "Best Skills (Damage to Player, 60% Basic Attack Damage)" },
                { cls: "skill-good", color: "Green", desc: "Good Skills (50% BA Damage, Skill Damage variants)" },
                { cls: "blue-text", color: "Blue", desc: "Basic Attack and Skill Damage Reduction" },
                { cls: "violet-text", color: "Violet", desc: "Okay Skills" },
                { cls: "skill-specific-worst", color: "Red", desc: "Worst Skills (DPS variants, Drive Speed, etc.)" },
                { cls: "gold-text", color: "Orange", desc: "Gold Gathering Skill" },
              ].map(({ cls, color, desc }) => (
                <div key={color} className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 ${cls}`}>
                    {color}
                  </span>
                  <span className="text-white text-sm legend-white">{desc}</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                  White
                </span>
                <span className="text-white text-sm font-bold">Capacity Increase Skills</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-8 py-4 w-full flex justify-center items-center text-sm relative z-10">
          <p className="text-white font-medium">© {new Date().getFullYear()} Mick</p>
        </footer>
      </div>
    </div>
  );
}
