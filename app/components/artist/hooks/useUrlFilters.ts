"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type UrlFilterKey =
  | "search"
  | "genre"
  | "role"
  | "skill2"
  | "skill3"
  | "grade"
  | "sort"
  | "view"
  | "collection";

/**
 * Reads a filter value from the URL search params.
 * Returns "" if not present.
 */
export function useUrlFilterValues(): Record<UrlFilterKey, string> {
  const params = useSearchParams();
  return {
    search: params.get("search") ?? "",
    genre: params.get("genre") ?? "",
    role: params.get("role") ?? "",
    skill2: params.get("skill2") ?? "",
    skill3: params.get("skill3") ?? "",
    grade: params.get("grade") ?? "",
    sort: params.get("sort") ?? "",
    view: params.get("view") ?? "",
    collection: params.get("collection") ?? "",
  };
}

/**
 * Returns a stable setter that updates URL params without a full navigation.
 *
 * Reads the current params from window.location at call time (not from a
 * cached/ref-synced value) so that rapid-fire updates — e.g. a filter change
 * still in flight inside startTransition when "Clear all" fires — always
 * build on top of whatever the URL actually is, instead of a stale snapshot
 * that could resurrect filters right after they were cleared.
 */
export function useSetUrlFilter() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (updates: Partial<Record<UrlFilterKey, string>>) => {
      const next = new URLSearchParams(window.location.search);
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
