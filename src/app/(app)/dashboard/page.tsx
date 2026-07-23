import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { isLeadershipRole } from "@/lib/roles";
import { buildCelebrations } from "@/lib/celebrations";
import { computeEngagement, type WeeklyEngagementRow } from "@/lib/engagement";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EngagementTrend } from "./engagement-trend";
import { NeedsFollowUpTable } from "./needs-follow-up-table";

// Vercel runs in UTC; this church operates in WAT (UTC+1). A fixed +1 offset
// is enough for "today" purposes on this single-timezone deployment (same
// reasoning as the checkin flow's opens_at/closes_at handling).
function todayInWat(): Date {
  const nowWat = new Date(Date.now() + 60 * 60 * 1000);
  return new Date(Date.UTC(nowWat.getUTCFullYear(), nowWat.getUTCMonth(), nowWat.getUTCDate()));
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  await supabase.rpc("sync_activity_statuses");

  const today = todayInWat();
  const todayStr = toDateString(today);
  const canContact = isLeadershipRole(profile.role);

  const [
    { data: todaysActivities },
    { count: inactiveCount },
    { data: celebrationMembers },
    { data: weeklyRows },
    { data: followUpRows },
  ] = await Promise.all([
    supabase.from("activities").select("id").eq("type", "attendance").eq("scheduled_date", todayStr),
    supabase.from("members").select("*", { count: "exact", head: true }).eq("status_manual", "suspended"),
    supabase.from("members").select("id, name, birthday, anniversary_date, status_manual"),
    supabase.rpc("get_weekly_engagement_components", { p_weeks: 12 }),
    supabase.rpc("get_needs_follow_up", { p_threshold: 2 }),
  ]);

  const todaysActivityIds = todaysActivities?.map((a) => a.id) ?? [];
  let presentCount = 0;
  let absentCount = 0;
  let excusedCount = 0;
  if (todaysActivityIds.length > 0) {
    const { data: todaysSubmissions } = await supabase
      .from("submissions")
      .select("status")
      .in("activity_id", todaysActivityIds);
    presentCount = todaysSubmissions?.filter((s) => s.status === "present").length ?? 0;
    absentCount = todaysSubmissions?.filter((s) => s.status === "absent").length ?? 0;
    excusedCount = todaysSubmissions?.filter((s) => s.status === "excused").length ?? 0;
  }

  const celebrations = buildCelebrations(celebrationMembers ?? [], today);
  const weekly = (weeklyRows ?? []) as WeeklyEngagementRow[];
  const engagement = computeEngagement(weekly.slice(-4));

  return (
    <div>
      <PageHeader title="Leadership Dashboard" />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Today&apos;s Attendance</p>
          {todaysActivityIds.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-400">No attendance activity scheduled today.</p>
          ) : (
            <p className="mt-2 text-sm text-neutral-700">
              {presentCount} present &middot; {absentCount} absent &middot; {excusedCount} excused
            </p>
          )}
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Active Leave</p>
          <p className="mt-2 text-sm text-neutral-400">Not tracked yet — Leave Register isn&apos;t built.</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Inactive Members</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{inactiveCount ?? 0}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Upcoming Celebrations</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{celebrations.length}</p>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">Engagement</h2>
        <Badge tone="warning">Provisional</Badge>
      </div>
      <Card className="mt-2 p-4">
        <p className="text-3xl font-semibold text-neutral-900">
          {engagement === null ? "—" : `${Math.round(engagement * 100)}%`}
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Unweighted average of Attendance and Message Review rates over the trailing 4 weeks. Excused
          responses are dropped from both. Formula not yet specified by the PRD — provisional.
        </p>
      </Card>
      <EngagementTrend rows={weekly} />

      <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">Celebrations</h2>
      <Card className="mt-2 overflow-hidden">
        <ul className="divide-y divide-neutral-100 text-sm">
          {celebrations.map((c) => (
            <li key={`${c.memberId}-${c.type}`} className="flex items-center gap-2 px-4 py-3">
              <span className="font-medium text-neutral-900">{c.memberName}</span>
              <Badge tone={c.type === "birthday" ? "brand" : "success"}>
                {c.type === "birthday" ? "Birthday" : "Anniversary"}
              </Badge>
              {c.isToday && <Badge tone="warning">Today</Badge>}
              <span className="text-neutral-500">
                {c.nextOccurrence.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
              </span>
            </li>
          ))}
          {celebrations.length === 0 && (
            <li className="px-4 py-6 text-center text-neutral-400">No celebrations in the next 7 days.</li>
          )}
        </ul>
      </Card>

      <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">Needs Follow Up</h2>
      <NeedsFollowUpTable rows={followUpRows ?? []} canContact={canContact} />
    </div>
  );
}
