"use client";

import { useState, useMemo, useEffect } from "react";
import { useCalcTables, useCalcSummary } from "../calc-context";
import { vlookupDiff } from "../vlookup";
import { CalculatorSection } from "../calculator-section";
import { DropdownInput } from "../inputs/dropdown-input";
import { ResultDisplay } from "../result-display";

export function CarParts() {
  const { tables } = useCalcTables();
  const { registerResults } = useCalcSummary();
  const [from, setFrom] = useState("SS3");
  const [to, setTo] = useState("SS5");

  const ranks = useMemo(() => {
    if (!tables?.carParts) return [];
    return tables.carParts.data.map((row) => String(row[0]));
  }, [tables]);

  const parts = useMemo(() => {
    if (!tables?.carParts) return null;
    return vlookupDiff(from, to, tables.carParts.data, 3);
  }, [tables, from, to]);

  const drawings = useMemo(() => {
    if (!tables?.carParts) return null;
    return vlookupDiff(from, to, tables.carParts.data, 5);
  }, [tables, from, to]);

  useEffect(() => {
    registerResults("Car Parts", [
      { label: "Parts", value: parts },
      { label: "Advance Drawings", value: drawings },
    ]);
  }, [parts, drawings, registerResults]);

  return (
    <CalculatorSection title="Car Parts" note="*Available until SSS1" color="amber">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DropdownInput label="From Rank" value={from} options={ranks} onChange={setFrom} />
        <DropdownInput label="To Rank" value={to} options={ranks} onChange={setTo} />
      </div>
      <ResultDisplay
        accentClass="text-amber-300"
        results={[
          { label: "Parts", value: parts },
          { label: "Advance Drawings", value: drawings },
        ]}
      />
    </CalculatorSection>
  );
}
