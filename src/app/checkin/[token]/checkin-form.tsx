"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Member = { id: string; name: string; join_date: string };

const GEOLOCATION_TIMEOUT_MS = 8000;

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("not_supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("denied")), {
      timeout: GEOLOCATION_TIMEOUT_MS,
    });
  });
}

export function CheckinForm({ token, members }: { token: string; members: Member[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [keyword, setKeyword] = useState("");
  const [noLocation, setNoLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationError, setLocationError] = useState("");
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
    setLocationError("");

    // Location sharing is required to check in by default — sharing your
    // device's location is how attendance gets recorded. The "I'm unable to
    // share my location" checkbox skips this entirely, but only works with
    // the separate alternate keyword issued for that mode; the regular
    // keyword still requires location.
    let position: GeolocationPosition | null = null;
    if (!noLocation) {
      try {
        position = await getCurrentPosition();
      } catch {
        setSubmitting(false);
        setLocationError(
          "Location access is required to check in. Please allow location sharing in your browser, or use the alternate keyword if you're unable to share it.",
        );
        return;
      }
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .rpc("submit_checkin", {
        p_link_token: token,
        p_member_id: selected.id,
        p_keyword: keyword.trim(),
        p_lat: position?.coords.latitude,
        p_lng: position?.coords.longitude,
        p_no_location: noLocation,
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
        {noLocation && (
          <p className="text-xs text-neutral-500">
            Use the alternate keyword your Administrative Officer gave you for this mode — it&apos;s
            different from the regular check-in keyword.
          </p>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={noLocation}
          onChange={(e) => setNoLocation(e.target.checked)}
          className="mt-0.5 rounded border-neutral-300 text-brand focus:ring-brand"
        />
        I&apos;m unable to share my location for this check-in
      </label>

      <p className="text-xs text-neutral-500">
        {noLocation
          ? "Location won't be requested for this check-in."
          : "You'll be asked to share your location — this is required to check in."}
      </p>

      {locationError && <Alert tone="error">{locationError}</Alert>}

      <Button type="submit" disabled={!selected || !keyword.trim() || submitting} fullWidth>
        {submitting ? "Checking in..." : "Check in"}
      </Button>
    </form>
  );
}
