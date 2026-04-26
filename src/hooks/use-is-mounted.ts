"use client";

import { useSyncExternalStore } from "react";

// Stable empty subscribe — value never changes after the first client render.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns `false` during SSR / first server render, `true` once the
 * component is mounted on the client. Use this to gate browser-only code
 * (e.g. `createPortal`, `localStorage` reads) without the classic
 * `useState + useEffect(setMounted(true))` pattern, which lint flags as
 * "setState inside effect".
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
