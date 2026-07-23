"use client";

import { useActionState } from "react";
import { generateRegistrationLink, setRegistrationLinkActive } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function GenerateLinkButton() {
  const [state, formAction, pending] = useActionState(generateRegistrationLink, null);
  return (
    <form action={formAction}>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Generating..." : "Generate new link"}
      </Button>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}

export function ToggleLinkButton({ linkId, isActive }: { linkId: string; isActive: boolean }) {
  const boundAction = setRegistrationLinkActive.bind(null, linkId, !isActive);
  const [state, formAction, pending] = useActionState(boundAction, null);
  return (
    <form action={formAction}>
      <Button type="submit" variant={isActive ? "danger" : "secondary"} size="sm" disabled={pending}>
        {pending ? "Saving..." : isActive ? "Revoke" : "Reactivate"}
      </Button>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}
