import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { canManageOperations } from "@/lib/roles";
import { serverNow } from "@/lib/server-now";
import { getOrCreateShortLink } from "@/lib/short-link";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { ShareableLink } from "@/components/shareable-link";
import type { Enums } from "@/lib/supabase/database.types";

const STATUS_TONE: Record<string, BadgeTone> = {
  scheduled: "neutral",
  open: "brand",
  closed: "neutral",
};

const TYPE_LABELS: Record<Enums<"activity_type">, string> = {
  attendance: "Attendance",
  message_review: "Message Review",
};

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const { tab } = await searchParams;
  const activeTab: Enums<"activity_type"> = tab === "message_review" ? "message_review" : "attendance";

  // Vercel Hobby's cron granularity is daily at best (see vercel.json), so
  // opportunistically re-run the same time-based transition on every load of
  // this page — cheap, idempotent, and keeps FR-ATT-03 timely whenever staff
  // are actually using the system, which is when it matters most.
  await supabase.rpc("sync_activity_statuses");

  const now = serverNow();
  const nowDate = new Date(now);
  const monthStart = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth() + 1, 1));
  const monthStartStr = monthStart.toISOString().slice(0, 10);
  const monthEndStr = monthEnd.toISOString().slice(0, 10);
  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const [{ data: activities, error }, { data: weeklyActivities }] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("type", activeTab)
      .eq("is_archived", false)
      .order("opens_at", { ascending: false }),
    activeTab === "attendance"
      ? supabase
          .from("activities")
          .select("*")
          .eq("type", "attendance")
          .not("service_template_id", "is", null)
          .gte("scheduled_date", monthStartStr)
          .lt("scheduled_date", monthEndStr)
          .order("scheduled_date", { ascending: true })
      : Promise.resolve({ data: null }),
  ]);

  const canCreate = canManageOperations(profile.role);

  const headerList = await headers();
  const origin = `${headerList.get("x-forwarded-proto") ?? "https"}://${headerList.get("host")}`;
  const weeklyLinks = weeklyActivities
    ? await Promise.all(
        weeklyActivities.map(async (a) => {
          const code = await getOrCreateShortLink(supabase, `/checkin/${a.link_token}`);
          return `${origin}/s/${code}`;
        }),
      )
    : [];

  return (
    <div>
      <PageHeader
        title="Activities"
        action={
          canCreate && (
            <LinkButton href={`/activities/new?type=${activeTab}`} size="sm">
              + New {TYPE_LABELS[activeTab]} Activity
            </LinkButton>
          )
        }
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(["attendance", "message_review"] as Enums<"activity_type">[]).map((t) => (
            <LinkButton
              key={t}
              href={`/activities?tab=${t}`}
              size="sm"
              variant={activeTab === t ? "primary" : "secondary"}
            >
              {TYPE_LABELS[t]}
            </LinkButton>
          ))}
        </div>
        {activeTab === "attendance" && canCreate && (
          <Link href="/settings/services" className="text-sm text-brand underline">
            Manage weekly templates
          </Link>
        )}
      </div>

      {error && (
        <Alert tone="error" className="mt-4">
          {error.message}
        </Alert>
      )}

      {activeTab === "attendance" && (
        <>
          <h2 className="font-heading mt-6 text-lg font-semibold text-neutral-900">
            Weekly activities for {monthLabel}
          </h2>
          <Card className="mt-2 overflow-hidden">
            <ul className="divide-y divide-neutral-100 text-sm">
              {weeklyActivities?.map((a, i) => (
                <li key={a.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
                  <Link href={`/activities/${a.id}`} className="font-medium text-neutral-900 hover:text-brand">
                    {a.title}
                  </Link>
                  <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                  <span className="text-neutral-500">{a.scheduled_date}</span>
                  {a.status !== "closed" && <ShareableLink url={weeklyLinks[i]} label={a.title} className="text-xs" />}
                </li>
              ))}
              {(!weeklyActivities || weeklyActivities.length === 0) && (
                <li className="px-4 py-6 text-center text-neutral-400">
                  No weekly services scheduled for {monthLabel} yet.
                </li>
              )}
            </ul>
          </Card>
        </>
      )}

      <h2 className="font-heading mt-6 text-lg font-semibold text-neutral-900">All {TYPE_LABELS[activeTab]}</h2>
      <Card className="mt-2 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Scheduled</th>
              <th className="px-4 py-2">Opens</th>
              <th className="px-4 py-2">Closes</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {activities?.map((activity) => {
              // Section 3.3 edge case: an Open activity past its closing time that
              // hasn't been picked up by the sync job yet is flagged, not silently
              // auto-closed, so a late-arriving submission isn't discarded unnoticed.
              const staleOpen = activity.status === "open" && new Date(activity.closes_at).getTime() < now;
              return (
                <tr key={activity.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2">
                    <Link href={`/activities/${activity.id}`} className="font-medium text-neutral-900 hover:text-brand">
                      {activity.title}
                    </Link>
                    {activity.is_backfilled && (
                      <Badge tone="warning" className="ml-2">
                        Backfilled
                      </Badge>
                    )}
                    {activity.service_template_id && (
                      <Badge tone="neutral" className="ml-2">
                        Recurring
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-neutral-500">{activity.scheduled_date}</td>
                  <td className="px-4 py-2 text-neutral-500">{new Date(activity.opens_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-neutral-500">{new Date(activity.closes_at).toLocaleString()}</td>
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
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  No {TYPE_LABELS[activeTab].toLowerCase()} activities yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
