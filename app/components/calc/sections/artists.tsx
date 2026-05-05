"use client";

import { useState, useMemo, useEffect } from "react";
import { useCalcTables, useCalcSummary } from "../calc-context";
import { vlookupDiff } from "../vlookup";
import { CalculatorSection } from "../calculator-section";
import { LevelRangeInput } from "../inputs/level-range-input";
import { ResultDisplay } from "../result-display";
import { DropdownInput } from "../inputs/dropdown-input";

export function Artists() {
  const { tables } = useCalcTables();
  const { registerResults } = useCalcSummary();
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(160);
  const [artist, setArtist] = useState("None");

  const artistOptions = useMemo(() => {
    if (!tables?.artistMods) return ["None"];
    return ["None", ...tables.artistMods.data.map((row) => String(row[0]))];
  }, [tables]);

  const artistOptionLabels = useMemo(() => {
    if (!tables?.artistMods) return ["None"];
    return [
      "None",
      ...tables.artistMods.data.map((row) => {
        const name = String(row[0]);
        const mod = typeof row[1] === "number" ? row[1] : 0;
        return mod === 0 ? name : `${name} (+${mod}%)`;
      }),
    ];
  }, [tables]);

  const modifier = useMemo(() => {
    if (!tables?.artistMods || artist === "None") return 1;
    const row = tables.artistMods.data.find((r) => String(r[0]) === artist);
    if (!row) return 1;
    const val = typeof row[1] === "number" ? row[1] : Number(row[1]);
    return isNaN(val) ? 1 : 1 + val / 100;
  }, [tables, artist]);

  const exp = useMemo(() => {
    if (!tables?.artists) return null;
    const base = vlookupDiff(from - 1, to - 1, tables.artists.data, 3);
    return base == null ? null : Math.ceil(base * modifier);
  }, [tables, from, to, modifier]);

  const promo = useMemo(() => {
    if (!tables?.artists) return null;
    const base = vlookupDiff(from - 1, to - 1, tables.artists.data, 5);
    return base == null ? null : Math.ceil(base * modifier);
  }, [tables, from, to, modifier]);

  useEffect(() => {
    registerResults("Artists", [
      { label: "EXP Cards", value: exp },
      { label: "Promotion Cards", value: promo },
    ]);
  }, [exp, promo, registerResults]);

  return (
    <CalculatorSection title="Artists" color="pink">
      <LevelRangeInput from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      <DropdownInput label="Artist" value={artist} options={artistOptions} optionLabels={artistOptionLabels} onChange={setArtist} />
      <ResultDisplay
        accentClass="text-pink-300"
        results={[
          { label: "EXP Cards", value: exp },
          { label: "Promotion Cards", value: promo },
        ]}
      />
    </CalculatorSection>
  );
}
