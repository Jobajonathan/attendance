"use client";

import { useActionState } from "react";
import { markContacted } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function MarkContactedButton({ memberId }: { memberId: string }) {
  const boundAction = markContacted.bind(null, memberId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  return (
    <form action={formAction}>
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Mark contacted"}
      </Button>
      {state?.error && (
        <Alert tone="error" className="mt-1">
          {state.error}
        </Alert>
      )}
    </form>
  );
}
