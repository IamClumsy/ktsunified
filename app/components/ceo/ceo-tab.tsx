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

        {/* How it works */}
        <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/60 px-5 py-4 text-sm text-slate-300 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">How It Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex gap-2">
              <span className="text-violet-400 font-bold shrink-0">Score</span>
              <span className="text-slate-400">Quantity used × points per task. Each category shows a subtotal; all categories sum to your total event points.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-cyan-400 font-bold shrink-0">EXP Cards</span>
              <span className="text-slate-400">EXP Card x24 tasks divide by 24 — enter the raw number of cards, the calculator converts to uses automatically.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold shrink-0">Events</span>
              <span className="text-slate-400">Each tab is a separate event type. Use the Reset button to clear all quantities for the current event.</span>
            </div>
            <div className="flex gap-2">
              <span className="text-amber-400 font-bold shrink-0">Total</span>
              <span className="text-slate-400">The grand total at the bottom is your projected event point score based on the quantities entered.</span>
            </div>
          </div>
        </div>
        <CeoContent />
      </div>
    </CeoTablesProvider>
  );
}
