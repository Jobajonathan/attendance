import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { serverNow } from "@/lib/server-now";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

const STATUS_TONE: Record<string, BadgeTone> = {
  scheduled: "neutral",
  open: "success",
  closed: "neutral",
};

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
      <PageHeader
        title="Activities"
        action={canCreate && <LinkButton href="/activities/new" size="sm">+ New attendance activity</LinkButton>}
      />

      {error && (
        <Alert tone="error" className="mt-4">
          {error.message}
        </Alert>
      )}

      <Card className="mt-4 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Scheduled</th>
              <th className="px-4 py-2">Opens</th>
              <th className="px-4 py-2">Closes</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities?.map((activity) => {
              // Section 3.3 edge case: an Open activity past its closing time that
              // hasn't been picked up by the sync job yet is flagged, not silently
              // auto-closed, so a late-arriving submission isn't discarded unnoticed.
              const staleOpen = activity.status === "open" && new Date(activity.closes_at).getTime() < now;
              return (
                <tr key={activity.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link href={`/activities/${activity.id}`} className="font-medium text-slate-900 hover:text-brand">
                      {activity.title}
                    </Link>
                    {activity.is_backfilled && (
                      <Badge tone="warning" className="ml-2">
                        Backfilled
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{activity.scheduled_date}</td>
                  <td className="px-4 py-2 text-slate-500">{new Date(activity.opens_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-slate-500">{new Date(activity.closes_at).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <Badge tone={STATUS_TONE[activity.status]}>{activity.status}</Badge>
                    {staleOpen && (
                      <Badge tone="danger" className="ml-2 normal-case">
                        past closing time
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
            {activities?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No activities yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
