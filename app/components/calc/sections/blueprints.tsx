"use client";

import { useState, useMemo } from "react";
import { useCalcTables } from "../calc-context";
import { vlookupDiffMulti, vlookup } from "../vlookup";
import { CalculatorSection } from "../calculator-section";
import { LevelRangeInput } from "../inputs/level-range-input";
import { DropdownInput } from "../inputs/dropdown-input";
import { ResultDisplay } from "../result-display";

export function BlueprintsMain() {
  const { tables } = useCalcTables();

  const [selectedTier, setSelectedTier] = useState("Tier 21");
  const tierOptions = useMemo(
    () => tables?.blueprintsMain?.data.map((r) => String(r[0])) ?? [],
    [tables]
  );
  const tierTotal = useMemo(() => {
    if (!tables?.blueprintsMain) return null;
    return vlookup(selectedTier, tables.blueprintsMain.data, 2);
  }, [tables, selectedTier]);

  return (
    <CalculatorSection title="Blueprints" color="sky">
      <DropdownInput
        label="Tier"
        value={selectedTier}
        options={tierOptions}
        onChange={setSelectedTier}
      />
      <ResultDisplay
        accentClass="text-sky-300"
        results={[{ label: "Total Blueprints", value: tierTotal }]}
      />
    </CalculatorSection>
  );
}

export function BlueprintsGroupBattle() {
  const { tables } = useCalcTables();

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);
  const maxLevel = useMemo(
    () => (tables?.blueprintsBattle ? tables.blueprintsBattle.data.length - 1 : 10),
    [tables]
  );
  const results = useMemo(() => {
    if (!tables?.blueprintsBattle) return [];
    const labels = tables.blueprintsBattle.headers.slice(1) as string[];
    const diffs = vlookupDiffMulti(from, to, tables.blueprintsBattle.data, labels.length);
    return labels.map((label, i) => ({ label, value: diffs[i] }));
  }, [tables, from, to]);

  return (
    <CalculatorSection title="Group Battle" color="sky">
      <LevelRangeInput
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        min={0}
        max={maxLevel}
      />
      <ResultDisplay accentClass="text-sky-300" results={results} />
    </CalculatorSection>
  );
}

export function BlueprintsExpansion() {
  const { tables } = useCalcTables();

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(10);
  const maxLevel = useMemo(
    () => (tables?.blueprintsExpansion ? tables.blueprintsExpansion.data.length - 1 : 10),
    [tables]
  );
  const results = useMemo(() => {
    if (!tables?.blueprintsExpansion) return [];
    const labels = tables.blueprintsExpansion.headers.slice(1) as string[];
    const diffs = vlookupDiffMulti(from, to, tables.blueprintsExpansion.data, labels.length);
    return labels.map((label, i) => ({ label, value: diffs[i] }));
  }, [tables, from, to]);

  return (
    <CalculatorSection title="Expansion" color="sky">
      <LevelRangeInput
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        min={0}
        max={maxLevel}
      />
      <ResultDisplay accentClass="text-sky-300" results={results} />
    </CalculatorSection>
  );
}
