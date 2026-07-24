"use client";

import { useTheme } from "next-themes";
import { useMounted } from "@/lib/use-mounted";

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm7 3a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM4 9a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h1Zm10.36-4.36a1 1 0 0 1 1.42 1.42l-.71.7a1 1 0 1 1-1.41-1.41l.7-.71ZM6.34 13.66a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 0 1-1.42-1.42l.71-.7Zm8.02 1.41a1 1 0 0 1-1.42 1.42l-.7-.71a1 1 0 0 1 1.41-1.41l.71.7ZM5.64 4.34a1 1 0 0 1 1.41 1.41l-.7.71a1 1 0 1 1-1.42-1.42l.71-.7ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M17.3 13.4a7.5 7.5 0 0 1-9.7-9.7 1 1 0 0 0-1.2-1.3A8.5 8.5 0 1 0 18.6 14.6a1 1 0 0 0-1.3-1.2Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // The server can't know the visitor's stored/system theme preference, so
  // render a stable placeholder until mounted client-side — avoids the
  // hydration mismatch without an effect-driven setState.
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-7 w-7" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
