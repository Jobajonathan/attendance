"use client";

import { useActionState } from "react";
import { createMember } from "./actions";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function NewMemberPage() {
  const [state, formAction, pending] = useActionState(createMember, null);

  return (
    <div className="max-w-lg">
      <PageHeader title="Add member" />

      <form action={formAction} className="mt-6 space-y-4">
        <Field label="Name" name="name" type="text" required />
        <Field label="Phone number" name="phone_number" type="tel" />
        <Field label="Gender" name="gender" type="text" />
        <Field label="Join date" name="join_date" type="date" />
        <Field label="Birthday" name="birthday" type="date" />
        <Field label="Wedding anniversary" name="anniversary_date" type="date" />

        {state?.error && <Alert tone="error">{state.error}</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save member"}
        </Button>
      </form>
    </div>
  );
}
