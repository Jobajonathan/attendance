"use client";

import { useActionState } from "react";
import { assignFollowUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function AssignFollowUpForm({ memberId }: { memberId: string }) {
  const boundAction = assignFollowUp.bind(null, memberId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-1">
      <input
        type="text"
        name="assignee_name"
        placeholder="Assignee name"
        required
        className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <input
        type="tel"
        name="assignee_phone"
        placeholder="Phone (optional)"
        className="w-28 rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
      />
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Assigning..." : "Assign"}
      </Button>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}
