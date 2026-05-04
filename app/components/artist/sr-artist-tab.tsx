"use client";

import { useState, useEffect, useMemo } from "react";
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
  thoughts?: string;
  build?: string;
  photos?: string;
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
    const line = lines[i];
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += char; }
    }
    values.push(current.trim());
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => { row[header] = values[index] || ""; });
      rows.push(row as unknown as CsvRow);
    }
  }
  return rows;
}

function processArtists(records: CsvRow[], startId: number): Artist[] {
  return records.map((row, index) => {
    const skills = [row["Skill 1"], row["Skill 2"], row["Skill 3"]].filter(Boolean);
    const buildWorthy = row["Skill Build Worthy"] === "Yes";
    const hasGoldBrick = skills.some((s) => s && s.toLowerCase().includes("gold brick"));
    const build = hasGoldBrick ? "Gold Gathering" : buildWorthy ? "Skill Build" : "";
    return {
      id: startId + index,
      name: row.Name,
      group: row.Group === "No Group" ? "None" : row.Group,
      rank: row.Rank,
      position: row.Position,
      genre: row.Genre,
      skills,
      thoughts: row["Micks Thoughts are they Good"] || "",
      build,
      photos: "Universal",
    };
  });
}

const selectClass = "w-full px-1.5 py-1 rounded-md bg-violet-900/60 border border-fuchsia-400/50 text-white text-xs focus:outline-none focus:ring-2 focus:ring-pink-400/70 cursor-pointer hover:border-pink-300/70 hover:bg-violet-800/60 transition-colors not-italic";

export function SrArtistTab() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedRank, setSelectedRank] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedSkill3, setSelectedSkill3] = useState("");
  const [selectedBuild, setSelectedBuild] = useState("");
  const [selectedRanking, setSelectedRanking] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [srRes, rRes] = await Promise.all([
          fetch("/artists-SR-only-1.1.csv"),
          fetch("/artists-R-only-1.1.csv"),
        ]);
        const srText = await srRes.text();
        const rText = await rRes.text();
        const srArtists = processArtists(parseCSV(srText), 1);
        const rArtists = processArtists(parseCSV(rText), srArtists.length + 1);
        setArtists([...srArtists, ...rArtists]);
      } catch (err) {
        console.error("Error loading SR/R artists", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groupOptions = useMemo(() => [...new Set(artists.map((a) => a.group))].sort((a, b) => a.localeCompare(b)), [artists]);
  const rankOptions = useMemo(() => [...new Set(artists.map((a) => a.rank))], [artists]);
  const roles = useMemo(() => [...new Set(artists.map((a) => a.position))], [artists]);
  const genres = useMemo(() => [...new Set(artists.map((a) => a.genre))], [artists]);
  const buildOptions = useMemo(() => [...new Set(artists.map((a) => a.build).filter(Boolean))] as string[], [artists]);
  const artistNames = useMemo(() => [...new Set(artists.map((a) => a.name))].sort(), [artists]);

  const allSkills2 = useMemo(() => [...new Set(artists.map((a) => a.skills[1]).filter(Boolean))], [artists]);
  const allSkills3 = useMemo(() => [...new Set(artists.map((a) => a.skills[2]).filter(Boolean))], [artists]);

  const skill2Categories = useMemo(() => categorizeSkills(allSkills2), [allSkills2]);
  const skill3Categories = useMemo(() => categorizeSkills(allSkills3), [allSkills3]);

  const calculatePoints = (artist: Artist) => {
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
  };

  const filteredArtists = useMemo(() => {
    return artists
      .filter((artist) => {
        const grade = getSrLetterGrade(calculatePoints(artist));
        return (
          (searchTerm === "" || artist.name === searchTerm) &&
          (selectedGroup === "" || artist.group === selectedGroup) &&
          (selectedRank === "" || artist.rank === selectedRank) &&
          (selectedRole === "" || artist.position === selectedRole) &&
          (selectedGenre === "" || artist.genre === selectedGenre) &&
          (selectedSkill === "" || artist.skills[1] === selectedSkill) &&
          (selectedSkill3 === "" || artist.skills[2] === selectedSkill3) &&
          (selectedBuild === "" || (artist.build && artist.build.toLowerCase().includes(selectedBuild.toLowerCase()))) &&
          (selectedRanking === "" || grade === selectedRanking)
        );
      })
      .sort((a, b) => {
        const aIsR = a.rank === "R";
        const bIsR = b.rank === "R";
        if (aIsR !== bIsR) return aIsR ? 1 : -1;
        const gc = a.genre.localeCompare(b.genre, undefined, { sensitivity: "base" });
        if (gc !== 0) return gc;
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
  }, [artists, searchTerm, selectedGroup, selectedRank, selectedRole, selectedGenre, selectedSkill, selectedSkill3, selectedBuild, selectedRanking, skill2Categories, skill3Categories]);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><p className="text-slate-400">Loading SR/R artists…</p></div>;
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="w-full flex flex-col items-center py-8 gap-8 px-4">
        <header className="flex flex-col items-center gap-4 app-header hero-banner">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-[0_0_25px_rgba(236,72,153,0.6)] tracking-tight text-center bg-gradient-to-r from-pink-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent hero-title">
            Mick&apos;s Awesome Non-SSR Artist Helper
          </h1>
          <p className="text-slate-400 text-sm">SR &amp; R rank artists</p>
        </header>

        <main className="w-fit flex flex-col items-center bg-gradient-to-br from-violet-800/80 via-fuchsia-800/80 to-pink-700/80 rounded-2xl text-white shadow-[0_0_60px_rgba(219,39,119,0.6)] border-2 border-fuchsia-500/50 backdrop-blur-xl transition-all duration-300 mx-auto table-card">
          <div className="overflow-x-auto w-full px-2 py-4 table-wrapper">
            <table className="table-fixed table-force-white table-with-spacing italic" role="table" aria-label="SR/R Artists table">
              <thead className="bg-transparent backdrop-blur-lg sticky top-0 z-10 shadow-xl">
                {/* Filter row */}
                <tr className="align-middle filter-toolbar">
                  <th className="px-1 py-2">
                    <select value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={selectClass} aria-label="Filter by name">
                      <option value="">Select Artist</option>
                      {artistNames.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </th>
                  <th className="px-1 py-2">
                    <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className={selectClass} aria-label="Filter by genre">
                      <option value="">Genre</option>
                      {genres.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </th>
                  <th className="px-1 py-2">
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className={selectClass} aria-label="Filter by role">
                      <option value="">Role</option>
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </th>
                  <th className="px-1 py-2">
                    <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className={selectClass} aria-label="Filter by group">
                      <option value="">Group</option>
                      {groupOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </th>
                  <th className="px-1 py-2">
                    <select value={selectedRank} onChange={(e) => setSelectedRank(e.target.value)} className={selectClass} aria-label="Filter by rank">
                      <option value="">Rank</option>
                      {rankOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </th>
                  <th className="px-1 py-2">
                    <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className={selectClass} aria-label="Filter by skill 2">
                      <option value="">Skill 2</option>
                      <optgroup label="Best">{skill2Categories.bestSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                      <optgroup label="Good">{skill2Categories.goodSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                      <optgroup label="Okay">{skill2Categories.okaySkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                      <optgroup label="Bad">{skill2Categories.badSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                      <optgroup label="Worst">{skill2Categories.worstSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                    </select>
                  </th>
                  <th className="px-1 py-2">
                    <select value={selectedSkill3} onChange={(e) => setSelectedSkill3(e.target.value)} className={selectClass} aria-label="Filter by skill 3">
                      <option value="">Skill 3</option>
                      <optgroup label="Best">{skill3Categories.bestSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                      <optgroup label="Good">{skill3Categories.goodSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                      <optgroup label="Okay">{skill3Categories.okaySkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                      <optgroup label="Bad">{skill3Categories.badSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                      <optgroup label="Worst">{skill3Categories.worstSkills.map((s) => <option key={s} value={s}>{s}</option>)}</optgroup>
                    </select>
                  </th>
                  <th className="px-1 py-2">
                    <select value={selectedRanking} onChange={(e) => setSelectedRanking(e.target.value)} className={selectClass} aria-label="Filter by ranking">
                      <option value="">Ranking</option>
                      {["S", "A", "B", "C", "F"].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </th>
                  <th className="px-1 py-2">
                    <select value={selectedBuild} onChange={(e) => setSelectedBuild(e.target.value)} className={selectClass} aria-label="Filter by build">
                      <option value="">Build</option>
                      {buildOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </th>
                </tr>
                {/* Header row */}
                <tr>
                  {["Artist", "Genre", "Role", "Group", "Rank", "Skill 2", "Skill 3", "Ranking", "Build"].map((col) => (
                    <th key={col} className="px-1 py-2 text-center text-sm font-semibold text-pink-100 uppercase tracking-wider" scope="col">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800/80">
                {filteredArtists.map((artist) => {
                  const points = calculatePoints(artist);
                  const grade = getSrLetterGrade(points);
                  return (
                    <tr key={artist.id} className="artist-row hover:bg-amber-400/10 transition-colors duration-200" role="row">
                      <td className="px-1 py-2 whitespace-nowrap"><div className="text-sm font-medium text-white">{artist.name}</div></td>
                      <td className="px-1 py-2 whitespace-nowrap"><div className="text-sm text-amber-100">{artist.genre}</div></td>
                      <td className="px-1 py-2 whitespace-nowrap"><div className="text-sm text-white text-center">{artist.position}</div></td>
                      <td className="px-1 py-2 whitespace-nowrap"><div className="text-sm font-medium text-white text-center">{artist.group}</div></td>
                      <td className="px-1 py-2 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${artist.rank === "SR" ? "bg-purple-700/60 text-purple-200" : "bg-slate-700/60 text-slate-300"}`}>{artist.rank}</span>
                      </td>
                      <td className="px-1 py-2">
                        <div className="flex justify-center">
                          {artist.skills[1] ? (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs shadow-sm ${getSkillClass(artist.skills[1])}`}>{artist.skills[1]}</span>
                          ) : <span className="text-white/50 text-xs">-</span>}
                        </div>
                      </td>
                      <td className="px-1 py-2">
                        <div className="flex justify-center">
                          {artist.skills[2] ? (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs shadow-sm ${getSkillClass(artist.skills[2])}`}>{artist.skills[2]}</span>
                          ) : <span className="text-white/50 text-xs">-</span>}
                        </div>
                      </td>
                      <td className="px-1 py-2 whitespace-nowrap">
                        <div className="text-sm font-bold text-center" title={`Points: ${points}`}>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 ${getRankingClass(grade)}`}>{grade}</span>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-sm">
                          {artist.build || "N/A"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-8 mb-4 px-6 py-4 backdrop-blur-sm rounded-2xl border-2 border-fuchsia-400/40 shadow-[0_0_30px_rgba(192,38,211,0.4)] relative z-10 legend-panel">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Skill Color Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 place-items-center">
              {[
                { cls: "damage-to-player", color: "Gold", desc: "Best Skills (Damage to Player, 60% Attack Damage)" },
                { cls: "skill-good", color: "Green", desc: "Good Skills (50% BA Damage, Skill Damage variants)" },
                { cls: "blue-text", color: "Blue", desc: "Damage Reduction Skills" },
                { cls: "violet-text", color: "Violet", desc: "Okay Skills" },
                { cls: "skill-specific-worst", color: "Red", desc: "Worst Skills (Drive Speed, World Building Guard, etc.)" },
                { cls: "gold-text", color: "Orange", desc: "Gold Gathering / Fan Capacity" },
              ].map(({ cls, color, desc }) => (
                <div key={color} className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-slate-600 to-slate-700 ${cls}`}>{color}</span>
                  <span className="text-white text-sm legend-white">{desc}</span>
                </div>
              ))}
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
