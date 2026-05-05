"use client";

import { useState, useMemo } from "react";
import { useCalcTables } from "../calc-context";
import { vlookupDiff } from "../vlookup";
import { CalculatorSection } from "../calculator-section";
import { DropdownInput } from "../inputs/dropdown-input";
import { LevelRangeInput } from "../inputs/level-range-input";
import { ResultDisplay } from "../result-display";

const TYPE_OPTIONS = ["Jewelry", "Car", "Property"];
const SOURCE_OPTIONS = ["Standard", "Abroad", "Auction"];

function assetCol(type: string, source: string): number {
  const sourceIdx = SOURCE_OPTIONS.indexOf(source) + 1;
  const typeIdx = TYPE_OPTIONS.indexOf(type) + 1;
  return (sourceIdx - 1) * 3 + 1 + typeIdx;
}

export function Assets() {
  const { tables } = useCalcTables();
  const [type, setType] = useState("Jewelry");
  const [source, setSource] = useState("Standard");
  const [from, setFrom] = useState(32);
  const [to, setTo] = useState(75);

  const col = assetCol(type, source);

  const assetCoins = useMemo(() => {
    if (!tables?.assets) return null;
    return vlookupDiff(from - 1, to - 1, tables.assets.data, col);
  }, [tables, from, to, col]);

  const sacrifices = useMemo(() => {
    if (!tables?.sacrifices) return null;
    return vlookupDiff(from - 1, to - 1, tables.sacrifices.data, 3);
  }, [tables, from, to]);


  return (
    <CalculatorSection title="Assets" color="pink">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DropdownInput label="Type" value={type} options={TYPE_OPTIONS} onChange={setType} />
        <DropdownInput label="Source" value={source} options={SOURCE_OPTIONS} onChange={setSource} />
      </div>
      <LevelRangeInput from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      <ResultDisplay
        accentClass="text-pink-300"
        results={[
          { label: "Asset Coins", value: assetCoins },
          { label: "Extra Assets for Promotion", value: sacrifices },
        ]}
      />
    </CalculatorSection>
  );
}
