"use client";

import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

// SSR/CSR hydration-mismatch guard: components that read browser-only APIs
// (matchMedia, navigator.share, etc.) should render a stable placeholder
// until this flips true on the client.
export function useMounted(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}
