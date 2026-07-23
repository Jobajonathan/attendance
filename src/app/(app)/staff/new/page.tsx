"use client";

import { useActionState } from "react";
import { inviteStaff } from "../actions";
import { ROLE_LABELS } from "@/lib/roles";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function InviteStaffPage() {
  const [state, formAction, pending] = useActionState(inviteStaff, null);

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Invite staff"
        description="They'll get an email to set up their password and sign in."
      />

      <form action={formAction} className="mt-6 space-y-4">
        <Field label="Full name" name="full_name" type="text" required />
        <Field label="Email" name="email" type="email" required />

        <div className="space-y-1">
          <label htmlFor="role" className="text-sm font-medium text-neutral-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue=""
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="" disabled>
              Choose a role
            </option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {state?.error && <Alert tone="error">{state.error}</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? "Sending invite..." : "Send invite"}
        </Button>
      </form>
    </div>
  );
}
