"use client";

import { useActionState } from "react";
import { createActivity } from "./actions";

export default function NewActivityPage() {
  const [state, formAction, pending] = useActionState(createActivity, null);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-zinc-900">New attendance activity</h1>
      <p className="mt-1 text-sm text-zinc-500">
        A unique keyword and check-in link are generated automatically once you save.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <Field label="Title" name="title" type="text" placeholder="Sunday First Service" required />
        <Field label="Scheduled date" name="scheduled_date" type="date" required />
        <Field label="Opens at" name="opens_at" type="datetime-local" required />
        <Field label="Closes at" name="closes_at" type="datetime-local" required />

        <fieldset className="space-y-4 rounded-md border border-zinc-200 p-4">
          <legend className="px-1 text-sm font-medium text-zinc-700">
            Location &amp; geofence (optional)
          </legend>
          <p className="text-xs text-zinc-500">
            Leave blank to skip geofence checking for this activity — check-ins are never blocked
            by location either way, this only affects whether they get flagged for review.
          </p>
          <Field label="Latitude" name="location_lat" type="number" step="any" />
          <Field label="Longitude" name="location_lng" type="number" step="any" />
          <Field label="Radius (meters)" name="geofence_radius_m" type="number" />
        </fieldset>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create activity"}
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
  placeholder,
  step,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
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
        placeholder={placeholder}
        step={step}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
      />
    </div>
  );
}
