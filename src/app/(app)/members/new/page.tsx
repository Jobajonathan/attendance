"use client";

import { useActionState, useState } from "react";
import { createMember } from "./actions";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function NewMemberPage() {
  const [state, formAction, pending] = useActionState(createMember, null);
  const [maritalStatus, setMaritalStatus] = useState("");

  return (
    <div className="max-w-lg">
      <PageHeader title="Add member" />

      <form action={formAction} className="mt-6 space-y-4">
        <Field label="Name" name="name" type="text" required />
        <Field label="Phone number" name="phone_number" type="tel" />
        <Field label="Occupation" name="occupation" type="text" />

        <div className="space-y-1">
          <label htmlFor="gender" className="text-sm font-medium text-neutral-700">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            defaultValue=""
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
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
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="">Not specified</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>

        <Field label="Join date" name="join_date" type="date" />
        <Field label="Birthday" name="birthday" type="date" />
        {maritalStatus === "married" && (
          <Field label="Wedding anniversary" name="anniversary_date" type="date" />
        )}

        <div className="space-y-1">
          <label htmlFor="residential_address" className="text-sm font-medium text-neutral-700">
            Residential address
          </label>
          <textarea
            id="residential_address"
            name="residential_address"
            rows={2}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
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
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        {state?.error && <Alert tone="error">{state.error}</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save member"}
        </Button>
      </form>
    </div>
  );
}
