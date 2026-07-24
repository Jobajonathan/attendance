import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { isLeadershipRole } from "@/lib/roles";

// Backs the Dashboard's monthly attendance chart: clicking a bar fetches the
// per-activity present/absent/excused breakdown for that month rather than
// navigating to a separate page.
export async function GET(request: Request) {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  const supabase = await createClient();
  const monthStart = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const nextMonth = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);

  const [{ count: activeMemberCount }, { data: activities }] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }).or("status_manual.is.null,status_manual.eq.active"),
    supabase
      .from("activities")
      .select("id, title, scheduled_date")
      .eq("type", "attendance")
      .eq("status", "closed")
      .gte("scheduled_date", monthStart)
      .lt("scheduled_date", nextMonth)
      .order("scheduled_date", { ascending: true }),
  ]);

  const rows = await Promise.all(
    (activities ?? []).map(async (activity) => {
      const { data: submissions } = await supabase.from("submissions").select("status").eq("activity_id", activity.id);
      const present = submissions?.filter((s) => s.status === "present").length ?? 0;
      const excused = submissions?.filter((s) => s.status === "excused").length ?? 0;
      const absent = Math.max((activeMemberCount ?? 0) - present - excused, 0);
      return { id: activity.id, title: activity.title, scheduledDate: activity.scheduled_date, present, absent, excused };
    }),
  );

  return NextResponse.json({ activities: rows });
}
