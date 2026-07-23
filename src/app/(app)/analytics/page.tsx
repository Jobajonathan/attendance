import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { isLeadershipRole } from "@/lib/roles";
import type { MonthlyAttendanceRow } from "@/lib/engagement";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { MonthlyChart } from "./monthly-chart";

export default async function AnalyticsPage() {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    notFound();
  }

  const supabase = await createClient();

  const [{ data: monthlyRows }, { count: activeMemberCount }, { data: lastService }] = await Promise.all([
    supabase.rpc("get_monthly_attendance", { p_months: 12 }),
    supabase.from("members").select("*", { count: "exact", head: true }).or("status_manual.is.null,status_manual.eq.active"),
    supabase
      .from("activities")
      .select("id, title, scheduled_date")
      .eq("type", "attendance")
      .eq("status", "closed")
      .order("scheduled_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let lastServicePresent = 0;
  let lastServiceExcused = 0;
  if (lastService) {
    const { data: submissions } = await supabase
      .from("submissions")
      .select("status")
      .eq("activity_id", lastService.id);
    lastServicePresent = submissions?.filter((s) => s.status === "present").length ?? 0;
    lastServiceExcused = submissions?.filter((s) => s.status === "excused").length ?? 0;
  }
  const lastServiceAbsent = Math.max(
    (activeMemberCount ?? 0) - lastServicePresent - lastServiceExcused,
    0,
  );

  return (
    <div>
      <PageHeader
        title="Attendance Analytics"
        description="Monthly attendance trend and the most recent service's breakdown."
      />

      <h2 className="font-heading mt-6 text-lg font-semibold text-neutral-900">Last Service</h2>
      <Card className="mt-2 p-4">
        {lastService ? (
          <>
            <p className="text-sm font-medium text-neutral-700">
              <Link href={`/activities/${lastService.id}`} className="text-brand underline">
                {lastService.title}
              </Link>{" "}
              &middot; {lastService.scheduled_date}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {lastServicePresent} present &middot; {lastServiceAbsent} absent &middot; {lastServiceExcused} excused
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-400">No closed attendance activity yet.</p>
        )}
      </Card>

      <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">Monthly Trend</h2>
      <MonthlyChart rows={(monthlyRows ?? []) as MonthlyAttendanceRow[]} />
    </div>
  );
}
