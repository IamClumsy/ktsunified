"use client";

import { useState, useMemo, useEffect } from "react";
import type { ShopData } from "./svs-context";

type ItemState = { quantity: number };
type ColorScheme = "amber" | "slate" | "orange";

const schemes: Record<ColorScheme, { card: string; title: string; total: string }> = {
  amber: {
    card: "bg-gradient-to-b from-amber-900/30 to-slate-900/70 border-amber-700/40",
    title: "text-amber-300",
    total: "text-amber-200",
  },
  slate: {
    card: "bg-gradient-to-b from-slate-700/30 to-slate-900/70 border-slate-500/40",
    title: "text-slate-200",
    total: "text-slate-100",
  },
  orange: {
    card: "bg-gradient-to-b from-orange-900/30 to-slate-900/70 border-orange-700/40",
    title: "text-orange-300",
    total: "text-orange-200",
  },
};

function fmt(v: number): string {
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
  const [items, setItems] = useState<ItemState[]>(() =>
    shop.items.map(() => ({ quantity: 0 }))
  );

  const total = useMemo(
    () => items.reduce((sum, state, i) => sum + state.quantity * shop.items[i].price, 0),
    [items, shop.items]
  );

  useEffect(() => { onTotalChange?.(total); }, [total, onTotalChange]);

  function setQty(idx: number, qty: number) {
    setItems((prev) => prev.map((s, i) => (i === idx ? { quantity: Math.max(0, qty) } : s)));
  }

  function reset() {
    setItems(shop.items.map(() => ({ quantity: 0 })));
  }

  function rowHighlight(qty: number): string {
    if (qty === 0 || remaining === null) return "";
    return remaining >= 0 ? "bg-green-900/20" : "bg-red-900/20";
  }

  return (
    <section className={`rounded-2xl border p-5 shadow-xl ${scheme.card}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${scheme.title}`}>{shop.title}</h2>
        <button
          onClick={reset}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-2 rounded border border-slate-700 hover:border-slate-500"
        >
          Reset
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-widest">
              <th className="pb-2 text-left">Item</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right pr-1">Price</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {shop.items.map((item, i) => {
              const state = items[i];
              const subtotal = state.quantity * item.price;
              return (
                <tr key={item.item} className={`transition-colors ${rowHighlight(state.quantity)}`}>
                  <td className="py-2 text-slate-200">{item.item}</td>
                  <td className="py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={state.quantity}
                      onChange={(e) => setQty(i, Number(e.target.value))}
                      className="w-full sm:w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-right text-white text-xs"
                    />
                  </td>
                  <td className="py-2 text-right text-slate-400 tabular-nums pr-1">{fmt(item.price)}</td>
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
        <span className="text-sm uppercase tracking-widest text-slate-400">Total Coins Needed</span>
        <span className={`text-2xl font-bold tabular-nums ${scheme.title}`}>{fmt(total)}</span>
      </div>
    </section>
  );
}
