"use client";

import { useActionState } from "react";
import { updateServiceTemplate } from "./actions";
import type { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TemplateRowForm({ template }: { template: Tables<"service_templates"> }) {
  const boundAction = updateServiceTemplate.bind(null, template.id);
  const [state, formAction, pending] = useActionState(boundAction, null);

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:items-end">
      <div className="space-y-1 sm:col-span-1">
        <label className="text-xs font-medium text-neutral-700">Opens day</label>
        <select
          name="open_day_of_week"
          defaultValue={template.open_day_of_week}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {DAY_LABELS.map((label, value) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1 sm:col-span-1">
        <label className="text-xs font-medium text-neutral-700">Opens time</label>
        <input
          type="time"
          name="open_time"
          defaultValue={template.open_time.slice(0, 5)}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
      <div className="space-y-1 sm:col-span-1">
        <label className="text-xs font-medium text-neutral-700">Closes day</label>
        <select
          name="close_day_of_week"
          defaultValue={template.close_day_of_week}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {DAY_LABELS.map((label, value) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1 sm:col-span-1">
        <label className="text-xs font-medium text-neutral-700">Closes time</label>
        <input
          type="time"
          name="close_time"
          defaultValue={template.close_time.slice(0, 5)}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-neutral-700 sm:col-span-1">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={template.is_active}
          className="rounded border-neutral-300 text-brand focus:ring-brand"
        />
        Active
      </label>
      <div className="sm:col-span-1">
        <Button type="submit" variant="secondary" size="sm" disabled={pending} fullWidth>
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
      {state?.error && (
        <Alert tone="error" className="col-span-2 sm:col-span-6">
          {state.error}
        </Alert>
      )}
    </form>
  );
}
