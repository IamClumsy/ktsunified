"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { categorizeSkills } from "./utils/skillCategorization";
import { getSkillClass, getRankingClass } from "./utils/skillStyling";
import { getSrLetterGrade } from "./utils/artistCalculations";

interface Artist {
  id: number;
  name: string;
  group: string;
  genre: string;
  position: string;
  rank: string;
  skills: string[];
  build: string;
  photos: string;
}

interface CsvRow {
  Name: string;
  Group: string;
  Rank: string;
  Position: string;
  Genre: string;
  "Skill 1": string;
  "Skill 2": string;
  "Skill 3": string;
  "Micks Thoughts are they Good": string;
  "Skill Build Worthy"?: string;
}

function parseCSV(csvText: string): CsvRow[] {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += char; }
    }
    values.push(current.trim());
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ""; });
      rows.push(row as unknown as CsvRow);
    }
  }
  return rows;
}

function processArtists(records: CsvRow[], startId: number): Artist[] {
  return records.map((row, index) => {
    const skills = [row["Skill 1"], row["Skill 2"], row["Skill 3"]].filter(Boolean);
    const buildWorthy = row["Skill Build Worthy"] === "Yes";
    const hasGoldBrick = skills.some((s) => s.toLowerCase().includes("gold brick"));
    const build = hasGoldBrick ? "Gold Gathering" : buildWorthy ? "Skill Build" : "";
    return {
      id: startId + index,
      name: row.Name,
      group: row.Group === "No Group" ? "None" : row.Group,
      rank: row.Rank,
      position: row.Position,
      genre: row.Genre,
      skills,
      build,
      photos: "Universal",
    };
  });
}

const GRADE_GLOW: Record<string, string> = {
  S: "border-yellow-400/70 shadow-[0_0_16px_4px_rgba(250,204,21,0.35)]",
  A: "border-emerald-400/70 shadow-[0_0_16px_4px_rgba(52,211,153,0.35)]",
  B: "border-sky-400/70 shadow-[0_0_16px_4px_rgba(56,189,248,0.30)]",
  C: "border-slate-400/50 shadow-[0_0_10px_2px_rgba(148,163,184,0.20)]",
  F: "border-red-500/50 shadow-[0_0_10px_2px_rgba(239,68,68,0.20)]",
};

const GRADE_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, F: 4 };

const PHOTO_CLASS: Record<string, string> = {
  Universal:      "bg-teal-900/60 text-teal-300 border border-teal-500/40",
  "Own Photos":   "bg-pink-900/60 text-pink-300 border border-pink-500/40",
  Tokyo4:         "bg-violet-900/60 text-violet-300 border border-violet-500/40",
  Rome3:          "bg-amber-900/60 text-amber-300 border border-amber-500/40",
  Bali3:          "bg-emerald-900/60 text-emerald-300 border border-emerald-500/40",
  Bali4:          "bg-emerald-900/60 text-emerald-200 border border-emerald-400/40",
  "Not Released": "bg-red-900/60 text-red-400 border border-red-500/40",
};

const LEGEND = [
  { cls: "damage-to-player", color: "Gold", desc: "Best Skills (Damage to Player, 60%+ Attack Damage)" },
  { cls: "skill-good", color: "Green", desc: "Good Skills (50% BA Damage, Skill Damage variants)" },
  { cls: "blue-text", color: "Blue", desc: "Damage Reduction Skills" },
  { cls: "violet-text", color: "Violet", desc: "Okay Skills (DPS Defending, Fan Gain)" },
  { cls: "skill-specific-worst", color: "Red", desc: "Worst Skills (Drive Speed, World Building Guard)" },
  { cls: "gold-text", color: "Orange", desc: "Gold Gathering" },
  { cls: "skill-white", color: "White", desc: "Capacity Increase Skills" },
];

const selectClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/70";

type SortOption = "ranking" | "name" | "genre";

export function NewSrArtistTab() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState<SortOption>("ranking");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkill3, setSelectedSkill3] = useState("");
  const [selectedRanking, setSelectedRanking] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [srRes, rRes] = await Promise.all([
          fetch("/artists-SR-only-1.1.csv"),
          fetch("/artists-R-only-1.1.csv"),
        ]);
        const srArtists = processArtists(parseCSV(await srRes.text()), 1);
        const rArtists = processArtists(parseCSV(await rRes.text()), srArtists.length + 1);
        setArtists([...srArtists, ...rArtists]);
      } catch (err) {
        console.error("Error loading SR/R artists", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const roles = useMemo(() => [...new Set(artists.map((a) => a.position))].sort(), [artists]);
  const genres = useMemo(() => [...new Set(artists.map((a) => a.genre))].sort(), [artists]);
  const groups = useMemo(() => [...new Set(artists.map((a) => a.group))].filter((g) => g !== "None").sort(), [artists]);
  const ranks = useMemo(() => [...new Set(artists.map((a) => a.rank))], [artists]);

  const allSkills2 = useMemo(() => [...new Set(artists.map((a) => a.skills[1]).filter(Boolean))], [artists]);
  const allSkills3 = useMemo(() => [...new Set(artists.map((a) => a.skills[2]).filter(Boolean))], [artists]);
  const skill2Categories = useMemo(() => categorizeSkills(allSkills2), [allSkills2]);
  const skill3Categories = useMemo(() => categorizeSkills(allSkills3), [allSkills3]);

  const calculatePoints = useMemo(() => (artist: Artist) => {
    let points = 0;
    artist.skills.forEach((skill, index) => {
      if (!skill || index === 0) return;
      const cats = index === 1 ? skill2Categories : skill3Categories;
      if (cats.bestSkills.includes(skill)) points += 10;
      else if (cats.goodSkills.includes(skill)) points += 6;
      else if (cats.okaySkills.includes(skill)) points += 3;
      else if (cats.worstSkills.includes(skill)) points -= 1;
    });
    return points;
  }, [skill2Categories, skill3Categories]);

  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const grade = getSrLetterGrade(calculatePoints(a));
      return (
        (searchTerm === "" || a.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRank === "" || a.rank === selectedRank) &&
        (selectedRole === "" || a.position === selectedRole) &&
        (selectedGenre === "" || a.genre === selectedGenre) &&
        (selectedGroup === "" || a.group === selectedGroup) &&
        (selectedSkill === "" || a.skills[1] === selectedSkill) &&
        (selectedSkill3 === "" || a.skills[2] === selectedSkill3) &&
        (selectedRanking === "" || grade === selectedRanking)
      );
    });
  }, [artists, searchTerm, selectedRank, selectedRole, selectedGenre, selectedGroup, selectedSkill, selectedSkill3, selectedRanking, calculatePoints]);

  const sortedArtists = useMemo(() => {
    const arr = [...filteredArtists];
    if (sortBy === "name") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "genre") {
      arr.sort((a, b) => {
        const gc = a.genre.localeCompare(b.genre);
        return gc !== 0 ? gc : a.name.localeCompare(b.name);
      });
    } else {
      arr.sort((a, b) => {
        const pa = calculatePoints(a);
        const pb = calculatePoints(b);
        const gradeDiff =
          (GRADE_ORDER[getSrLetterGrade(pa)] ?? 5) -
          (GRADE_ORDER[getSrLetterGrade(pb)] ?? 5);
        if (gradeDiff !== 0) return gradeDiff;
        if (pb !== pa) return pb - pa;
        return a.name.localeCompare(b.name);
      });
    }
    return arr;
  }, [filteredArtists, sortBy, calculatePoints]);

  const gradeCounts = useMemo(() => {
    const counts = { S: 0, A: 0, B: 0, C: 0, F: 0 };
    sortedArtists.forEach((a) => {
      const g = getSrLetterGrade(calculatePoints(a)) as keyof typeof counts;
      counts[g] = (counts[g] ?? 0) + 1;
    });
    return counts;
  }, [sortedArtists, calculatePoints]);

  const activeFilterCount = [searchTerm, selectedRank, selectedRole, selectedGenre, selectedGroup, selectedSkill, selectedSkill3, selectedRanking].filter(Boolean).length;

  function clearFilters() {
    setSearchTerm(""); setSelectedRank(""); setSelectedRole("");
    setSelectedGenre(""); setSelectedGroup(""); setSelectedSkill("");
    setSelectedSkill3(""); setSelectedRanking("");
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><p className="text-slate-400">Loading SR/R artists…</p></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">SR &amp; R Artists</p>
        <h1 className="mt-2 text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent">
          SR and S Artist Helper
        </h1>
        <p className="mt-1 text-sm text-slate-400">{sortedArtists.length} artists</p>
      </header>

      {/* Sticky controls */}
      <div className="sticky top-24 z-40 -mx-4 px-4 pb-3 pt-2 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/40 mb-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => startTransition(() => setFiltersOpen((o) => !o))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-300 hover:border-purple-500/50 hover:text-white transition-colors"
          >
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
            <span className="text-slate-500 text-xs">{filtersOpen ? "▲" : "▼"}</span>
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900 text-sm text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
            >
              Clear all
            </button>
          )}
          {/* Sort */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 overflow-hidden">
            {(["ranking", "name", "genre"] as SortOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-3 py-2.5 text-sm capitalize transition-colors ${
                  sortBy === opt
                    ? "bg-purple-600 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt === "ranking" ? "Ranking" : opt === "name" ? "Name" : "Genre"}
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="mt-3 p-4 rounded-xl border border-slate-700 bg-slate-900/60 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Artist</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name…"
                className={selectClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Genre</label>
              <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className={selectClass}>
                <option value="">All Genres</option>
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Role</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className={selectClass}>
                <option value="">All Roles</option>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Group</label>
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className={selectClass}>
                <option value="">All Groups</option>
                {groups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Rank</label>
              <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className={selectClass}>
                <option value="">SR &amp; R</option>
                {ranks.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Skill 2</label>
              <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className={selectClass}>
                <option value="">All Skills</option>
                <optgroup label="Best">{skill2Categories.bestSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="Good">{skill2Categories.goodSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="Okay">{skill2Categories.okaySkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="Bad">{skill2Categories.badSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="Worst">{skill2Categories.worstSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Skill 3</label>
              <select value={selectedSkill3} onChange={(e) => setSelectedSkill3(e.target.value)} className={selectClass}>
                <option value="">All Skills</option>
                <optgroup label="Best">{skill3Categories.bestSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="Good">{skill3Categories.goodSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="Okay">{skill3Categories.okaySkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="Bad">{skill3Categories.badSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="Worst">{skill3Categories.worstSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-slate-400">Ranking</label>
              <select value={selectedRanking} onChange={(e) => setSelectedRanking(e.target.value)} className={selectClass}>
                <option value="">All Rankings</option>
                {["S", "A", "B", "C", "F"].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grade tally */}
      <div className="flex items-center justify-center gap-3 text-xs mb-4 mt-1">
        {(["S", "A", "B", "C", "F"] as const).map((g) => {
          const colorClass = g === "S" ? "ranking-a" : g === "A" ? "ranking-b" : g === "B" ? "ranking-c" : g === "C" ? "ranking-d" : "ranking-f";
          const isActive = selectedRanking === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedRanking(isActive ? "" : g)}
              className={`font-bold px-2 py-0.5 rounded-full transition-colors ${colorClass} ${
                isActive ? "bg-slate-700 ring-1 ring-current" : "hover:bg-slate-800"
              }`}
            >
              {g}: {gradeCounts[g]}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {sortedArtists.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No artists match the current filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedArtists.map((artist) => {
            const points = calculatePoints(artist);
            const grade = getSrLetterGrade(points);
            return (
              <div
                key={artist.id}
                className={`rounded-xl border bg-gradient-to-br from-purple-900/60 via-violet-900/40 to-slate-900/80 p-3 flex flex-col gap-2 transition-all duration-150 hover:scale-[1.02] hover:brightness-110 ${GRADE_GLOW[grade] ?? GRADE_GLOW.F}`}
              >
                {/* Name + grade + rank badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white text-sm truncate">{artist.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold ${artist.rank === "SR" ? "bg-purple-700/60 text-purple-200" : "bg-slate-700/60 text-slate-300"}`}>
                      {artist.rank}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 ${getRankingClass(grade)}`}>
                      {grade}
                    </span>
                  </div>
                </div>

                {/* Genre · Role · Group */}
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                  <span className="text-pink-300">{artist.genre}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-purple-300">{artist.position}</span>
                  {artist.group && artist.group !== "None" && (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-fuchsia-300 truncate">{artist.group}</span>
                    </>
                  )}
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-1">
                  {artist.skills[1] && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getSkillClass(artist.skills[1])}`}>
                      {artist.skills[1]}
                    </span>
                  )}
                  {artist.skills[2] && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getSkillClass(artist.skills[2])}`}>
                      {artist.skills[2]}
                    </span>
                  )}
                </div>

                {/* Build · Photos */}
                <div className="grid grid-cols-2 gap-1 mt-auto pt-1">
                  <div>
                    {artist.build && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white">
                        {artist.build}
                      </span>
                    )}
                  </div>
                  <div>
                    {artist.photos && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PHOTO_CLASS[artist.photos] ?? "bg-slate-700 text-slate-300"}`}>
                        {artist.photos}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-10 px-6 py-4 rounded-2xl border border-purple-400/30 bg-slate-900/60 shadow-[0_0_20px_rgba(147,51,234,0.2)]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-3 text-center">Skill Colour Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LEGEND.map(({ cls, color, desc }) => (
            <div key={color} className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 shrink-0 ${cls}`}>
                {color}
              </span>
              <span className="text-slate-300 text-xs">{desc}</span>
            </div>
          ))}
        </div>

        {/* Ranking explanation */}
        <div className="mt-5 pt-4 border-t border-slate-700/60">
          <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-2 text-center">How Rankings Work</h4>
          <p className="text-slate-400 text-xs text-center mb-3">
            Skill 2 and Skill 3 are each scored, then added together.
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mb-3">
            <span className="damage-to-player bg-gradient-to-r from-slate-600 to-slate-700 px-2 py-0.5 rounded-full">Best: 10 pts</span>
            <span className="basic-attack-50 bg-gradient-to-r from-slate-700 to-slate-800 px-2 py-0.5 rounded-full">Good: 6 pts</span>
            <span className="text-slate-300 bg-slate-700 px-2 py-0.5 rounded-full">Okay: 3 pts</span>
            <span className="text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">Bad: 0 pts</span>
            <span className="skill-specific-worst bg-gradient-to-r from-slate-600 to-slate-700 px-2 py-0.5 rounded-full">Worst: −1 pt</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            <span><span className="ranking-a font-bold">S</span> <span className="text-slate-400">≥ 14 pts</span></span>
            <span><span className="ranking-b font-bold">A</span> <span className="text-slate-400">≥ 10 pts</span></span>
            <span><span className="ranking-c font-bold">B</span> <span className="text-slate-400">≥ 5 pts</span></span>
            <span><span className="ranking-d font-bold">C</span> <span className="text-slate-400">≥ 0 pts</span></span>
            <span><span className="ranking-f font-bold">F</span> <span className="text-slate-400">&lt; 0 pts</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
