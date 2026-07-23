"use client";

import { useActionState } from "react";
import { closeActivity, reopenActivity } from "./actions";

export function CloseActivityButton({ activityId }: { activityId: string }) {
  const boundAction = closeActivity.bind(null, activityId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Close this activity now? Members who haven't checked in will be marked absent.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? "Closing..." : "Close now"}
      </button>
      {state?.error && <p className="mt-1 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export function ReopenActivityButton({ activityId }: { activityId: string }) {
  const boundAction = reopenActivity.bind(null, activityId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  return (
    <form action={formAction} className="space-y-2">
      {state?.reasonRequired && (
        <div className="space-y-1">
          <label htmlFor="reason" className="text-sm font-medium text-zinc-700">
            Reason (required — this activity closed on a different day)
          </label>
          <textarea
            id="reason"
            name="reason"
            required
            rows={2}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
      >
        {pending ? "Reopening..." : "Reopen"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
