"use client";

import { useActionState } from "react";
import type { Tables } from "@/lib/supabase/database.types";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Action = (prevState: { error: string } | null, formData: FormData) => Promise<{ error: string }>;

export default function EditMemberForm({
  member,
  action,
  canManage,
}: {
  member: Tables<"members">;
  action: Action;
  canManage: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Field label="Name" name="name" type="text" defaultValue={member.name} disabled={!canManage} required />
      <Field
        label="Phone number"
        name="phone_number"
        type="tel"
        defaultValue={member.phone_number ?? ""}
        disabled={!canManage}
      />
      <Field label="Gender" name="gender" type="text" defaultValue={member.gender ?? ""} disabled={!canManage} />
      <Field
        label="Birthday"
        name="birthday"
        type="date"
        defaultValue={member.birthday ?? ""}
        disabled={!canManage}
      />
      <Field
        label="Wedding anniversary"
        name="anniversary_date"
        type="date"
        defaultValue={member.anniversary_date ?? ""}
        disabled={!canManage}
      />

      <div className="space-y-1">
        <label htmlFor="status_manual" className="text-sm font-medium text-neutral-700">
          Status override
        </label>
        <select
          id="status_manual"
          name="status_manual"
          defaultValue={member.status_manual ?? ""}
          disabled={!canManage}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-neutral-100"
        >
          <option value="">Active (no override)</option>
          <option value="transferred">Transferred</option>
          <option value="inactive">Inactive (deactivated)</option>
        </select>
      </div>

      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state && !state.error && <Alert tone="success">Saved.</Alert>}

      {canManage && (
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      )}
    </form>
  );
}
