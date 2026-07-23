"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Member = { id: string; name: string; join_date: string };

const GEOLOCATION_TIMEOUT_MS = 8000;

function getCurrentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null), // declined or unavailable — treated as Unknown, never blocks (BR-02)
      { timeout: GEOLOCATION_TIMEOUT_MS },
    );
  });
}

export function CheckinForm({ token, members }: { token: string; members: Member[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [keyword, setKeyword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const matches = useMemo(() => {
    if (selected || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, selected, members]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !keyword.trim()) return;

    setSubmitting(true);
    setResult(null);

    const position = await getCurrentPosition();
    const supabase = createClient();
    const { data, error } = await supabase
      .rpc("submit_checkin", {
        p_link_token: token,
        p_member_id: selected.id,
        p_keyword: keyword.trim(),
        p_lat: position?.coords.latitude,
        p_lng: position?.coords.longitude,
      })
      .single();

    setSubmitting(false);

    if (error) {
      setResult({ ok: false, message: "Something went wrong. Please try again." });
      return;
    }

    switch (data.outcome) {
      case "created":
        setResult({ ok: true, message: `Checked in, ${selected.name}. Thank you!` });
        break;
      case "duplicate":
        setResult({
          ok: true,
          message: `${selected.name} is already checked in (submitted ${new Date(data.submitted_at!).toLocaleTimeString()}).`,
        });
        break;
      case "wrong_keyword":
        setResult({ ok: false, message: "That keyword doesn't match this session." });
        break;
      case "not_open":
        setResult({ ok: false, message: "This session has closed." });
        break;
      default:
        setResult({ ok: false, message: "Could not check you in. Please try again." });
    }
  }

  if (result) {
    return (
      <Alert tone={result.ok ? "success" : "error"} className="mt-4">
        {result.message}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-1">
        <label htmlFor="member-search" className="text-sm font-medium text-neutral-700">
          Your name
        </label>
        {selected ? (
          <div className="flex items-center justify-between rounded-md border border-neutral-300 px-3 py-2 text-sm">
            <span>
              {selected.name} <span className="text-neutral-400">— joined {selected.join_date}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
              className="text-xs text-brand underline"
            >
              change
            </button>
          </div>
        ) : (
          <>
            <input
              id="member-search"
              type="text"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Start typing your name..."
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {matches.length > 0 && (
              <ul className="mt-1 divide-y divide-neutral-100 rounded-md border border-neutral-200">
                {matches.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                    >
                      {m.name} <span className="text-neutral-400">— joined {m.join_date}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="keyword" className="text-sm font-medium text-neutral-700">
          Session keyword
        </label>
        <input
          id="keyword"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm uppercase focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <Button type="submit" disabled={!selected || !keyword.trim() || submitting} fullWidth>
        {submitting ? "Checking in..." : "Check in"}
      </Button>
    </form>
  );
}
