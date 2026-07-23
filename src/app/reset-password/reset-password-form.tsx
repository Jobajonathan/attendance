"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Status = "checking" | "ready" | "invalid" | "submitting" | "done";

// Password reset links from Supabase Auth carry the recovery token in the URL
// fragment, which never reaches the server — so this whole flow has to run
// client-side. supabase-js auto-detects that fragment on load and fires
// PASSWORD_RECOVERY once the session is established.
export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus((s) => (s === "checking" ? "ready" : s));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });

    const timeout = setTimeout(() => {
      setStatus((s) => (s === "checking" ? "invalid" : s));
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setStatus("submitting");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setStatus("ready");
      return;
    }

    setStatus("done");
    setTimeout(() => router.push("/"), 1500);
  }

  if (status === "checking") {
    return <p className="text-sm text-neutral-500">Verifying your reset link...</p>;
  }

  if (status === "invalid") {
    return (
      <Alert tone="error">
        This reset link is invalid or has expired. Request a new one from the sign-in page.
      </Alert>
    );
  }

  if (status === "done") {
    return <Alert tone="success">Password updated. Taking you to ProtocolOS...</Alert>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="New password" name="password" type="password" required autoComplete="new-password" />
      <Field label="Confirm new password" name="confirm" type="password" required autoComplete="new-password" />

      {error && <Alert tone="error">{error}</Alert>}

      <Button type="submit" disabled={status === "submitting"} fullWidth>
        {status === "submitting" ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
