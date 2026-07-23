"use client";

import { useActionState } from "react";
import { closeActivity, reopenActivity } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

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
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Closing..." : "Close now"}
      </Button>
      {state?.error && (
        <Alert tone="error" className="mt-1">
          {state.error}
        </Alert>
      )}
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
          <label htmlFor="reason" className="text-sm font-medium text-neutral-700">
            Reason (required — this activity closed on a different day)
          </label>
          <textarea
            id="reason"
            name="reason"
            required
            rows={2}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      )}
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Reopening..." : "Reopen"}
      </Button>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}
