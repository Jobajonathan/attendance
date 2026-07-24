"use client";

import { useEffect, useRef, useState } from "react";

export function UserMenu({ fullName, roleLabel }: { fullName: string; roleLabel: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = fullName.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={`${fullName} · ${roleLabel}`}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-52 rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:bg-neutral-100">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-neutral-900">{fullName}</p>
            <p className="truncate text-xs text-neutral-500">{roleLabel}</p>
          </div>
          <div className="border-t border-neutral-100" />
          <form action="/logout" method="post">
            <button
              type="submit"
              className="w-full px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50 hover:text-brand"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
