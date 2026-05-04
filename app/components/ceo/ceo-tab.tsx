"use client";

import { useState } from "react";
import { CeoTablesProvider, useCeoTables } from "./ceo-context";
import { EventSection } from "./event-section";

const COLORS = ["violet", "cyan", "emerald", "amber"] as const;
type Color = typeof COLORS[number];

const BTN: Record<Color, { inactive: string; active: string }> = {
  violet: {
    inactive: "border-violet-700/50 text-violet-400 hover:border-violet-400 hover:text-violet-200",
    active:   "border-violet-400 bg-violet-900/40 text-violet-200",
  },
  cyan: {
    inactive: "border-cyan-700/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-200",
    active:   "border-cyan-400 bg-cyan-900/40 text-cyan-200",
  },
  emerald: {
    inactive: "border-emerald-700/50 text-emerald-400 hover:border-emerald-400 hover:text-emerald-200",
    active:   "border-emerald-400 bg-emerald-900/40 text-emerald-200",
  },
  amber: {
    inactive: "border-amber-700/50 text-amber-400 hover:border-amber-400 hover:text-amber-200",
    active:   "border-amber-400 bg-amber-900/40 text-amber-200",
  },
};

function CeoContent() {
  const { tables, loading, error } = useCeoTables();
  const [activeIdx, setActiveIdx] = useState(0);
  const [resetCounts, setResetCounts] = useState<number[]>([]);

  if (loading) return <div className="flex items-center justify-center py-24"><p className="text-slate-400">Loading calculator data…</p></div>;
  if (error)   return <div className="flex items-center justify-center py-24"><p className="text-red-400">Error: {error}</p></div>;
  if (!tables) return null;

  const { events } = tables;
  const color = COLORS[activeIdx % COLORS.length];
  const resetCount = resetCounts[activeIdx] ?? 0;

  function handleReset() {
    setResetCounts((prev) => {
      const next = prev.length ? [...prev] : events.map(() => 0);
      next[activeIdx] = (next[activeIdx] ?? 0) + 1;
      return next;
    });
  }

  return (
    <>
      <nav className="flex gap-2 mb-6 flex-wrap justify-center">
        {events.map((event, i) => {
          const c = COLORS[i % COLORS.length];
          const isActive = i === activeIdx;
          return (
            <button
              key={event.name}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive ? BTN[c].active : BTN[c].inactive
              }`}
            >
              {event.name}
            </button>
          );
        })}
      </nav>

      <EventSection
        key={`${activeIdx}-${resetCount}`}
        event={events[activeIdx]}
        color={color}
        onReset={handleReset}
      />
    </>
  );
}

export function CeoTab() {
  return (
    <CeoTablesProvider>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Top Girl</p>
          <h1 className="mt-2 text-xl md:text-3xl font-bold text-white">Event Calculators</h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter how many items you plan to use to calculate your event points
          </p>
        </header>
        <CeoContent />
      </div>
    </CeoTablesProvider>
  );
}
