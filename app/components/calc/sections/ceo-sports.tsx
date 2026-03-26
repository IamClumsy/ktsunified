"use client";

import { useState, useMemo } from "react";
import { useCalcTables } from "../calc-context";
import { vlookupDiff } from "../vlookup";
import { CalculatorSection } from "../calculator-section";
import { DropdownInput } from "../inputs/dropdown-input";
import { LevelRangeInput } from "../inputs/level-range-input";
import { ResultDisplay } from "../result-display";

const TIER_OPTIONS = ["1", "2", "3", "4"];
const HQ_MULTIPLIER = 125;

export function CeoSports() {
  const { tables } = useCalcTables();
  const [tier, setTier] = useState("3");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(60);

  const tierNum = Number(tier);
  const isHQ = tierNum === 4;

  const drinks = useMemo(() => {
    if (!tables?.ceoSports) return null;
    return vlookupDiff(from - 1, to - 1, tables.ceoSports.data, tierNum * 2);
  }, [tables, from, to, tierNum]);

  const bars = useMemo(() => {
    if (!tables?.ceoSports) return null;
    return vlookupDiff(from - 1, to - 1, tables.ceoSports.data, tierNum * 2 + 1);
  }, [tables, from, to, tierNum]);

  return (
    <CalculatorSection title="CEO Sports" color="pink">
      <DropdownInput label="Tier" value={tier} options={TIER_OPTIONS} onChange={setTier} />
      <LevelRangeInput from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
      <ResultDisplay
        accentClass="text-pink-300"
        results={[
          {
            label: isHQ ? "HQ Energy Drink" : "Energy Drink",
            value: drinks,
            equivalent: isHQ && drinks != null ? { label: "Energy Drink", value: drinks * HQ_MULTIPLIER } : null,
          },
          {
            label: isHQ ? "HQ Protein Bar" : "Protein Bar",
            value: bars,
            equivalent: isHQ && bars != null ? { label: "Protein Bar", value: bars * HQ_MULTIPLIER } : null,
          },
        ]}
      />
    </CalculatorSection>
  );
}
