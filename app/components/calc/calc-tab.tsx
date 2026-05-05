"use client";

import { ReactNode, useState } from "react";
import { CalcTablesProvider, useCalcTables } from "./calc-context";
import { Artists } from "./sections/artists";
import { Assets } from "./sections/assets";
import { HqGlass } from "./sections/hq-glass";
import { HqFloors } from "./sections/hq-floors";
import { CollectionGems } from "./sections/collection-gems";
import { MuseumExhibits } from "./sections/museum-exhibits";
import { CarParts } from "./sections/car-parts";
import { CarCore } from "./sections/car-core";
import { VillaSuite } from "./sections/villa-suite";
import { VillaHomemaking } from "./sections/villa-homemaking";
import { CeoOutfit } from "./sections/ceo-outfit";
import { CeoSports } from "./sections/ceo-sports";
import { HqBuilding } from "./sections/hq-building";
import { Blueprints } from "./sections/blueprints";

function SectionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">{label}</span>
        <div className="flex-1 h-px bg-slate-700/60" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function CalcContent({ resetKey }: { resetKey: number }) {
  const { loading, error } = useCalcTables();

  if (loading) return <div className="flex items-center justify-center py-24"><p className="text-slate-400">Loading calculator data…</p></div>;
  if (error) return <div className="flex items-center justify-center py-24"><p className="text-red-400">Error: {error}</p></div>;

  return (
    <div key={resetKey} className="space-y-10">
      <SectionGroup label="Artist">
        <Artists />
        <Assets />
      </SectionGroup>
      <SectionGroup label="HQ">
        <HqGlass />
        <HqFloors />
        <HqBuilding />
      </SectionGroup>
      <SectionGroup label="Collection">
        <CollectionGems />
        <MuseumExhibits />
      </SectionGroup>
      <SectionGroup label="Car">
        <CarParts />
        <CarCore />
      </SectionGroup>
      <SectionGroup label="Villa">
        <VillaSuite />
        <VillaHomemaking />
      </SectionGroup>
      <SectionGroup label="CEO">
        <CeoOutfit />
        <CeoSports />
      </SectionGroup>
      <SectionGroup label="Other">
        <Blueprints />
      </SectionGroup>
    </div>
  );
}

export function CalcTab() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <CalcTablesProvider>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
            Mick&apos;s Top Girl Resource Calculator
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold text-white">Level Progression Cost Calculator</h1>
          <p className="mt-2 text-slate-300">Only complete levels are available</p>
          <button
            onClick={() => setResetKey((k) => k + 1)}
            className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500"
          >
            Reset All
          </button>
        </header>
        <CalcContent resetKey={resetKey} />
      </div>
    </CalcTablesProvider>
  );
}
