import type { Database } from "@/lib/supabase/database.types";

export type WeeklyEngagementRow = Database["public"]["Functions"]["get_weekly_engagement_components"]["Returns"][number];
export type MonthlyAttendanceRow = Database["public"]["Functions"]["get_monthly_attendance"]["Returns"][number];

function rate(present: number, total: number): number | null {
  if (total === 0) return null;
  return present / total;
}

// Provisional formula — the PRD (Section 2.14) defines the composite Engagement
// concept but not its math. This is an unweighted average of Attendance rate
// and Message Review completion rate, each present ÷ (present + absent) with
// `excused` dropped from both sides (same neutral treatment Needs Follow Up
// gives it). Leave is excluded: it isn't a rate and isn't tracked yet.
// Celebrations is excluded: it isn't a performance signal, it gets its own
// widget (FR-CEL-02). If only one component has data, use it alone; if
// neither does, the caller should render "—", not "0%".
export function computeEngagement(rows: WeeklyEngagementRow[]): number | null {
  const attendancePresent = rows.reduce((sum, r) => sum + r.attendance_present, 0);
  const attendanceTotal = rows.reduce((sum, r) => sum + r.attendance_total, 0);
  const reviewPresent = rows.reduce((sum, r) => sum + r.review_present, 0);
  const reviewTotal = rows.reduce((sum, r) => sum + r.review_total, 0);

  const attendanceRate = rate(attendancePresent, attendanceTotal);
  const reviewRate = rate(reviewPresent, reviewTotal);

  if (attendanceRate === null) return reviewRate;
  if (reviewRate === null) return attendanceRate;
  return (attendanceRate + reviewRate) / 2;
}

// Average attendance rate for a period: present-markings ÷ (active members ×
// services held), i.e. "present vs total active members vs duration" — the
// same formula covers a single month, 6 months, or a year by just summing
// more of get_monthly_attendance's rows before dividing (no separate query
// per period). A month with no closed attendance activities contributes
// nothing to either side rather than skewing the rate toward 0.
export function computeMonthlyAttendanceRate(rows: MonthlyAttendanceRow[]): number | null {
  const presentTotal = rows.reduce((sum, r) => sum + r.present_count, 0);
  const denominator = rows.reduce((sum, r) => sum + r.active_member_count * r.activity_count, 0);
  return rate(presentTotal, denominator);
}
