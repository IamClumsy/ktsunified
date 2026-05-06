"use client";

import { Suspense, useState, useTransition, lazy, memo } from "react";

// Code-split each tab — only loads when first visited
const NewSrArtistTab = lazy(() => import("@/app/components/artist/new-sr-artist-tab").then((m) => ({ default: m.NewSrArtistTab })));
const NewArtistTab = lazy(() => import("@/app/components/artist/new-artist-tab").then((m) => ({ default: m.NewArtistTab })));
const CalcTab = lazy(() => import("@/app/components/calc/calc-tab").then((m) => ({ default: m.CalcTab })));
const CeoTab = lazy(() => import("@/app/components/ceo/ceo-tab").then((m) => ({ default: m.CeoTab })));
const SvsTab = lazy(() => import("@/app/components/svs/svs-tab").then((m) => ({ default: m.SvsTab })));

type Tab = "artists" | "sr-artists" | "new-artists" | "resource-calc" | "ceo-event" | "svs-store";

const TABS: { id: Tab; label: string; accent: string; activeClass: string }[] = [
  {
    id: "new-artists",
    label: "SSR Artists",
    accent: "rose",
    activeClass: "bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500",
  },
  {
    id: "sr-artists",
    label: "SR Artists",
    accent: "purple",
    activeClass: "bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-500",
  },
  {
    id: "resource-calc",
    label: "Resource Calc",
    accent: "sky",
    activeClass: "bg-gradient-to-r from-sky-600 to-cyan-600 text-white border-sky-500",
  },
  {
    id: "ceo-event",
    label: "Event Calculators",
    accent: "violet",
    activeClass: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500",
  },
  {
    id: "svs-store",
    label: "SVS Store",
    accent: "amber",
    activeClass: "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500",
  },
];

// Memoized so switching tabs doesn't re-render already-mounted tab subtrees
const TabContent = memo(function TabContent({ id }: { id: Tab }) {
  return (
    <Suspense fallback={<Loading />}>
      {id === "sr-artists" && <NewSrArtistTab />}
      {id === "new-artists" && <NewArtistTab />}
      {id === "resource-calc" && <CalcTab />}
      {id === "ceo-event" && <CeoTab />}
      {id === "svs-store" && <SvsTab />}
    </Suspense>
  );
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("new-artists");
  // Track which tabs have ever been visited so they stay mounted (CSS-hidden) after first render
  const [mounted, setMounted] = useState<Set<Tab>>(new Set(["new-artists"]));
  const [isPending, startTransition] = useTransition();

  function switchTab(tab: Tab) {
    startTransition(() => {
      setMounted((prev) => (prev.has(tab) ? prev : new Set([...prev, tab])));
      setActiveTab(tab);
    });
  }

  return (
    <div className="min-h-screen text-white">
      {/* Top header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 shadow-xl">
        <div className="mx-auto max-w-7xl px-4 pt-3 pb-2">
          {/* Title row */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.png" alt="KTS" className="w-8 h-8 rounded shrink-0" />
            <span className="text-2xl font-extrabold tracking-widest text-slate-100 uppercase">
              KTS 1118
            </span>
          </div>
          {/* Tab nav */}
          <nav className="flex flex-wrap gap-1.5 justify-center">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-200 cursor-pointer
                    ${isActive
                      ? `${tab.activeClass} ${isPending ? "opacity-70" : ""}`
                      : "bg-slate-900/60 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500"
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Tab content — tabs stay mounted once visited, hidden via CSS to avoid remount cost */}
      <main>
        {TABS.map((tab) => (
          <div key={tab.id} hidden={activeTab !== tab.id}>
            {mounted.has(tab.id) && <TabContent id={tab.id} />}
          </div>
        ))}
      </main>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-32">
      <p className="text-slate-400">Loading…</p>
    </div>
  );
}
