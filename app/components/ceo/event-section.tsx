"use client";

import { useState, useMemo } from "react";
import type { EventData } from "./ceo-context";

type TaskState = { included: boolean; used: number };
type ColorScheme = "violet" | "cyan" | "emerald" | "amber";

const schemes: Record<ColorScheme, { card: string; title: string; total: string; check: string; catHeader: string; subtotal: string }> = {
  violet: {
    card: "bg-gradient-to-b from-violet-900/30 to-slate-900/70 border-violet-700/40",
    title: "text-violet-300",
    total: "text-violet-200",
    check: "accent-violet-400",
    catHeader: "text-violet-400",
    subtotal: "text-violet-300",
  },
  cyan: {
    card: "bg-gradient-to-b from-cyan-900/30 to-slate-900/70 border-cyan-700/40",
    title: "text-cyan-300",
    total: "text-cyan-200",
    check: "accent-cyan-400",
    catHeader: "text-cyan-400",
    subtotal: "text-cyan-300",
  },
  emerald: {
    card: "bg-gradient-to-b from-emerald-900/30 to-slate-900/70 border-emerald-700/40",
    title: "text-emerald-300",
    total: "text-emerald-200",
    check: "accent-emerald-400",
    catHeader: "text-emerald-400",
    subtotal: "text-emerald-300",
  },
  amber: {
    card: "bg-gradient-to-b from-amber-900/30 to-slate-900/70 border-amber-700/40",
    title: "text-amber-300",
    total: "text-amber-200",
    check: "accent-amber-400",
    catHeader: "text-amber-400",
    subtotal: "text-amber-300",
  },
};

type Props = {
  event: EventData;
  color: ColorScheme;
  id?: string;
  onReset?: () => void;
};

function calcScore(taskName: string, points: number, used: number): number {
  if (taskName.includes("EXP Card x24")) return used / 24;
  return used * points;
}

function fmt(v: number): string {
  return Number.isInteger(v)
    ? v.toLocaleString()
    : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function EventSection({ event, color, id, onReset }: Props) {
  const scheme = schemes[color];

  const [taskStates, setTaskStates] = useState<TaskState[][]>(() =>
    event.categories.map((cat) =>
      cat.tasks.map((t) => ({ included: true, used: t.used }))
    )
  );

  const grandTotal = useMemo(() => {
    let total = 0;
    event.categories.forEach((cat, ci) => {
      cat.tasks.forEach((task, ti) => {
        const state = taskStates[ci][ti];
        if (state.included) total += calcScore(task.task, task.points, state.used);
      });
    });
    return total;
  }, [taskStates, event.categories]);

  function toggleTask(ci: number, ti: number) {
    setTaskStates((prev) =>
      prev.map((cat, c) =>
        c === ci ? cat.map((s, t) => (t === ti ? { ...s, included: !s.included } : s)) : cat
      )
    );
  }

  function setUsed(ci: number, ti: number, val: number) {
    setTaskStates((prev) =>
      prev.map((cat, c) =>
        c === ci
          ? cat.map((s, t) => (t === ti ? { ...s, used: Math.max(0, val) } : s))
          : cat
      )
    );
  }

  return (
    <section id={id} className={`rounded-2xl border p-4 shadow-xl ${scheme.card}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-lg font-semibold text-center flex-1 ${scheme.title}`}>{event.name}</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded border border-slate-700 hover:border-slate-500"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {event.categories.map((cat, ci) => {
          const catTotal = cat.tasks.reduce((sum, task, ti) => {
            const state = taskStates[ci][ti];
            return state.included ? sum + calcScore(task.task, task.points, state.used) : sum;
          }, 0);

          return (
            <div key={cat.name}>
              <div className={`text-xs font-semibold uppercase tracking-widest mb-1 ${scheme.catHeader}`}>
                {cat.name}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-widest">
                      <th className="pb-2 text-left w-6"></th>
                      <th className="pb-2 text-left">Task</th>
                      <th className="pb-2 text-right pr-2">Points</th>
                      <th className="pb-2 text-right">Used</th>
                      <th className="pb-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cat.tasks.map((task, ti) => {
                      const state = taskStates[ci][ti];
                      const score = state.included ? calcScore(task.task, task.points, state.used) : 0;
                      return (
                        <tr key={task.task} className="transition-opacity">
                          <td className="py-1 pr-2">
                            <input
                              type="checkbox"
                              checked={state.included}
                              onChange={() => toggleTask(ci, ti)}
                              aria-label={`Include ${task.task}`}
                              className={`w-4 h-4 cursor-pointer ${scheme.check}`}
                            />
                          </td>
                          <td className="py-1 text-slate-200">{task.task}</td>
                          <td className="py-1 text-right text-slate-500 tabular-nums text-xs pr-2">
                            {fmt(task.points)}
                          </td>
                          <td className="py-1 text-right">
                            <input
                              type="number"
                              min={0}
                              value={state.used}
                              onChange={(e) => setUsed(ci, ti, Number(e.target.value))}
                              disabled={!state.included}
                              aria-label={`Amount used for ${task.task}`}
                              className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-right text-white text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className={`py-1 text-right font-medium tabular-nums ${state.included ? scheme.total : "text-slate-700"}`}>
                            {state.included ? fmt(score) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                <span className="text-xs uppercase tracking-widest text-slate-500">{cat.name} Total</span>
                <span className={`text-sm font-semibold tabular-nums ${scheme.subtotal}`}>{fmt(catTotal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between items-center border-t border-slate-700 pt-3">
        <span className="text-sm uppercase tracking-widest text-slate-400">Total Event Points</span>
        <span className={`text-2xl font-bold tabular-nums ${scheme.title}`}>{fmt(grandTotal)}</span>
      </div>
    </section>
  );
}
