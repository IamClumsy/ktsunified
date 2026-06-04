"use client";

import { useEffect, useRef } from "react";

type Options = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Minimum horizontal distance in px to trigger a swipe (default 60) */
  threshold?: number;
  /** Maximum vertical drift allowed before cancelling (default 80) */
  maxVertical?: number;
};

/**
 * Attaches touch-swipe listeners to the document.
 * Swipe left → next tab, swipe right → previous tab.
 * Ignored when the touch starts inside a scrollable element (e.g. filter sheet).
 */
export function useSwipeNav({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  maxVertical = 80,
}: Options) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      if (startX.current === null || startY.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - startY.current);

      // Ignore mostly-vertical swipes and short swipes
      if (dy > maxVertical || Math.abs(dx) < threshold) {
        startX.current = null;
        startY.current = null;
        return;
      }

      // Ignore swipes that start inside a scrollable area (e.g. bottom sheet)
      const target = e.target as HTMLElement;
      if (target.closest('[role="dialog"]')) {
        startX.current = null;
        startY.current = null;
        return;
      }

      if (dx < 0) onSwipeLeft();
      else onSwipeRight();

      startX.current = null;
      startY.current = null;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, maxVertical]);
}
