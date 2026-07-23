"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

function subscribeNoop() {
  return () => {};
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // The server can't know the visitor's stored theme preference, so render
  // nothing until mounted client-side — useSyncExternalStore's server/client
  // snapshot split avoids the hydration mismatch without an effect-driven
  // setState.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div className="h-7 w-[132px]" />;
  }

  return (
    <div className="flex rounded-md border border-neutral-300 text-xs">
      {OPTIONS.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={`px-2 py-1 ${index > 0 ? "border-l border-neutral-300" : ""} ${
            theme === option.value
              ? "bg-brand text-brand-foreground"
              : "text-neutral-600 hover:bg-neutral-100"
          } ${index === 0 ? "rounded-l-md" : ""} ${index === OPTIONS.length - 1 ? "rounded-r-md" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
