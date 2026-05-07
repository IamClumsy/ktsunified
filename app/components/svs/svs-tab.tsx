"use client";

import { useState, useCallback } from "react";
import { SvsTablesProvider, useSvsTables } from "./svs-context";
import { ShopSection } from "./shop-section";

type ShopKey = "GOLD" | "SILVER" | "BRONZE";

const SHOP_TABS: { key: ShopKey; label: string; active: string; inactive: string }[] = [
  {
    key: "GOLD",
    label: "Gold",
    active: "bg-gradient-to-r from-amber-600 to-yellow-600 text-white border-amber-500",
    inactive: "bg-slate-900/60 text-amber-400 border-slate-700 hover:border-amber-600/50",
  },
  {
    key: "SILVER",
    label: "Silver",
    active: "bg-gradient-to-r from-slate-500 to-slate-600 text-white border-slate-400",
    inactive: "bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-500",
  },
  {
    key: "BRONZE",
    label: "Bronze",
    active: "bg-gradient-to-r from-orange-700 to-amber-700 text-white border-orange-600",
    inactive: "bg-slate-900/60 text-orange-400 border-slate-700 hover:border-orange-600/50",
  },
];

const COLOR_MAP: Record<ShopKey, "amber" | "slate" | "orange"> = {
  GOLD: "amber",
  SILVER: "slate",
  BRONZE: "orange",
};

function fmt(v: number) {
  return v.toLocaleString();
}

function SvsContent() {
  const { tables, loading, error } = useSvsTables();
  const [selectedShop, setSelectedShop] = useState<ShopKey>("GOLD");
  const [budget, setBudget] = useState<number | "">("");
  const [totals, setTotals] = useState<Record<ShopKey, number>>({ GOLD: 0, SILVER: 0, BRONZE: 0 });
  const [resetKey, setResetKey] = useState(0);

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
      {/* Shop tab nav */}
      <div className="flex gap-2">
        {SHOP_TABS.map((tab) => {
          const shopTotal = totals[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedShop(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                selectedShop === tab.key ? tab.active : tab.inactive
              }`}
            >
              {tab.label}
              {shopTotal > 0 && (
                <span className="ml-1.5 text-xs text-slate-300">({fmt(shopTotal)})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Budget input */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4 flex flex-wrap items-center gap-4">
        <label htmlFor="svs-budget" className="text-sm uppercase tracking-widest text-slate-400 shrink-0">Budget</label>
        <input
          id="svs-budget"
          type="number"
          min={0}
          value={budget}
          onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="Enter coin budget…"
          className="flex-1 min-w-[160px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        />
        {remaining !== null && (
          <span className={`text-sm font-semibold tabular-nums ${remaining >= 0 ? "text-green-400" : "text-red-400"}`}>
            {remaining >= 0 ? `${fmt(remaining)} remaining` : `${fmt(-remaining)} over budget`}
          </span>
        )}
        {typeof budget === "number" && budget > 0 && (
          <div className="w-full mt-1">
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${grandTotal > budget ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${Math.min((grandTotal / budget) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{Math.round(Math.min((grandTotal / budget) * 100, 100))}% spent</span>
              <span>{fmt(budget)} total</span>
            </div>
          </div>
        )}
      </div>

      {/* Active shop — keep all mounted so totals stay accurate */}
      <div hidden={selectedShop !== "GOLD"}>
        {tables.GOLD && <ShopSection key={`GOLD-${resetKey}`} shop={tables.GOLD} color="amber" onTotalChange={setGold} remaining={remaining} />}
      </div>
      <div hidden={selectedShop !== "SILVER"}>
        {tables.SILVER && <ShopSection key={`SILVER-${resetKey}`} shop={tables.SILVER} color="slate" onTotalChange={setSilver} remaining={remaining} />}
      </div>
      <div hidden={selectedShop !== "BRONZE"}>
        {tables.BRONZE && <ShopSection key={`BRONZE-${resetKey}`} shop={tables.BRONZE} color="orange" onTotalChange={setBronze} remaining={remaining} />}
      </div>

      {/* Grand total footer */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => setResetKey((k) => k + 1)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2 rounded border border-slate-700 hover:border-slate-500"
        >
          Reset All
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm uppercase tracking-widest text-slate-400">Grand Total</span>
          <span className={`text-2xl font-bold tabular-nums ${remaining !== null && remaining < 0 ? "text-red-400" : "text-white"}`}>
            {fmt(grandTotal)}
          </span>
        </div>
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
