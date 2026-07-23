import type { Database } from "@/lib/supabase/database.types";

export type WeeklyEngagementRow = Database["public"]["Functions"]["get_weekly_engagement_components"]["Returns"][number];

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
