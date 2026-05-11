"use client";

import { useState, useCallback } from "react";
import { ShopsTablesProvider, useShopsTables } from "./shops-context";
import { ShopSection } from "./shop-section";

type ShopKey = "VIP" | "ABROAD" | "PARKING";

const SHOP_TABS: { key: ShopKey; label: string; active: string; inactive: string }[] = [
  {
    key: "VIP",
    label: "VIP Shop",
    active: "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500",
    inactive: "bg-slate-900/60 text-violet-400 border-slate-700 hover:border-violet-600/50",
  },
  {
    key: "ABROAD",
    label: "Abroad Shop",
    active: "bg-gradient-to-r from-cyan-600 to-sky-600 text-white border-cyan-500",
    inactive: "bg-slate-900/60 text-cyan-400 border-slate-700 hover:border-cyan-600/50",
  },
  {
    key: "PARKING",
    label: "Parking Shop",
    active: "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-500",
    inactive: "bg-slate-900/60 text-orange-400 border-slate-700 hover:border-orange-600/50",
  },
];

const COLOR_MAP: Record<ShopKey, "violet" | "cyan" | "orange"> = {
  VIP: "violet",
  ABROAD: "cyan",
  PARKING: "orange",
};

const BUDGET_INPUT_ID: Record<ShopKey, string> = {
  VIP: "shops-budget-vip",
  ABROAD: "shops-budget-abroad",
  PARKING: "shops-budget-parking",
};

function fmt(v: number) {
  return v.toLocaleString();
}

function ShopsContent() {
  const { tables, loading, error } = useShopsTables();
  const [selectedShop, setSelectedShop] = useState<ShopKey>("VIP");
  const [budgets, setBudgets] = useState<Record<ShopKey, number | "">>({ VIP: "", ABROAD: "", PARKING: "" });
  const [totals, setTotals] = useState<Record<ShopKey, number>>({ VIP: 0, ABROAD: 0, PARKING: 0 });
  const [resetKeys, setResetKeys] = useState<Record<ShopKey, number>>({ VIP: 0, ABROAD: 0, PARKING: 0 });

  const budget = budgets[selectedShop];
  const shopTotal = totals[selectedShop];
  const remaining = typeof budget === "number" ? budget - shopTotal : null;

  const setVip = useCallback((t: number) => setTotals((p) => ({ ...p, VIP: t })), []);
  const setAbroad = useCallback((t: number) => setTotals((p) => ({ ...p, ABROAD: t })), []);
  const setParking = useCallback((t: number) => setTotals((p) => ({ ...p, PARKING: t })), []);

  if (loading) return <div className="flex items-center justify-center py-24"><p className="text-slate-400">Loading shop data…</p></div>;
  if (error) return <div className="flex items-center justify-center py-24"><p className="text-red-400">Error: {error}</p></div>;
  if (!tables) return null;

  function resetCurrentShop() {
    setResetKeys((prev) => ({ ...prev, [selectedShop]: prev[selectedShop] + 1 }));
  }

  return (
    <div className="space-y-6">
      {/* Shop tab nav */}
      <div className="flex gap-2 flex-wrap">
        {SHOP_TABS.map((tab) => {
          const tabTotal = totals[tab.key];
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedShop(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                selectedShop === tab.key ? tab.active : tab.inactive
              }`}
            >
              {tab.label}
              {tabTotal > 0 && (
                <span className="ml-1.5 text-xs text-slate-300">({fmt(tabTotal)})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Budget input */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4 flex flex-wrap items-center gap-4">
        <label htmlFor={BUDGET_INPUT_ID[selectedShop]} className="text-sm uppercase tracking-widest text-slate-400 shrink-0">
          Budget
        </label>
        <input
          id={BUDGET_INPUT_ID[selectedShop]}
          type="number"
          min={0}
          value={budget}
          onChange={(e) =>
            setBudgets((p) => ({ ...p, [selectedShop]: e.target.value === "" ? "" : Number(e.target.value) }))
          }
          placeholder={`Enter ${tables[selectedShop].currency} budget…`}
          className="flex-1 min-w-[160px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/60"
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
                className={`h-full rounded-full transition-all duration-300 ${shopTotal > budget ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${Math.min((shopTotal / budget) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{Math.round(Math.min((shopTotal / budget) * 100, 100))}% spent</span>
              <span>{fmt(budget)} total</span>
            </div>
          </div>
        )}
      </div>

      {/* Shop sections — keep all mounted so totals stay live */}
      <div hidden={selectedShop !== "VIP"}>
        {tables.VIP && (
          <ShopSection
            key={`VIP-${resetKeys.VIP}`}
            shop={tables.VIP}
            color="violet"
            onTotalChange={setVip}
            remaining={remaining}
          />
        )}
      </div>
      <div hidden={selectedShop !== "ABROAD"}>
        {tables.ABROAD && (
          <ShopSection
            key={`ABROAD-${resetKeys.ABROAD}`}
            shop={tables.ABROAD}
            color="cyan"
            onTotalChange={setAbroad}
            remaining={remaining}
          />
        )}
      </div>
      <div hidden={selectedShop !== "PARKING"}>
        {tables.PARKING && (
          <ShopSection
            key={`PARKING-${resetKeys.PARKING}`}
            shop={tables.PARKING}
            color="orange"
            onTotalChange={setParking}
            remaining={remaining}
          />
        )}
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4 flex items-center justify-between">
        <button
          onClick={resetCurrentShop}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2 rounded border border-slate-700 hover:border-slate-500"
        >
          Reset Shop
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm uppercase tracking-widest text-slate-400">
            Total {tables[selectedShop].currency}
          </span>
          <span className={`text-2xl font-bold tabular-nums ${remaining !== null && remaining < 0 ? "text-red-400" : "text-white"}`}>
            {fmt(shopTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ShopsTab() {
  return (
    <ShopsTablesProvider>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Shop Calculators</p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold text-white">Shop Calculators</h1>
          <p className="mt-2 text-slate-300">Plan your spending across VIP, Abroad, and Parking shops</p>
        </header>
        <ShopsContent />
      </div>
    </ShopsTablesProvider>
  );
}
