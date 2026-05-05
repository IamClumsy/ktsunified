"use client";

import { useState, useMemo } from "react";
import { useCalcTables } from "../calc-context";
import { vlookupDiff, vlookup } from "../vlookup";
import { CalculatorSection } from "../calculator-section";
import { LevelRangeInput } from "../inputs/level-range-input";
import { DropdownInput } from "../inputs/dropdown-input";
import { ResultDisplay } from "../result-display";

export function Blueprints() {
  const { tables } = useCalcTables();

  // Main blueprints — tier total reference
  const [selectedTier, setSelectedTier] = useState("Tier 1");
  const tierOptions = useMemo(
    () => tables?.blueprintsMain?.data.map((r) => String(r[0])) ?? [],
    [tables]
  );
  const tierTotal = useMemo(() => {
    if (!tables?.blueprintsMain) return null;
    return vlookup(selectedTier, tables.blueprintsMain.data, 2);
  }, [tables, selectedTier]);

  // Master Group Battle
  const [battleFrom, setBattleFrom] = useState(0);
  const [battleTo, setBattleTo] = useState(9);
  const maxBattleLevel = useMemo(
    () => tables?.blueprintsBattle ? tables.blueprintsBattle.data.length - 1 : 9,
    [tables]
  );
  const battleCost = useMemo(() => {
    if (!tables?.blueprintsBattle) return null;
    return vlookupDiff(battleFrom, battleTo, tables.blueprintsBattle.data, 3);
  }, [tables, battleFrom, battleTo]);

  // Master Expansion
  const [expansionFrom, setExpansionFrom] = useState(0);
  const [expansionTo, setExpansionTo] = useState(9);
  const maxExpansionLevel = useMemo(
    () => tables?.blueprintsExpansion ? tables.blueprintsExpansion.data.length - 1 : 9,
    [tables]
  );
  const expansionCost = useMemo(() => {
    if (!tables?.blueprintsExpansion) return null;
    return vlookupDiff(expansionFrom, expansionTo, tables.blueprintsExpansion.data, 3);
  }, [tables, expansionFrom, expansionTo]);

  return (
    <CalculatorSection title="Blueprints" color="sky">
      {/* Main blueprints tier reference */}
      <p className="text-xs text-slate-400 uppercase tracking-widest">Main Blueprints — Total per Tier</p>
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

      {/* Master Group Battle */}
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-4">Master — Group Battle</p>
      <LevelRangeInput
        from={battleFrom}
        to={battleTo}
        onFromChange={setBattleFrom}
        onToChange={setBattleTo}
        min={0}
        max={maxBattleLevel}
      />
      <ResultDisplay
        accentClass="text-sky-300"
        results={[{ label: "Blueprints", value: battleCost }]}
      />

      {/* Master Expansion */}
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-4">Master — Expansion</p>
      <LevelRangeInput
        from={expansionFrom}
        to={expansionTo}
        onFromChange={setExpansionFrom}
        onToChange={setExpansionTo}
        min={0}
        max={maxExpansionLevel}
      />
      <ResultDisplay
        accentClass="text-sky-300"
        results={[{ label: "Blueprints", value: expansionCost }]}
      />
    </CalculatorSection>
  );
}
