import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { isLeadershipRole } from "@/lib/roles";
import { buildCelebrations } from "@/lib/celebrations";
import { computeEngagement, type WeeklyEngagementRow, type MonthlyAttendanceRow } from "@/lib/engagement";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EngagementTrend } from "./engagement-trend";
import { NeedsFollowUpTable, type FollowUpAssignment } from "./needs-follow-up-table";
import { MonthlyChart } from "./monthly-chart";
import { AttendanceBreakdownChart, type AttendanceBreakdownRow } from "./attendance-breakdown-chart";
import { CelebrationsChart } from "./celebrations-chart";

// Vercel runs in UTC; this church operates in WAT (UTC+1). A fixed +1 offset
// is enough for "today" purposes on this single-timezone deployment (same
// reasoning as the checkin flow's opens_at/closes_at handling).
function todayInWat(): Date {
  const nowWat = new Date(Date.now() + 60 * 60 * 1000);
  return new Date(Date.UTC(nowWat.getUTCFullYear(), nowWat.getUTCMonth(), nowWat.getUTCDate()));
}

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  await supabase.rpc("sync_activity_statuses");

  const today = todayInWat();
  const canContact = isLeadershipRole(profile.role);

  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
  const monthStartStr = monthStart.toISOString().slice(0, 10);
  const monthEndStr = monthEnd.toISOString().slice(0, 10);
  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const [
    { count: activeMemberCount },
    { data: monthActivities },
    { data: celebrationMembers },
    { data: weeklyRows },
    { data: followUpRows },
    { data: assignmentRows },
    { data: monthlyRows },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }).or("status_manual.is.null,status_manual.eq.active"),
    // "scheduled" (not yet opened) activities are excluded here — before a
    // service opens, everyone would show as absent, which is misleading
    // rather than informative. Once sync_activity_statuses (above) flips one
    // to "open", it appears with live counts; "closed" ones show final counts.
    supabase
      .from("activities")
      .select("id, title, scheduled_date")
      .eq("type", "attendance")
      .neq("status", "scheduled")
      .gte("scheduled_date", monthStartStr)
      .lt("scheduled_date", monthEndStr)
      .order("scheduled_date", { ascending: true }),
    supabase.from("members").select("id, name, birthday, anniversary_date, join_date, status_manual"),
    supabase.rpc("get_weekly_engagement_components", { p_weeks: 12 }),
    supabase.rpc("get_needs_follow_up", { p_threshold: 2 }),
    supabase
      .from("follow_up_assignments")
      .select("member_id, assignee_name, status, token, assigned_at")
      .order("assigned_at", { ascending: false }),
    supabase.rpc("get_monthly_attendance", { p_months: 12 }),
  ]);

  const headerList = await headers();
  const origin = `${headerList.get("x-forwarded-proto") ?? "https"}://${headerList.get("host")}`;

  const assignmentsByMember = new Map<string, FollowUpAssignment>();
  for (const row of assignmentRows ?? []) {
    if (!assignmentsByMember.has(row.member_id)) {
      assignmentsByMember.set(row.member_id, {
        assigneeName: row.assignee_name,
        status: row.status,
        url: `${origin}/followup/${row.token}`,
      });
    }
  }

  // Attendance breakdown: this month's open/closed services (constant
  // service days — Sunday, Tuesday, Friday — plus any ad-hoc attendance
  // activity), one bar per occurrence rather than a 12-month rollup.
  const breakdownRows: AttendanceBreakdownRow[] = await Promise.all(
    (monthActivities ?? []).map(async (a) => {
      const { data: submissions } = await supabase.from("submissions").select("status").eq("activity_id", a.id);
      const present = submissions?.filter((s) => s.status === "present").length ?? 0;
      const excused = submissions?.filter((s) => s.status === "excused").length ?? 0;
      const absent = Math.max((activeMemberCount ?? 0) - present - excused, 0);
      return { id: a.id, title: a.title, scheduledDate: a.scheduled_date, present, absent, excused };
    }),
  );

  const celebrations = buildCelebrations(celebrationMembers ?? [], today, 30);
  const weekly = (weeklyRows ?? []) as WeeklyEngagementRow[];
  const engagement = computeEngagement(weekly.slice(-4));

  return (
    <div>
      <PageHeader title="Leadership Dashboard" />

      <h2 className="font-heading mt-4 text-lg font-semibold text-neutral-900">Attendance Breakdown</h2>
      <AttendanceBreakdownChart rows={breakdownRows} monthLabel={monthLabel} />

      <h2 className="font-heading mt-6 text-lg font-semibold text-neutral-900">Monthly Attendance</h2>
      {(monthlyRows ?? []).length === 0 ? (
        <Card className="mt-2 p-4">
          <p className="text-sm text-neutral-400">This section will populate once there&apos;s closed attendance data.</p>
        </Card>
      ) : (
        <MonthlyChart rows={(monthlyRows ?? []) as MonthlyAttendanceRow[]} />
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">Engagement</h2>
        <Badge tone="warning">Provisional</Badge>
      </div>
      {weekly.length === 0 || engagement === null ? (
        <Card className="mt-2 p-4">
          <p className="text-sm text-neutral-400">This section will populate once there&apos;s attendance or review data.</p>
        </Card>
      ) : (
        <>
          <Card className="mt-2 p-4">
            <p className="text-3xl font-semibold text-neutral-900">{Math.round(engagement * 100)}%</p>
            <p className="mt-1 text-xs text-neutral-500">
              Unweighted average of Attendance and Message Review rates over the trailing 4 weeks. Excused
              responses are dropped from both. Formula not yet specified by the PRD — provisional.
            </p>
          </Card>
          <EngagementTrend rows={weekly} />
        </>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">Celebrations</h2>
        <Link href="/dashboard/celebrations-digest" className="text-xs text-brand underline">
          Preview monthly digest
        </Link>
      </div>
      <CelebrationsChart celebrations={celebrations} windowLabel="30 days" />

      <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">Needs Follow Up</h2>
      <NeedsFollowUpTable rows={followUpRows ?? []} canContact={canContact} assignments={assignmentsByMember} />
    </div>
  );
}
