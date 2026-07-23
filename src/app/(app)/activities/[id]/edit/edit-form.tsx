"use client";

import { useActionState } from "react";
import { updateActivity } from "./actions";
import { utcIsoToDatetimeLocal } from "@/lib/timezone";
import type { Tables } from "@/lib/supabase/database.types";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function EditActivityForm({ activity }: { activity: Tables<"activities"> }) {
  const boundAction = updateActivity.bind(null, activity.id);
  const [state, formAction, pending] = useActionState(boundAction, null);
  const isAttendance = activity.type === "attendance";

  return (
    <div className="max-w-lg">
      <PageHeader
        title={`Edit: ${activity.title}`}
        description="Type can't be changed after creation — geofence and message review answers mean different things depending on it."
      />

      <form action={formAction} className="mt-6 space-y-4">
        <Field label="Title" name="title" type="text" defaultValue={activity.title} required />
        <Field
          label="Scheduled date"
          name="scheduled_date"
          type="date"
          defaultValue={activity.scheduled_date}
          required
        />
        <Field
          label="Opens at"
          name="opens_at"
          type="datetime-local"
          defaultValue={utcIsoToDatetimeLocal(activity.opens_at)}
          required
        />
        <Field
          label="Closes at"
          name="closes_at"
          type="datetime-local"
          defaultValue={utcIsoToDatetimeLocal(activity.closes_at)}
          required
        />

        {isAttendance && (
          <fieldset className="space-y-4 rounded-md border border-neutral-200 p-4">
            <legend className="px-1 text-sm font-medium text-neutral-700">
              Location &amp; geofence (optional)
            </legend>
            <Field
              label="Latitude"
              name="location_lat"
              type="number"
              step="any"
              defaultValue={activity.location_lat ?? ""}
            />
            <Field
              label="Longitude"
              name="location_lng"
              type="number"
              step="any"
              defaultValue={activity.location_lng ?? ""}
            />
            <Field
              label="Radius (meters)"
              name="geofence_radius_m"
              type="number"
              defaultValue={activity.geofence_radius_m ?? ""}
            />
          </fieldset>
        )}

        {isAttendance && (
          <div className="space-y-1">
            <label htmlFor="keyword_no_location" className="text-sm font-medium text-neutral-700">
              Alternate keyword (no location required)
            </label>
            <p className="text-xs text-neutral-500">
              Optional. Leave blank to remove the no-location fallback for this activity.
            </p>
            <input
              id="keyword_no_location"
              name="keyword_no_location"
              type="text"
              defaultValue={activity.keyword_no_location ?? ""}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm uppercase focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        )}

        {state?.error && <Alert tone="error">{state.error}</Alert>}
        {state && !state.error && <Alert tone="success">Saved.</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
