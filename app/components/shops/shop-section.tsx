"use client";

import { useState, useMemo, useEffect } from "react";
import type { ShopData } from "./shops-context";

type ColorScheme = "violet" | "cyan" | "orange";

const schemes: Record<ColorScheme, { card: string; title: string; total: string }> = {
  violet: {
    card: "bg-gradient-to-b from-violet-900/30 to-slate-900/70 border-violet-700/40",
    title: "text-violet-300",
    total: "text-violet-200",
  },
  cyan: {
    card: "bg-gradient-to-b from-cyan-900/30 to-slate-900/70 border-cyan-700/40",
    title: "text-cyan-300",
    total: "text-cyan-200",
  },
  orange: {
    card: "bg-gradient-to-b from-orange-900/30 to-slate-900/70 border-orange-700/40",
    title: "text-orange-300",
    total: "text-orange-200",
  },
};

function fmt(v: number) {
  return v.toLocaleString();
}

type Props = {
  shop: ShopData;
  color: ColorScheme;
  onTotalChange?: (total: number) => void;
  remaining: number | null;
};

export function ShopSection({ shop, color, onTotalChange, remaining }: Props) {
  const scheme = schemes[color];
  const hasVipLevel = shop.items.some((i) => i.vipLevel != null);
  const vipLevels = useMemo(
    () =>
      hasVipLevel
        ? [...new Set(shop.items.map((i) => i.vipLevel as number))].sort((a, b) => a - b)
        : [],
    [shop.items, hasVipLevel]
  );
  const [myVipLevel, setMyVipLevel] = useState<number>(
    hasVipLevel && vipLevels.length > 0 ? vipLevels[vipLevels.length - 1] : 0
  );
  const [quantities, setQuantities] = useState<number[]>(() => shop.items.map(() => 0));

  const visibleIndices = useMemo(
    () =>
      shop.items.reduce<number[]>((acc, item, i) => {
        if (!hasVipLevel || (item.vipLevel ?? 0) <= myVipLevel) acc.push(i);
        return acc;
      }, []),
    [shop.items, hasVipLevel, myVipLevel]
  );

  const total = useMemo(
    () => quantities.reduce((sum, qty, i) => sum + qty * shop.items[i].price, 0),
    [quantities, shop.items]
  );

  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  function setQty(idx: number, qty: number) {
    const max = shop.items[idx].quantity;
    setQuantities((prev) => prev.map((v, i) => (i === idx ? Math.min(max, Math.max(0, qty)) : v)));
  }

  function reset() {
    setQuantities(shop.items.map(() => 0));
  }

  return (
    <section className={`rounded-2xl border p-5 shadow-xl ${scheme.card}`}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className={`text-lg font-semibold ${scheme.title}`}>{shop.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{shop.currency}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasVipLevel && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 uppercase tracking-widest shrink-0">
                My VIP Level
              </label>
              <select
                value={myVipLevel}
                onChange={(e) => setMyVipLevel(Number(e.target.value))}
                className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-400/60"
              >
                {vipLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={reset}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2 rounded border border-slate-700 hover:border-slate-500"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-widest">
              {hasVipLevel && <th className="pb-2 text-left w-12">VIP</th>}
              <th className="pb-2 text-left">Item</th>
              <th className="pb-2 text-left">Qty / Max</th>
              <th className="pb-2 text-right pr-1">Price</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {visibleIndices.map((i) => {
              const item = shop.items[i];
              const qty = quantities[i];
              const subtotal = qty * item.price;
              const atMax = qty === item.quantity && item.quantity > 0;
              return (
                <tr key={i} className="transition-colors">
                  {hasVipLevel && (
                    <td className="py-2 text-xs text-slate-500 tabular-nums">{item.vipLevel}</td>
                  )}
                  <td className="py-2 text-slate-200">{item.item}</td>
                  <td className="py-2 text-left">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={item.quantity || undefined}
                        value={qty}
                        onChange={(e) => setQty(i, Number(e.target.value))}
                        aria-label={`Quantity for ${item.item}${item.quantity > 0 ? ` (max ${item.quantity})` : ""}`}
                        className={`w-16 rounded border bg-slate-950 px-2 py-1.5 text-right text-white text-xs ${
                          atMax ? "border-green-500/60" : "border-slate-700"
                        }`}
                      />
                      {item.quantity > 0 && (
                        <span className="text-slate-500 text-xs tabular-nums">
                          / {fmt(item.quantity)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-right text-slate-400 tabular-nums pr-1">
                    {fmt(item.price)}
                  </td>
                  <td className={`py-2 text-right font-medium tabular-nums ${scheme.total}`}>
                    {fmt(subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center border-t border-slate-700 pt-4">
        <span className="text-sm uppercase tracking-widest text-slate-400">
          Total {shop.currency} Needed
        </span>
        <span className={`text-2xl font-bold tabular-nums ${scheme.title}`}>{fmt(total)}</span>
      </div>
    </section>
  );
}
