"use client";

import Link from "next/link";
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
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs text-brand hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {state?.error && <Alert tone="error">{state.error}</Alert>}

      <Button type="submit" disabled={pending} fullWidth>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
