"use client";

import { useState } from "react";
import { useCalcSummary } from "./calc-context";

const SECTION_ORDER = [
  "Artists", "Assets", "HQ Glass", "HQ Floors",
  "Collection Gems", "Museum Exhibits", "Car Parts", "Car Core",
  "Villa Suite", "Villa Homemaking", "CEO Outfit", "CEO Sports",
  "HQ Building", "Blueprints",
];

function fmt(v: number | null) {
  if (v == null) return "—";
  return v.toLocaleString();
}

export function CalcSummary() {
  const { registry } = useCalcSummary();
  const [open, setOpen] = useState(true);

  const activeKeys = SECTION_ORDER.filter(
    (key) => registry[key]?.some((r) => r.value != null)
  );

  if (activeKeys.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-800/40 transition-colors"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Results Summary
          <span className="ml-2 text-slate-500 font-normal normal-case tracking-normal">
            {activeKeys.length} section{activeKeys.length !== 1 ? "s" : ""}
          </span>
        </span>
        <span className="text-slate-500 text-xs">{open ? "▲ Hide" : "▼ Show"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-700 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeKeys.map((key) => (
            <div key={key} className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">{key}</p>
              <div className="space-y-1">
                {registry[key]
                  .filter((r) => r.value != null)
                  .map((r) => (
                    <div key={r.label} className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-slate-400 truncate">{r.label}</span>
                      <span className="text-sm font-semibold text-white tabular-nums shrink-0">
                        {fmt(r.value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
