"use client";

import { useActionState } from "react";
import Link from "next/link";
import { importMembers } from "./actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ImportMembersPage() {
  const [state, formAction, pending] = useActionState(importMembers, null);

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">Import Members</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Upload a CSV or Excel (.xlsx) file with columns{" "}
        <code className="rounded bg-neutral-100 px-1">
          name, phone_number, occupation, gender, join_date, birthday, anniversary_date,
          residential_address, join_reason
        </code>{" "}
        (name and phone_number required, the rest optional). Dates as YYYY-MM-DD; birthday also
        accepts M/D or MM/DD if you don&apos;t have a year on file. Rows missing a name are
        skipped and reported below rather than blocking the rest of the import; rows matching an
        existing member by name are held for manual review rather than created automatically.{" "}
        <a href="/member-import-sample.xlsx" download className="text-brand underline">
          Download sample template
        </a>
        .
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input
          type="file"
          name="file"
          accept=".csv,.xlsx"
          required
          className="block text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:text-brand-foreground"
        />

        {state?.error && <Alert tone="error">{state.error}</Alert>}

        <Button type="submit" disabled={pending}>
          {pending ? "Importing..." : "Import"}
        </Button>
      </form>

      {state?.createdCount !== undefined && (
        <div className="mt-8 space-y-6">
          <Alert tone="success">
            Created {state.createdCount} member{state.createdCount === 1 ? "" : "s"}.
          </Alert>

          {state.skipped && state.skipped.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-semibold text-neutral-900">Skipped rows</h2>
              <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                {state.skipped.map((s) => (
                  <li key={s.row}>
                    Row {s.row}: {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state.held && state.held.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-semibold text-neutral-900">Held for manual review</h2>
              <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                {state.held.map((h) => (
                  <li key={h.row}>
                    Row {h.row} ({h.name}): {h.reason}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-neutral-500">
                Add any of these individually from the{" "}
                <Link href="/members/new" className="text-brand underline">
                  Add member
                </Link>{" "}
                form if they are in fact new people.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
