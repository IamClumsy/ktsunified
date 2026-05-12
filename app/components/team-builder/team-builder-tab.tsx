"use client";

import { useState, useMemo } from "react";
import artistsDataRaw from "@/src/data/artists.json";
import { Artist } from "../artist/types";
import { categorizeSkills } from "../artist/utils/skillCategorization";
import { calculateArtistPoints, getLetterGrade } from "../artist/utils/artistCalculations";
import { getSkillClass, getRankingClass } from "../artist/utils/skillStyling";

const artistsData = artistsDataRaw as Artist[];

const allSkills2 = [...new Set(artistsData.map((a) => a.skills[1]).filter(Boolean))] as string[];
const allSkills3 = [...new Set(artistsData.map((a) => a.skills[2]).filter(Boolean))] as string[];
const sk2 = categorizeSkills(allSkills2);
const sk3 = categorizeSkills(allSkills3);

function calcPoints(artist: Artist): number {
  return calculateArtistPoints(
    artist,
    sk2.bestSkills, sk2.goodSkills, sk2.okaySkills, sk2.badSkills, sk2.worstSkills,
    sk3.bestSkills, sk3.goodSkills, sk3.okaySkills, sk3.badSkills, sk3.worstSkills,
  );
}

const GENRES = [...new Set(artistsData.map((a) => a.genre))].sort();

const GENRE_STYLE: Record<string, { inactive: string; active: string }> = {
  "Pop":        { inactive: "text-pink-400 border-slate-700 hover:border-pink-500/50",     active: "bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-500" },
  "Hip-Hop":    { inactive: "text-purple-400 border-slate-700 hover:border-purple-500/50", active: "bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-500" },
  "R&B":        { inactive: "text-amber-400 border-slate-700 hover:border-amber-500/50",   active: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500" },
  "Electronic": { inactive: "text-sky-400 border-slate-700 hover:border-sky-500/50",       active: "bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-500" },
  "Rock":       { inactive: "text-orange-400 border-slate-700 hover:border-orange-500/50", active: "bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-500" },
};

const GRADE_BADGE: Record<string, string> = {
  S: "bg-yellow-400/20 text-yellow-300 border-yellow-400/50",
  A: "bg-emerald-400/20 text-emerald-300 border-emerald-400/50",
  B: "bg-sky-400/20 text-sky-300 border-sky-400/50",
  C: "bg-slate-400/20 text-slate-300 border-slate-400/50",
  F: "bg-red-400/20 text-red-400 border-red-400/50",
};

const TIER_BADGE: Record<string, string> = {
  Best:  "bg-yellow-400/20 text-yellow-300 border-yellow-400/40",
  Good:  "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
  Okay:  "bg-sky-400/20 text-sky-300 border-sky-400/40",
  Bad:   "bg-slate-500/20 text-slate-400 border-slate-500/40",
  Worst: "bg-red-400/20 text-red-400 border-red-400/40",
};

const TIER_ORDER = ["Best", "Good", "Okay", "Bad", "Worst"];

const TEAM_SIZE = 5;

export function TeamBuilderTab() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [team, setTeam] = useState<(Artist | null)[]>(Array(TEAM_SIZE).fill(null));
  const [lastDelta, setLastDelta] = useState<number | null>(null);

  const genreArtists = useMemo(
    () => artistsData.filter((a) => a.genre === selectedGenre).sort((a, b) => calcPoints(b) - calcPoints(a)),
    [selectedGenre],
  );

  const bestTeam = useMemo(() => genreArtists.slice(0, TEAM_SIZE), [genreArtists]);
  const bestPossibleScore = useMemo(
    () => bestTeam.reduce((s, a) => s + calcPoints(a), 0),
    [bestTeam],
  );
  const bestAvgGrade = bestTeam.length >= TEAM_SIZE
    ? getLetterGrade(Math.round(bestPossibleScore / TEAM_SIZE))
    : null;

  const teamScore = useMemo(
    () => team.reduce((sum, a) => sum + (a ? calcPoints(a) : 0), 0),
    [team],
  );

  const filledCount = team.filter(Boolean).length;
  const avgScore = filledCount > 0 ? Math.round(teamScore / filledCount) : null;
  const avgGrade = avgScore !== null ? getLetterGrade(avgScore) : null;
  const scoreGap = filledCount === TEAM_SIZE ? bestPossibleScore - teamScore : null;

  const pickedIds = useMemo(
    () => new Set(team.filter(Boolean).map((a) => a!.id)),
    [team],
  );

  const skillComposition = useMemo(() => {
    const counts: Record<string, number> = { Best: 0, Good: 0, Okay: 0, Bad: 0, Worst: 0 };
    team.forEach((artist) => {
      if (!artist) return;
      const s2 = artist.skills[1];
      if (s2) {
        if (sk2.bestSkills.includes(s2)) counts.Best++;
        else if (sk2.goodSkills.includes(s2)) counts.Good++;
        else if (sk2.okaySkills.includes(s2)) counts.Okay++;
        else if (sk2.badSkills.includes(s2)) counts.Bad++;
        else if (sk2.worstSkills.includes(s2)) counts.Worst++;
      }
      const s3 = artist.skills[2];
      if (s3) {
        if (sk3.bestSkills.includes(s3)) counts.Best++;
        else if (sk3.goodSkills.includes(s3)) counts.Good++;
        else if (sk3.okaySkills.includes(s3)) counts.Okay++;
        else if (sk3.badSkills.includes(s3)) counts.Bad++;
        else if (sk3.worstSkills.includes(s3)) counts.Worst++;
      }
    });
    return counts;
  }, [team]);

  function setSlot(slotIdx: number, artistId: string) {
    const artist = artistId
      ? (genreArtists.find((a) => a.id === Number(artistId)) ?? null)
      : null;
    const newScore = team.reduce((sum, a, i) => {
      const effective = i === slotIdx ? artist : a;
      return sum + (effective ? calcPoints(effective) : 0);
    }, 0);
    setLastDelta(newScore - teamScore);
    setTeam((prev) => {
      const next = [...prev];
      next[slotIdx] = artist;
      return next;
    });
  }

  function loadRecommended() {
    const next: (Artist | null)[] = Array(TEAM_SIZE).fill(null);
    bestTeam.forEach((a, i) => { next[i] = a; });
    const newScore = next.reduce((s, a) => s + (a ? calcPoints(a) : 0), 0);
    setLastDelta(newScore - teamScore);
    setTeam(next);
  }

  function changeGenre(genre: string) {
    setSelectedGenre(genre);
    setTeam(Array(TEAM_SIZE).fill(null));
    setLastDelta(null);
  }

  function clearTeam() {
    setTeam(Array(TEAM_SIZE).fill(null));
    setLastDelta(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-10 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">SSR Artists</p>
        <h1 className="mt-4 text-2xl md:text-4xl font-bold text-white">Team Builder</h1>
        <p className="mt-2 text-slate-300">Pick a genre, fill 5 slots, and see your team score</p>
      </header>

      {/* Genre selector */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {GENRES.map((genre) => {
          const style = GENRE_STYLE[genre] ?? {
            inactive: "text-slate-400 border-slate-700 hover:border-slate-500",
            active: "bg-slate-700 text-white border-slate-500",
          };
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => changeGenre(genre)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                isActive ? style.active : `bg-slate-900/60 ${style.inactive}`
              }`}
            >
              {genre}
              <span className="ml-1.5 text-xs opacity-60">
                ({artistsData.filter((a) => a.genre === genre).length})
              </span>
            </button>
          );
        })}
      </div>

      {!selectedGenre ? (
        <div className="text-center py-24 text-slate-500">
          <p className="text-lg">Select a genre above to start building your team</p>
          <p className="mt-2 text-sm">All 5 artists must be from the same genre for the best bonuses</p>
        </div>
      ) : (
        <>
          {/* Recommended team panel */}
          {bestTeam.length >= TEAM_SIZE && (
            <div className="rounded-2xl border border-emerald-700/40 bg-gradient-to-b from-emerald-900/20 to-slate-900/60 p-5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Recommended Team</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Top 5 by score for {selectedGenre}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest">Score</p>
                      <p className="text-xl font-bold tabular-nums text-white">{bestPossibleScore}</p>
                    </div>
                    {bestAvgGrade && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Avg Grade</p>
                        <p className={`text-xl font-bold ${getRankingClass(bestAvgGrade)}`}>{bestAvgGrade}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={loadRecommended}
                    className="px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-600/60 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60 hover:border-emerald-500 transition-all duration-200 whitespace-nowrap"
                  >
                    Use This Team
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {bestTeam.map((a, i) => {
                  const pts = calcPoints(a);
                  const gr = getLetterGrade(pts);
                  return (
                    <div key={a.id} className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">#{i + 1}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_BADGE[gr]}`}>{gr}</span>
                      </div>
                      <span className="text-sm font-semibold text-white truncate">{a.name}</span>
                      <span className="text-xs text-slate-400">{a.position}</span>
                      <div className="flex flex-col gap-1 mt-1">
                        {a.skills[1] && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getSkillClass(a.skills[1])}`}>{a.skills[1]}</span>
                        )}
                        {a.skills[2] && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getSkillClass(a.skills[2])}`}>{a.skills[2]}</span>
                        )}
                      </div>
                      <div className="mt-auto pt-2 border-t border-slate-700/40 text-right">
                        <span className="text-xs font-bold tabular-nums text-emerald-300">{pts} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5 slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {team.map((artist, slotIdx) => {
              const points = artist ? calcPoints(artist) : null;
              const grade = points !== null ? getLetterGrade(points) : null;
              const available = genreArtists.filter(
                (a) => !pickedIds.has(a.id) || a.id === artist?.id,
              );

              return (
                <div
                  key={slotIdx}
                  className={`rounded-2xl border p-4 flex flex-col gap-3 transition-colors ${
                    artist
                      ? "bg-gradient-to-b from-slate-800/60 to-slate-900/80 border-slate-600"
                      : "bg-slate-900/40 border-slate-700 border-dashed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-slate-500">Slot {slotIdx + 1}</span>
                    {grade && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_BADGE[grade]}`}>{grade}</span>
                    )}
                  </div>

                  <select
                    value={artist?.id ?? ""}
                    onChange={(e) => setSlot(slotIdx, e.target.value)}
                    aria-label={`Artist for slot ${slotIdx + 1}`}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="">— Empty —</option>
                    {available.map((a) => {
                      const pts = calcPoints(a);
                      const gr = getLetterGrade(pts);
                      return (
                        <option key={a.id} value={a.id}>
                          {gr} · {a.name} ({pts} pts)
                        </option>
                      );
                    })}
                  </select>

                  {artist ? (
                    <>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-sm font-semibold text-white truncate">{artist.name}</span>
                        <span className="text-xs text-slate-400">{artist.position}</span>
                      </div>
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
                      <div className="mt-auto pt-2 border-t border-slate-700/60 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Score</span>
                        <span className="text-sm font-bold tabular-nums text-white">{points} pts</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-600 text-sm py-4">
                      No artist selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Team stats */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Total Score</p>
                  <p className="text-3xl font-bold tabular-nums text-white">{teamScore}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Avg / Slot</p>
                  {avgScore !== null ? (
                    <p className="text-3xl font-bold tabular-nums text-white">
                      {avgScore}
                      <span className={`text-xl ml-1.5 ${getRankingClass(avgGrade ?? "F")}`}>{avgGrade}</span>
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-slate-600">—</p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Filled</p>
                  <p className="text-3xl font-bold tabular-nums text-white">
                    {filledCount}<span className="text-slate-500 text-xl"> / {TEAM_SIZE}</span>
                  </p>
                </div>
                {scoreGap !== null && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">vs Best</p>
                    {scoreGap === 0 ? (
                      <p className="text-xl font-bold text-emerald-400">Optimal!</p>
                    ) : (
                      <p className="text-xl font-bold tabular-nums text-amber-400">▼ {scoreGap} pts</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {lastDelta !== null && lastDelta !== 0 && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-base font-bold tabular-nums ${
                    lastDelta > 0
                      ? "bg-green-900/30 border-green-600/40 text-green-400"
                      : "bg-red-900/30 border-red-600/40 text-red-400"
                  }`}>
                    {lastDelta > 0 ? "▲" : "▼"} {lastDelta > 0 ? "+" : ""}{lastDelta} pts
                  </div>
                )}
                <button
                  onClick={clearTeam}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500"
                >
                  Clear Team
                </button>
              </div>
            </div>

            {/* Skill composition */}
            {filledCount > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-widest text-slate-500 shrink-0">Skill Profile</span>
                {TIER_ORDER.filter((tier) => skillComposition[tier] > 0).map((tier) => (
                  <span
                    key={tier}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TIER_BADGE[tier]}`}
                  >
                    {tier} ×{skillComposition[tier]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
