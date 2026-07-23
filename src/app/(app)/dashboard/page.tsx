import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { isLeadershipRole } from "@/lib/roles";
import { buildCelebrations, type CelebrationType } from "@/lib/celebrations";
import { computeEngagement, type WeeklyEngagementRow } from "@/lib/engagement";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { EngagementTrend } from "./engagement-trend";
import { NeedsFollowUpTable } from "./needs-follow-up-table";

const CELEBRATION_LABEL: Record<CelebrationType, string> = {
  birthday: "Birthday",
  anniversary: "Wedding Anniversary",
  work_anniversary: "Work Anniversary",
};

const CELEBRATION_TONE: Record<CelebrationType, BadgeTone> = {
  birthday: "brand",
  anniversary: "success",
  work_anniversary: "warning",
};

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
    { count: suspendedCount },
    { count: activeMemberCount },
    { data: celebrationMembers },
    { data: weeklyRows },
    { data: followUpRows },
  ] = await Promise.all([
    supabase.from("activities").select("id, title").eq("type", "attendance").eq("scheduled_date", todayStr),
    supabase.from("members").select("*", { count: "exact", head: true }).eq("status_manual", "suspended"),
    supabase.from("members").select("*", { count: "exact", head: true }).or("status_manual.is.null,status_manual.eq.active"),
    supabase.from("members").select("id, name, birthday, anniversary_date, join_date, status_manual"),
    supabase.rpc("get_weekly_engagement_components", { p_weeks: 12 }),
    supabase.rpc("get_needs_follow_up", { p_threshold: 2 }),
  ]);

  const todaysActivityIds = todaysActivities?.map((a) => a.id) ?? [];
  // Real-time count, not just submitted rows — see the matching comment on
  // the activity detail page's Roster header for why.
  let presentCount = 0;
  let excusedCount = 0;
  if (todaysActivityIds.length > 0) {
    const { data: todaysSubmissions } = await supabase
      .from("submissions")
      .select("status")
      .in("activity_id", todaysActivityIds);
    presentCount = todaysSubmissions?.filter((s) => s.status === "present").length ?? 0;
    excusedCount = todaysSubmissions?.filter((s) => s.status === "excused").length ?? 0;
  }
  const absentCount = Math.max((activeMemberCount ?? 0) - presentCount - excusedCount, 0);

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
            <>
              <p className="mt-2 text-sm text-neutral-700">
                {presentCount} present &middot; {absentCount} absent &middot; {excusedCount} excused
              </p>
              <ul className="mt-1 space-y-0.5">
                {todaysActivities?.map((a) => (
                  <li key={a.id}>
                    <Link href={`/activities/${a.id}`} className="text-xs text-brand underline">
                      {a.title} — view breakdown
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Active Leave</p>
          <p className="mt-2 text-sm text-neutral-400">Not tracked yet — Leave Register isn&apos;t built.</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Suspended Members</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{suspendedCount ?? 0}</p>
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

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">Celebrations</h2>
        <Link href="/dashboard/celebrations-digest" className="text-xs text-brand underline">
          Preview monthly digest
        </Link>
      </div>
      <Card className="mt-2 overflow-hidden">
        <ul className="divide-y divide-neutral-100 text-sm">
          {celebrations.map((c) => (
            <li key={`${c.memberId}-${c.type}`} className="flex items-center gap-2 px-4 py-3">
              <span className="font-medium text-neutral-900">{c.memberName}</span>
              <Badge tone={CELEBRATION_TONE[c.type]}>{CELEBRATION_LABEL[c.type]}</Badge>
              {c.isToday && <Badge tone="warning">Today</Badge>}
              <span className="text-neutral-500">
                {c.nextOccurrence.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                {c.type === "work_anniversary" && c.yearsSince !== undefined && (
                  <> &middot; {c.yearsSince} {c.yearsSince === 1 ? "year" : "years"} with the department</>
                )}
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
