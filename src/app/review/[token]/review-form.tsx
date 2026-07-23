"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Member = { id: string; name: string; join_date: string };

const RATINGS = [1, 2, 3, 4, 5];

export function ReviewForm({ token, members }: { token: string; members: Member[] }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [keyword, setKeyword] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const matches = useMemo(() => {
    if (selected || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, selected, members]);

  const canSubmit = selected && keyword.trim() && rating && reflection.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !keyword.trim() || !rating || !reflection.trim()) return;

    setSubmitting(true);
    setResult(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .rpc("submit_message_review", {
        p_link_token: token,
        p_member_id: selected.id,
        p_keyword: keyword.trim(),
        p_rating: rating,
        p_reflection: reflection.trim(),
        p_confirmed: confirmed,
      })
      .single();

    setSubmitting(false);

    if (error) {
      setResult({ ok: false, message: "Something went wrong. Please try again." });
      return;
    }

    switch (data.outcome) {
      case "created":
        setResult({ ok: true, message: `Thank you, ${selected.name}. Your review was submitted.` });
        break;
      case "duplicate":
        setResult({
          ok: true,
          message: `${selected.name} already submitted a review for this session (${new Date(data.submitted_at!).toLocaleTimeString()}).`,
        });
        break;
      case "wrong_keyword":
        setResult({ ok: false, message: "That keyword doesn't match this session." });
        break;
      case "not_open":
        setResult({ ok: false, message: "This review window has closed." });
        break;
      case "invalid_rating":
        setResult({ ok: false, message: "Choose a rating from 1 to 5." });
        break;
      case "missing_reflection":
        setResult({ ok: false, message: "Add a short reflection before submitting." });
        break;
      default:
        setResult({ ok: false, message: "Could not submit your review. Please try again." });
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

      <div className="space-y-1">
        <span className="text-sm font-medium text-neutral-700">How would you rate today&apos;s message?</span>
        <div className="flex gap-2">
          {RATINGS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`h-9 w-9 rounded-md border text-sm font-medium ${
                rating === n
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="reflection" className="text-sm font-medium text-neutral-700">
          What stood out to you?
        </label>
        <textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          required
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="rounded border-neutral-300 text-brand focus:ring-brand"
        />
        I&apos;ll act on what I heard this week
      </label>

      <Button type="submit" disabled={!canSubmit || submitting} fullWidth>
        {submitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
