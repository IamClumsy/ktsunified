"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type TableRange = {
  headers: (string | null)[];
  data: unknown[][];
};

export type TablesData = Record<string, TableRange>;

type TablesState = {
  tables: TablesData | null;
  loading: boolean;
  error: string | null;
};

const TablesContext = createContext<TablesState>({
  tables: null,
  loading: true,
  error: null,
});

export function CalcTablesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TablesState>({
    tables: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/calc-tables");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setState({ tables: data, loading: false, error: null });
      } catch (err) {
        setState({ tables: null, loading: false, error: String(err) });
      }
    })();
  }, []);

  return (
    <TablesContext.Provider value={state}>{children}</TablesContext.Provider>
  );
}

export function useCalcTables() {
  return useContext(TablesContext);
}

// ── Summary registry ──────────────────────────────────────────────────────────

export type ResultEntry = { label: string; value: number | null };

type SummaryContextType = {
  registry: Record<string, ResultEntry[]>;
  registerResults: (key: string, results: ResultEntry[]) => void;
};

const SummaryContext = createContext<SummaryContextType>({
  registry: {},
  registerResults: () => {},
});

export function CalcSummaryProvider({ children }: { children: ReactNode }) {
  const [registry, setRegistry] = useState<Record<string, ResultEntry[]>>({});

  const registerResults = useCallback((key: string, results: ResultEntry[]) => {
    setRegistry((prev) => {
      const existing = prev[key];
      if (
        existing &&
        existing.length === results.length &&
        existing.every((r, i) => r.label === results[i].label && r.value === results[i].value)
      ) {
        return prev;
      }
      return { ...prev, [key]: results };
    });
  }, []);

  return (
    <SummaryContext.Provider value={{ registry, registerResults }}>
      {children}
    </SummaryContext.Provider>
  );
}

export function useCalcSummary() {
  return useContext(SummaryContext);
}
