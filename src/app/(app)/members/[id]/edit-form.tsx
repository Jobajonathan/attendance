"use client";

import { useActionState, useState } from "react";
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
  const [maritalStatus, setMaritalStatus] = useState(member.marital_status ?? "");
  const [statusManual, setStatusManual] = useState(member.status_manual ?? "");

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
      <Field
        label="Occupation"
        name="occupation"
        type="text"
        defaultValue={member.occupation ?? ""}
        disabled={!canManage}
      />

      <div className="space-y-1">
        <label htmlFor="gender" className="text-sm font-medium text-neutral-700">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          defaultValue={member.gender ?? ""}
          disabled={!canManage}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-neutral-100"
        >
          <option value="">Not specified</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="marital_status" className="text-sm font-medium text-neutral-700">
          Marital status
        </label>
        <select
          id="marital_status"
          name="marital_status"
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
          disabled={!canManage}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-neutral-100"
        >
          <option value="">Not specified</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="widowed">Widowed</option>
          <option value="divorced">Divorced</option>
        </select>
      </div>

      <Field
        label="Birthday"
        name="birthday"
        type="date"
        defaultValue={member.birthday ?? ""}
        disabled={!canManage}
      />
      {maritalStatus === "married" && (
        <Field
          label="Wedding anniversary"
          name="anniversary_date"
          type="date"
          defaultValue={member.anniversary_date ?? ""}
          disabled={!canManage}
        />
      )}

      <div className="space-y-1">
        <label htmlFor="residential_address" className="text-sm font-medium text-neutral-700">
          Residential address
        </label>
        <textarea
          id="residential_address"
          name="residential_address"
          rows={2}
          defaultValue={member.residential_address ?? ""}
          disabled={!canManage}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-neutral-100"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="join_reason" className="text-sm font-medium text-neutral-700">
          Reason for joining the department
        </label>
        <textarea
          id="join_reason"
          name="join_reason"
          rows={2}
          defaultValue={member.join_reason ?? ""}
          disabled={!canManage}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-neutral-100"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="status_manual" className="text-sm font-medium text-neutral-700">
          Status override
        </label>
        <select
          id="status_manual"
          name="status_manual"
          value={statusManual}
          onChange={(e) => setStatusManual(e.target.value)}
          disabled={!canManage}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-neutral-100"
        >
          <option value="">Active (no override)</option>
          <option value="suspended">Suspended</option>
          <option value="relocated">Relocated</option>
          <option value="out_of_town">Out of Town</option>
          <option value="other">Other</option>
        </select>
      </div>

      {statusManual === "other" && (
        <div className="space-y-1">
          <label htmlFor="status_reason" className="text-sm font-medium text-neutral-700">
            Reason (required for &ldquo;Other&rdquo;)
          </label>
          <textarea
            id="status_reason"
            name="status_reason"
            rows={2}
            defaultValue={member.status_reason ?? ""}
            disabled={!canManage}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:bg-neutral-100"
          />
        </div>
      )}

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
