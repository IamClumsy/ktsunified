"use client";

import { useState, useMemo, useEffect } from "react";
import { useCalcTables } from "../calc-context";
import { CalculatorSection, ColorScheme } from "../calculator-section";

type Props = {
  title: string;
  tableKey: string;
  color: ColorScheme;
  accentClass: string;
};

export function EventScoring({ title, tableKey, color, accentClass }: Props) {
  const { tables } = useCalcTables();
  const data = useMemo(() => tables?.[tableKey]?.data ?? [], [tables, tableKey]);

  const [quantities, setQuantities] = useState<number[]>([]);

  useEffect(() => {
    setQuantities(new Array(data.length).fill(0));
  }, [data.length]);

  const categories = useMemo(() => {
    const cats: { name: string; rows: { idx: number; task: string; points: number }[] }[] = [];
    let lastCat = "";
    data.forEach((row, idx) => {
      const cat = String(row[0] ?? "");
      const task = String(row[1] ?? "");
      const points = Number(row[2] ?? 0);
      if (cat !== lastCat) {
        lastCat = cat;
        cats.push({ name: cat, rows: [] });
      }
      cats[cats.length - 1]?.rows.push({ idx, task, points });
    });
    return cats;
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, row, idx) => sum + Number(row[2] ?? 0) * (quantities[idx] ?? 0), 0),
    [data, quantities]
  );

  const setQty = (idx: number, raw: string) => {
    const val = Math.max(0, parseInt(raw.replace(/\D/g, ""), 10) || 0);
    setQuantities((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  return (
    <CalculatorSection title={title} color={color}>
      {categories.map((cat) => {
        const catTotal = cat.rows.reduce(
          (sum, { idx, points }) => sum + points * (quantities[idx] ?? 0),
          0
        );
        return (
          <div key={cat.name}>
            <p className={`mb-2 text-xs font-bold uppercase tracking-wider ${accentClass}`}>
              {cat.name}
            </p>
            <div className="space-y-1">
              {cat.rows.map(({ idx, task, points }) => {
                const qty = quantities[idx] ?? 0;
                const score = qty * points;
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="flex-1 min-w-0 truncate text-slate-300" title={task}>
                      {task}
                    </span>
                    <span className="shrink-0 text-slate-500">{points.toLocaleString()}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={qty === 0 ? "" : String(qty)}
                      placeholder="0"
                      onChange={(e) => setQty(idx, e.target.value)}
                      className="w-14 shrink-0 rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-right text-white focus:outline-none focus:border-slate-500"
                    />
                    <span className={`w-24 shrink-0 text-right tabular-nums ${score > 0 ? accentClass : "text-slate-600"}`}>
                      {score > 0 ? score.toLocaleString() : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            {catTotal > 0 && (
              <div className={`mt-1 border-t border-slate-800 pt-1 text-right text-xs font-medium ${accentClass}`}>
                {catTotal.toLocaleString()}
              </div>
            )}
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t border-slate-700 pt-3">
        <span className="text-sm font-semibold text-slate-300">Total Score</span>
        <span className={`text-xl font-bold tabular-nums ${accentClass}`}>
          {total.toLocaleString()}
        </span>
      </div>
    </CalculatorSection>
  );
}
