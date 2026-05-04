"use client";

import { Suspense, useState, useTransition } from "react";
import { CeoTab } from "@/app/components/ceo/ceo-tab";
import { SvsTab } from "@/app/components/svs/svs-tab";
import { CalcTab } from "@/app/components/calc/calc-tab";
import { ArtistTab } from "@/app/components/artist/artist-tab";
import { SrArtistTab } from "@/app/components/artist/sr-artist-tab";
import { NewArtistTab } from "@/app/components/artist/new-artist-tab";

type Tab = "artists" | "sr-artists" | "new-artists" | "resource-calc" | "ceo-event" | "svs-store";

const TABS: { id: Tab; label: string; accent: string; activeClass: string }[] = [
  {
    id: "artists",
    label: "Artist Info",
    accent: "pink",
    activeClass: "bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white border-pink-500",
  },
  {
    id: "sr-artists",
    label: "SR Artists",
    accent: "purple",
    activeClass: "bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-500",
  },
  {
    id: "new-artists",
    label: "Possible New Artist Layout",
    accent: "rose",
    activeClass: "bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500",
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("artists");
  const [isPending, startTransition] = useTransition();

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
                  onClick={() => startTransition(() => setActiveTab(tab.id))}
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

      {/* Tab content */}
      <main>
        <Suspense fallback={<Loading />}>
          {activeTab === "artists" && <ArtistTab />}
          {activeTab === "sr-artists" && <SrArtistTab />}
          {activeTab === "new-artists" && <NewArtistTab />}
          {activeTab === "resource-calc" && <CalcTab />}
          {activeTab === "ceo-event" && <CeoTab />}
          {activeTab === "svs-store" && <SvsTab />}
        </Suspense>
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
