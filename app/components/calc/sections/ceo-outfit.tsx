"use client";

import { useState, useMemo, useEffect } from "react";
import { useCalcTables } from "../calc-context";
import { CalculatorSection } from "../calculator-section";
import { DropdownInput } from "../inputs/dropdown-input";
import { ResultDisplay } from "../result-display";

export function CeoOutfit() {
  const { tables } = useCalcTables();

  const steps = useMemo(() => {
    if (!tables?.ceoOutfit) return [];
    return tables.ceoOutfit.data.map((row) => String(row[0]));
  }, [tables]);

  const [from, setFrom] = useState("Essential");
  const [to, setTo] = useState("Signature GC2");

  useEffect(() => {
    if (steps.length > 0) {
      if (!steps.includes(from)) setFrom(steps[0]);
      if (!steps.includes(to)) setTo(steps[steps.length - 1]);
    }
  }, [steps]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    if (!tables?.ceoOutfit || steps.length === 0) return null;
    const fromIdx = steps.indexOf(from);
    const toIdx = steps.indexOf(to);
    if (fromIdx < 0 || toIdx < 0 || fromIdx > toIdx) return null;
    let bankCards = 0, droids = 0, crownCards = 0;
    for (let i = fromIdx; i <= toIdx; i++) {
      const row = tables.ceoOutfit.data[i];
      bankCards += typeof row[1] === "number" ? row[1] : 0;
      droids += typeof row[2] === "number" ? row[2] : 0;
      crownCards += typeof row[3] === "number" ? row[3] : 0;
    }
    return { bankCards, droids, crownCards };
  }, [tables, steps, from, to]);

  return (
    <CalculatorSection title="CEO Outfit" note="*Bank Cards per Item (per outfit piece)" color="pink">
      <div className="grid grid-cols-2 gap-3">
        <DropdownInput label="From Step" value={from} options={steps} onChange={setFrom} />
        <DropdownInput label="To Step" value={to} options={steps} onChange={setTo} />
      </div>
      <ResultDisplay
        accentClass="text-pink-300"
        results={[
          { label: "Bank Cards per Item", value: results?.bankCards ?? null },
          { label: "Droids (all 4 items)", value: results?.droids ?? null },
          { label: "Crown Cards", value: results?.crownCards ?? null },
        ]}
      />
    </CalculatorSection>
  );
}
