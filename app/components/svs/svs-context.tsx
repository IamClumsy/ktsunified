"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ShopItem = {
  inCart: boolean;
  item: string;
  quantity: number;
  price: number;
};

export type ShopData = {
  title: string;
  items: ShopItem[];
};

export type TablesData = Record<string, ShopData>;

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

export function SvsTablesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TablesState>({
    tables: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data/svs-tables.json");
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

export function useSvsTables() {
  return useContext(TablesContext);
}
