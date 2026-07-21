"use client";

import { useActionState } from "react";
import Link from "next/link";
import { importMembers } from "./actions";

export default function ImportMembersPage() {
  const [state, formAction, pending] = useActionState(importMembers, null);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-zinc-900">Import from Google Sheets</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Export the department&apos;s member sheet as CSV with columns{" "}
        <code className="rounded bg-zinc-100 px-1">name, phone_number, gender, join_date, birthday, anniversary_date</code>{" "}
        (dates as YYYY-MM-DD). Rows missing a name are skipped and reported below rather than
        blocking the rest of the import; rows matching an existing member by name are held for
        manual review rather than created automatically.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input
          type="file"
          name="file"
          accept=".csv"
          required
          className="block text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:text-white"
        />

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Importing..." : "Import"}
        </button>
      </form>

      {state?.createdCount !== undefined && (
        <div className="mt-8 space-y-6">
          <p className="text-sm font-medium text-emerald-700">
            Created {state.createdCount} member{state.createdCount === 1 ? "" : "s"}.
          </p>

          {state.skipped && state.skipped.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Skipped rows</h2>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600">
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
              <h2 className="text-sm font-semibold text-zinc-900">Held for manual review</h2>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                {state.held.map((h) => (
                  <li key={h.row}>
                    Row {h.row} ({h.name}): {h.reason}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-zinc-500">
                Add any of these individually from the{" "}
                <Link href="/members/new" className="underline">
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
