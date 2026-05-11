"use client";

import { useState, useMemo } from "react";
import artistsDataRaw from "@/src/data/artists.json";
import { Artist } from "../artist/types";
import { categorizeSkills } from "../artist/utils/skillCategorization";
import { calculateArtistPoints, getLetterGrade } from "../artist/utils/artistCalculations";
import { getSkillClass, getRankingClass } from "../artist/utils/skillStyling";

const artistsData = artistsDataRaw as Artist[];

// Skill arrays built once from the full SSR roster
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
  "EDM":        { inactive: "text-cyan-400 border-slate-700 hover:border-cyan-500/50",     active: "bg-gradient-to-r from-cyan-600 to-sky-600 text-white border-cyan-500" },
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

const TEAM_SIZE = 5;

export function TeamBuilderTab() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [team, setTeam] = useState<(Artist | null)[]>(Array(TEAM_SIZE).fill(null));
  const [lastDelta, setLastDelta] = useState<number | null>(null);

  const genreArtists = useMemo(
    () => artistsData
      .filter((a) => a.genre === selectedGenre)
      .sort((a, b) => calcPoints(b) - calcPoints(a)),
    [selectedGenre],
  );

  const teamScore = useMemo(
    () => team.reduce((sum, a) => sum + (a ? calcPoints(a) : 0), 0),
    [team],
  );

  const filledCount = team.filter(Boolean).length;
  const avgGrade = filledCount > 0 ? getLetterGrade(Math.round(teamScore / filledCount)) : null;

  const pickedIds = useMemo(
    () => new Set(team.filter(Boolean).map((a) => a!.id)),
    [team],
  );

  function setSlot(slotIdx: number, artistId: string) {
    const artist = artistId
      ? (genreArtists.find((a) => a.id === Number(artistId)) ?? null)
      : null;

    // Compute delta before state update using current team
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
                  {/* Slot header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-slate-500">
                      Slot {slotIdx + 1}
                    </span>
                    {grade && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_BADGE[grade]}`}>
                        {grade}
                      </span>
                    )}
                  </div>

                  {/* Artist picker */}
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

                  {/* Artist detail */}
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
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Avg Grade</p>
                  <p className={`text-3xl font-bold ${avgGrade ? getRankingClass(avgGrade) : "text-slate-600"}`}>
                    {avgGrade ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Filled</p>
                  <p className="text-3xl font-bold tabular-nums text-white">
                    {filledCount}<span className="text-slate-500 text-xl"> / {TEAM_SIZE}</span>
                  </p>
                </div>
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
          </div>
        </>
      )}
    </div>
  );
}
