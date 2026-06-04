"use client";

import { Suspense, useState, useTransition, lazy, memo, useCallback } from "react";
import { ArtistCardSkeleton, CalcSectionSkeleton } from "@/app/components/ui/skeleton";
import { useSwipeNav } from "@/app/hooks/useSwipeNav";

// Code-split each tab — chunks are cached at Vercel's CDN edge
const NewSrArtistTab = lazy(() =>
  import("@/app/components/artist/new-sr-artist-tab").then((m) => ({ default: m.NewSrArtistTab }))
);
const NewArtistTab = lazy(() =>
  import("@/app/components/artist/new-artist-tab").then((m) => ({ default: m.NewArtistTab }))
);
const CalcTab = lazy(() =>
  import("@/app/components/calc/calc-tab").then((m) => ({ default: m.CalcTab }))
);
const CeoTab = lazy(() =>
  import("@/app/components/ceo/ceo-tab").then((m) => ({ default: m.CeoTab }))
);
const SvsTab = lazy(() =>
  import("@/app/components/svs/svs-tab").then((m) => ({ default: m.SvsTab }))
);
const TeamBuilderTab = lazy(() =>
  import("@/app/components/team-builder/team-builder-tab").then((m) => ({
    default: m.TeamBuilderTab,
  }))
);
const ShopsTab = lazy(() =>
  import("@/app/components/shops/shops-tab").then((m) => ({ default: m.ShopsTab }))
);

type Tab =
  | "sr-artists"
  | "new-artists"
  | "resource-calc"
  | "ceo-event"
  | "svs-store"
  | "team-builder"
  | "shops";

const TABS: {
  id: Tab;
  label: string;
  shortLabel: string;
  activeClass: string;
}[] = [
  {
    id: "new-artists",
    label: "SSR Artists",
    shortLabel: "SSR",
    activeClass: "bg-pink-600 text-white border-pink-500",
  },
  {
    id: "sr-artists",
    label: "SR Artists",
    shortLabel: "SR",
    activeClass: "bg-pink-600 text-white border-pink-500",
  },
  {
    id: "resource-calc",
    label: "Resource Calc",
    shortLabel: "Calc",
    activeClass: "bg-pink-600 text-white border-pink-500",
  },
  {
    id: "ceo-event",
    label: "Event Calculators",
    shortLabel: "Events",
    activeClass: "bg-pink-600 text-white border-pink-500",
  },
  {
    id: "svs-store",
    label: "SVS Store",
    shortLabel: "SVS",
    activeClass: "bg-pink-600 text-white border-pink-500",
  },
  {
    id: "team-builder",
    label: "Team Builder",
    shortLabel: "Team",
    activeClass: "bg-pink-600 text-white border-pink-500",
  },
  {
    id: "shops",
    label: "Shops",
    shortLabel: "Shops",
    activeClass: "bg-pink-600 text-white border-pink-500",
  },
];

function TabIcon({ id }: { id: Tab }) {
  const cls = "w-5 h-5 shrink-0";
  switch (id) {
    case "new-artists":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
          />
        </svg>
      );
    case "sr-artists":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
          />
        </svg>
      );
    case "resource-calc":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25v-.008Zm2.496-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.496-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.598 4.5 4.698V18a2.25 2.25 0 0 0 2.25 2.25h10.5A2.25 2.25 0 0 0 19.5 18V4.698c0-1.1-.807-1.998-1.907-2.126A48.507 48.507 0 0 0 12 2.25Z"
          />
        </svg>
      );
    case "ceo-event":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
          />
        </svg>
      );
    case "svs-store":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
          />
        </svg>
      );
    case "team-builder":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
      );
    case "shops":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      );
  }
}

// Memoized so switching tabs doesn't re-render already-mounted tab subtrees
const TabContent = memo(function TabContent({ id }: { id: Tab }) {
  const fallback =
    id === "new-artists" || id === "sr-artists" ? (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <ArtistCardSkeleton key={i} />
          ))}
        </div>
      </div>
    ) : id === "resource-calc" ? (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <CalcSectionSkeleton key={i} />
          ))}
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    );

  return (
    <Suspense fallback={fallback}>
      {id === "sr-artists" && <NewSrArtistTab />}
      {id === "new-artists" && <NewArtistTab />}
      {id === "resource-calc" && <CalcTab />}
      {id === "ceo-event" && <CeoTab />}
      {id === "svs-store" && <SvsTab />}
      {id === "team-builder" && <TeamBuilderTab />}
      {id === "shops" && <ShopsTab />}
    </Suspense>
  );
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("new-artists");
  const [mounted, setMounted] = useState<Set<Tab>>(new Set(["new-artists"]));
  const [isPending, startTransition] = useTransition();

  function switchTab(tab: Tab) {
    startTransition(() => {
      setMounted((prev) => (prev.has(tab) ? prev : new Set([...prev, tab])));
      setActiveTab(tab);
    });
  }

  const activeIndex = TABS.findIndex((t) => t.id === activeTab);
  const activeTabLabel = TABS[activeIndex]?.label ?? "";

  const swipeLeft = useCallback(() => {
    const next = TABS[activeIndex + 1];
    if (next) switchTab(next.id);
  }, [activeIndex]);

  const swipeRight = useCallback(() => {
    const prev = TABS[activeIndex - 1];
    if (prev) switchTab(prev.id);
  }, [activeIndex]);

  useSwipeNav({ onSwipeLeft: swipeLeft, onSwipeRight: swipeRight });

  return (
    <div className="min-h-screen text-white">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/60 shadow-lg">
        {/* Mobile: compact branding only */}
        <div className="md:hidden flex items-center gap-3 h-12 px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.png" alt="KTS" className="w-7 h-7 rounded shrink-0" />
          <span className="text-base font-extrabold tracking-widest text-slate-100 uppercase">
            KTS 1118
          </span>
          <span className="ml-auto text-xs text-pink-400 font-medium truncate">
            {activeTabLabel}
          </span>
        </div>

        {/* Desktop: full header with tab nav */}
        <div className="hidden md:block mx-auto max-w-7xl px-4 pt-3 pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.png" alt="KTS" className="w-8 h-8 rounded shrink-0" />
            <span className="text-2xl font-extrabold tracking-widest text-slate-100 uppercase">
              KTS 1118
            </span>
          </div>
          <nav aria-label="Main navigation" className="flex flex-wrap gap-1.5 justify-center">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 cursor-pointer min-h-[44px] ${
                    isActive
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

      {/* ── Tab content ────────────────────────────────────────────────── */}
      <main id="main-content" className="pb-20 md:pb-0">
        {TABS.map((tab) => (
          <div key={tab.id} hidden={activeTab !== tab.id} inert={activeTab !== tab.id || undefined}>
            {mounted.has(tab.id) && <TabContent id={tab.id} />}
          </div>
        ))}
      </main>

      {/* ── Mobile bottom nav ──────────────────────────────────────────── */}
      <nav
        aria-label="Tab navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/60 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors active:bg-slate-800/60 ${
                isActive ? "text-pink-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <TabIcon id={tab.id} />
              <span className="text-[9px] font-semibold tracking-wide leading-tight">
                {tab.shortLabel}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-[calc(env(safe-area-inset-bottom)+0px)] w-8 h-0.5 rounded-full bg-pink-500"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
