"use client";

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

function CalcContent() {
  const { loading, error } = useCalcTables();

  if (loading) return <div className="flex items-center justify-center py-24"><p className="text-slate-400">Loading calculator data…</p></div>;
  if (error) return <div className="flex items-center justify-center py-24"><p className="text-red-400">Error: {error}</p></div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Artists />
      <Assets />
      <HqGlass />
      <HqFloors />
      <CollectionGems />
      <MuseumExhibits />
      <CarParts />
      <CarCore />
      <VillaSuite />
      <VillaHomemaking />
      <CeoOutfit />
      <CeoSports />
      <HqBuilding />
    </div>
  );
}

export function CalcTab() {
  return (
    <CalcTablesProvider>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
            Mick&apos;s Top Girl Resource Calculator
          </p>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold text-white">Level Progression Cost Calculator</h1>
          <p className="mt-2 text-slate-300">Only complete levels are available</p>
        </header>
        <CalcContent />
      </div>
    </CalcTablesProvider>
  );
}
