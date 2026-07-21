"use client";

import { useActionState } from "react";
import type { Tables } from "@/lib/supabase/database.types";

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
        <label htmlFor="status_manual" className="text-sm font-medium text-zinc-700">
          Status override
        </label>
        <select
          id="status_manual"
          name="status_manual"
          defaultValue={member.status_manual ?? ""}
          disabled={!canManage}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none disabled:bg-zinc-100"
        >
          <option value="">Active (no override)</option>
          <option value="transferred">Transferred</option>
          <option value="inactive">Inactive (deactivated)</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state && !state.error && <p className="text-sm text-emerald-600">Saved.</p>}

      {canManage && (
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type,
  defaultValue,
  disabled,
  required,
}: {
  label: string;
  name: string;
  type: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        required={required}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none disabled:bg-zinc-100"
      />
    </div>
  );
}
