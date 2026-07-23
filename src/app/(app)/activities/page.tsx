import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { serverNow } from "@/lib/server-now";

export default async function ActivitiesPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  // Vercel Hobby's cron granularity is daily at best (see vercel.json), so
  // opportunistically re-run the same time-based transition on every load of
  // this page — cheap, idempotent, and keeps FR-ATT-03 timely whenever staff
  // are actually using the system, which is when it matters most.
  await supabase.rpc("sync_activity_statuses");

  const { data: activities, error } = await supabase
    .from("activities")
    .select("*")
    .order("opens_at", { ascending: false });

  const canCreate = profile.role === "administrative_officer";
  const now = serverNow();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Activities</h1>
        {canCreate && (
          <Link
            href="/activities/new"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800"
          >
            + New attendance activity
          </Link>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Scheduled</th>
              <th className="px-4 py-2">Opens</th>
              <th className="px-4 py-2">Closes</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {activities?.map((activity) => {
              // Section 3.3 edge case: an Open activity past its closing time that
              // hasn't been picked up by the sync job yet is flagged, not silently
              // auto-closed, so a late-arriving submission isn't discarded unnoticed.
              const staleOpen = activity.status === "open" && new Date(activity.closes_at).getTime() < now;
              return (
                <tr key={activity.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2">
                    <Link href={`/activities/${activity.id}`} className="font-medium text-zinc-900 hover:underline">
                      {activity.title}
                    </Link>
                    {activity.is_backfilled && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                        Backfilled
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{activity.scheduled_date}</td>
                  <td className="px-4 py-2 text-zinc-500">{new Date(activity.opens_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-zinc-500">{new Date(activity.closes_at).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className="capitalize text-zinc-700">{activity.status}</span>
                    {staleOpen && (
                      <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800">
                        past closing time
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {activities?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                  No activities yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
