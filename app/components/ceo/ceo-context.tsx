"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { TablesData } from "./types";
export type { Task, Category, EventData, TablesData } from "./types";

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

export function CeoTablesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TablesState>({
    tables: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data/ceo-tables.json");
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

export function useCeoTables() {
  return useContext(TablesContext);
}
