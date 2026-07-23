"use client";

import { useActionState, useState } from "react";
import { createActivity } from "./actions";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function NewActivityPage() {
  const [state, formAction, pending] = useActionState(createActivity, null);
  const [type, setType] = useState<"attendance" | "message_review">("attendance");

  return (
    <div className="max-w-lg">
      <PageHeader
        title="New activity"
        description="A unique keyword and submission link are generated automatically once you save."
      />

      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-1">
          <span className="text-sm font-medium text-neutral-700">Type</span>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="attendance"
                checked={type === "attendance"}
                onChange={() => setType("attendance")}
                className="text-brand focus:ring-brand"
              />
              Attendance
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="message_review"
                checked={type === "message_review"}
                onChange={() => setType("message_review")}
                className="text-brand focus:ring-brand"
              />
              Message Review
            </label>
          </div>
        </div>

        <Field label="Title" name="title" type="text" placeholder="Sunday First Service" required />
        <Field label="Scheduled date" name="scheduled_date" type="date" required />
        <Field label="Opens at" name="opens_at" type="datetime-local" required />
        <Field label="Closes at" name="closes_at" type="datetime-local" required />

        {type === "attendance" && (
          <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
            <legend className="px-1 text-sm font-medium text-neutral-700">
              Location &amp; geofence (optional)
            </legend>
            <p className="text-xs text-neutral-500">
              Leave blank to skip geofence checking for this activity — check-ins are never blocked
              by location either way, this only affects whether they get flagged for review.
            </p>
            <Field label="Latitude" name="location_lat" type="number" step="any" />
            <Field label="Longitude" name="location_lng" type="number" step="any" />
            <Field label="Radius (meters)" name="geofence_radius_m" type="number" />
          </fieldset>
        )}

        {state?.error && <Alert tone="error">{state.error}</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create activity"}
        </Button>
      </form>
    </div>
  );
}
