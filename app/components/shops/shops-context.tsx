"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ShopItem = {
  item: string;
  quantity: number;
  price: number;
  vipLevel?: number;
};

export type ShopData = {
  title: string;
  currency: string;
  items: ShopItem[];
};

export type ShopsTablesData = {
  VIP: ShopData;
  ABROAD: ShopData;
  PARKING: ShopData;
};

type ShopsState = {
  tables: ShopsTablesData | null;
  loading: boolean;
  error: string | null;
};

const ShopsContext = createContext<ShopsState>({ tables: null, loading: true, error: null });

export function ShopsTablesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopsState>({ tables: null, loading: true, error: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/data/shops-tables.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setState({ tables: data, loading: false, error: null });
      } catch (err) {
        setState({ tables: null, loading: false, error: String(err) });
      }
    })();
  }, []);

  return <ShopsContext.Provider value={state}>{children}</ShopsContext.Provider>;
}

export function useShopsTables() {
  return useContext(ShopsContext);
}
