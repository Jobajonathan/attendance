"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    if (typeof email !== "string" || !email) return;

    setSubmitting(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    // Always show the same message regardless of outcome, so this form can't
    // be used to check which emails have an account (no user enumeration).
    setSent(true);
  }

  if (sent) {
    return (
      <>
        <Alert tone="success">
          If that email has an account, a password reset link is on its way. Check your inbox.
        </Alert>
        <Link href="/login" className="mt-4 block text-center text-sm text-brand hover:underline">
          Back to sign in
        </Link>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" name="email" type="email" required autoComplete="email" />

      <Button type="submit" disabled={submitting} fullWidth>
        {submitting ? "Sending..." : "Send reset link"}
      </Button>

      <Link href="/login" className="block text-center text-sm text-neutral-500 hover:text-brand">
        Back to sign in
      </Link>
    </form>
  );
}
