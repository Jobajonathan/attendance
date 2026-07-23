"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function FollowUpForm({
  token,
  memberName,
  alreadyDone,
}: {
  token: string;
  memberName: string;
  alreadyDone: boolean;
}) {
  const [feedbackNote, setFeedbackNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .rpc("submit_follow_up_feedback", {
        p_token: token,
        p_feedback_note: feedbackNote.trim() || undefined,
      })
      .single();

    setSubmitting(false);

    if (error) {
      setResult({ ok: false, message: "Something went wrong. Please try again." });
      return;
    }

    switch (data.outcome) {
      case "created":
        setResult({ ok: true, message: `Thanks — your feedback on ${memberName} has been recorded.` });
        break;
      case "already_done":
        setResult({ ok: true, message: "This follow-up was already marked done." });
        break;
      case "invalid_link":
        setResult({ ok: false, message: "This follow-up link isn't valid." });
        break;
      default:
        setResult({ ok: false, message: "Could not submit your feedback. Please try again." });
    }
  }

  if (result) {
    return (
      <Alert tone={result.ok ? "success" : "error"} className="mt-4">
        {result.message}
      </Alert>
    );
  }

  if (alreadyDone) {
    return (
      <Alert tone="info" className="mt-4">
        This follow-up was already marked done.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-1">
        <label htmlFor="feedback-note" className="text-sm font-medium text-neutral-700">
          How did it go? (optional)
        </label>
        <textarea
          id="feedback-note"
          value={feedbackNote}
          onChange={(e) => setFeedbackNote(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <Button type="submit" disabled={submitting} fullWidth>
        {submitting ? "Submitting..." : "Mark as done"}
      </Button>
    </form>
  );
}
