"use client";

import { useState, useCallback } from "react";
import { SvsTablesProvider, useSvsTables } from "./svs-context";
import { ShopSection } from "./shop-section";

function fmt(v: number) {
  return v.toLocaleString();
}

function SvsContent() {
  const { tables, loading, error } = useSvsTables();
  const [budget, setBudget] = useState<number | "">("");
  const [totals, setTotals] = useState<Record<string, number>>({ GOLD: 0, SILVER: 0, BRONZE: 0 });

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
  const remaining = typeof budget === "number" ? budget - grandTotal : null;

  const setGold = useCallback((t: number) => setTotals((p) => ({ ...p, GOLD: t })), []);
  const setSilver = useCallback((t: number) => setTotals((p) => ({ ...p, SILVER: t })), []);
  const setBronze = useCallback((t: number) => setTotals((p) => ({ ...p, BRONZE: t })), []);

  if (loading) return <div className="flex items-center justify-center py-24"><p className="text-slate-400">Loading calculator data…</p></div>;
  if (error) return <div className="flex items-center justify-center py-24"><p className="text-red-400">Error: {error}</p></div>;
  if (!tables) return null;

  return (
    <div className="space-y-6">
      {/* Budget input */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4 flex flex-wrap items-center gap-4">
        <label className="text-sm uppercase tracking-widest text-slate-400 shrink-0">Budget</label>
        <input
          type="number"
          min={0}
          value={budget}
          onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Enter coin budget…"
          className="flex-1 min-w-[160px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        />
        {remaining !== null && (
          <span className={`text-sm font-semibold tabular-nums ${remaining >= 0 ? "text-green-400" : "text-red-400"}`}>
            {remaining >= 0
              ? `${fmt(remaining)} remaining`
              : `${fmt(-remaining)} over budget`}
          </span>
        )}
      </div>

      {tables.GOLD && <ShopSection shop={tables.GOLD} color="amber" onTotalChange={setGold} />}
      {tables.SILVER && <ShopSection shop={tables.SILVER} color="slate" onTotalChange={setSilver} />}
      {tables.BRONZE && <ShopSection shop={tables.BRONZE} color="orange" onTotalChange={setBronze} />}

      {/* Grand total footer */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4 flex items-center justify-between">
        <span className="text-sm uppercase tracking-widest text-slate-400">Grand Total</span>
        <span className="text-2xl font-bold tabular-nums text-white">{fmt(grandTotal)}</span>
      </div>
    </div>
  );
}

export function SvsTab() {
  return (
    <SvsTablesProvider>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">SVS Store Calculator</p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold text-white">SVS Store Calculator</h1>
          <p className="mt-2 text-slate-300">Adjust quantities to plan your coin spending</p>
        </header>
        <SvsContent />
      </div>
    </SvsTablesProvider>
  );
}
