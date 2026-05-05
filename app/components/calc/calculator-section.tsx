"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";

export type ColorScheme = "violet" | "sky" | "amber" | "emerald" | "pink";

type Props = {
  title: string;
  note?: string;
  color?: ColorScheme;
  children: ReactNode;
};

const schemes: Record<ColorScheme, { card: string; title: string }> = {
  violet: {
    card: "bg-gradient-to-b from-violet-900/30 to-slate-900/70 border-violet-700/40",
    title: "text-violet-300",
  },
  sky: {
    card: "bg-gradient-to-b from-sky-900/30 to-slate-900/70 border-sky-700/40",
    title: "text-sky-300",
  },
  amber: {
    card: "bg-gradient-to-b from-amber-900/30 to-slate-900/70 border-amber-700/40",
    title: "text-amber-300",
  },
  emerald: {
    card: "bg-gradient-to-b from-emerald-900/30 to-slate-900/70 border-emerald-700/40",
    title: "text-emerald-300",
  },
  pink: {
    card: "bg-gradient-to-b from-pink-900/30 to-slate-900/70 border-pink-700/40",
    title: "text-pink-300",
  },
};

export function CalculatorSection({ title, note, color, children }: Props) {
  const scheme = color ? schemes[color] : null;
  const storageKey = `calc-open-${title.toLowerCase().replace(/\s+/g, "-")}`;

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === "false") setIsOpen(false);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, String(next));
      return next;
    });
  }, [storageKey]);

  return (
    <section
      className={
        scheme
          ? `rounded-2xl border p-5 shadow-xl ${scheme.card}`
          : "rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl"
      }
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div>
          <h2 className={`text-lg font-semibold ${scheme ? scheme.title : "text-white"}`}>{title}</h2>
          {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
        </div>
        <svg
          className={`shrink-0 w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8 10.5 2.5 5h11L8 10.5z" />
        </svg>
      </button>
      {isOpen && <div className="mt-4 space-y-4">{children}</div>}
    </section>
  );
}
