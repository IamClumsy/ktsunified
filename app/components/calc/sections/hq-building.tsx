"use client";

import { useState, useMemo, useEffect } from "react";
import { useCalcTables, useCalcSummary } from "../calc-context";
import { vlookupDiff } from "../vlookup";
import { CalculatorSection } from "../calculator-section";
import { LevelRangeInput } from "../inputs/level-range-input";
import { ResultDisplay } from "../result-display";

export function HqBuilding() {
  const { tables } = useCalcTables();
  const { registerResults } = useCalcSummary();
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(14);

  const cards = useMemo(() => {
    if (!tables?.buildingCards) return null;
    return vlookupDiff(from - 1, to - 1, tables.buildingCards.data, 3);
  }, [tables, from, to]);

  const gold = useMemo(() => {
    if (!tables?.buildingGold) return null;
    return vlookupDiff(from - 1, to - 1, tables.buildingGold.data, 3);
  }, [tables, from, to]);

  useEffect(() => {
    registerResults("HQ Building", [
      { label: "Building Cards", value: cards },
      { label: "Business Building Gold", value: gold },
    ]);
  }, [cards, gold, registerResults]);

  return (
    <CalculatorSection title="HQ Building" note="*Max level 14" color="violet">
      <LevelRangeInput from={from} to={to} onFromChange={setFrom} onToChange={setTo} min={1} max={14} />
      <ResultDisplay
        accentClass="text-violet-300"
        results={[
          { label: "Building Cards", value: cards },
          { label: "Business Building Gold", value: gold },
        ]}
      />
    </CalculatorSection>
  );
}
