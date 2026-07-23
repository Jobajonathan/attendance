import type { Tables } from "@/lib/supabase/database.types";

export type MemberStatus = "active" | "on_leave" | "inactive" | "transferred";

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: "Active",
  on_leave: "On Leave",
  inactive: "Inactive",
  transferred: "Transferred",
};

/**
 * Derives a member's effective status (FR-MEM-03, User Story MEM-2).
 *
 * "On Leave" is derived from an open Leave record — it's blocked on the Leave
 * Register (Phase 3), which doesn't exist yet, not deferred by design. "Inactive"
 * here only ever reflects a manual status_manual override; there is no automatic
 * inactivity-threshold detection in this function (the Dashboard's Needs Follow
 * Up list computes that separately, from consecutive absences).
 */
export function deriveMemberStatus(member: Pick<Tables<"members">, "status_manual">): MemberStatus {
  if (member.status_manual === "transferred") return "transferred";
  if (member.status_manual === "inactive") return "inactive";
  return "active";
}
