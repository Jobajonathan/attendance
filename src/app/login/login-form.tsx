"use client";

import { useActionState } from "react";
import { signIn } from "./actions";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Password" name="password" type="password" required autoComplete="current-password" />

      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Button type="submit" disabled={pending} fullWidth>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
