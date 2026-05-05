"use client";

import { useState, useMemo } from "react";
import { useCalcTables } from "../calc-context";
import { vlookupDiff } from "../vlookup";
import { CalculatorSection } from "../calculator-section";
import { LevelRangeInput } from "../inputs/level-range-input";
import { ResultDisplay } from "../result-display";

export function CollectionGems() {
  const { tables } = useCalcTables();
  const [from, setFrom] = useState(31);
  const [to, setTo] = useState(35);

  const gems = useMemo(() => {
    if (!tables?.gems) return null;
    return vlookupDiff(from - 1, to - 1, tables.gems.data, 3);
  }, [tables, from, to]);


  return (
    <CalculatorSection title="Collection Gems" color="sky">
      <LevelRangeInput from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      <ResultDisplay results={[{ label: "Gems", value: gems }]} accentClass="text-sky-300" />
    </CalculatorSection>
  );
}
