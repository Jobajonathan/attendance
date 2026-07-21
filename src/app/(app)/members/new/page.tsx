"use client";

import { useActionState } from "react";
import { createMember } from "./actions";

export default function NewMemberPage() {
  const [state, formAction, pending] = useActionState(createMember, null);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-zinc-900">Add member</h1>

      <form action={formAction} className="mt-6 space-y-4">
        <Field label="Name" name="name" type="text" required />
        <Field label="Phone number" name="phone_number" type="tel" />
        <Field label="Gender" name="gender" type="text" />
        <Field label="Join date" name="join_date" type="date" />
        <Field label="Birthday" name="birthday" type="date" />
        <Field label="Wedding anniversary" name="anniversary_date" type="date" />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save member"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
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
        required={required}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
      />
    </div>
  );
}
