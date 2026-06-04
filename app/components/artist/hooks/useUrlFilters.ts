"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type UrlFilterKey =
  | "search"
  | "genre"
  | "role"
  | "skill2"
  | "skill3"
  | "grade"
  | "sort"
  | "view";

/**
 * Reads a filter value from the URL search params.
 * Returns "" if not present.
 */
export function useUrlFilterValues(): Record<UrlFilterKey, string> {
  const params = useSearchParams();
  return {
    search: params.get("search") ?? "",
    genre:  params.get("genre")  ?? "",
    role:   params.get("role")   ?? "",
    skill2: params.get("skill2") ?? "",
    skill3: params.get("skill3") ?? "",
    grade:  params.get("grade")  ?? "",
    sort:   params.get("sort")   ?? "",
    view:   params.get("view")   ?? "",
  };
}

/**
 * Returns a stable setter that updates URL params without a full navigation.
 */
export function useSetUrlFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Use a ref so the callback is stable across renders
  const paramsRef = useRef(params);
  useEffect(() => { paramsRef.current = params; }, [params]);

  return useCallback(
    (updates: Partial<Record<UrlFilterKey, string>>) => {
      const next = new URLSearchParams(paramsRef.current.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );
}

/**
 * Clears all filter params from the URL.
 */
export function useClearUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);
}
