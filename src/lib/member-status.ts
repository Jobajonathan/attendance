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
 * Phase 1 only has status_manual to work from. "On Leave" (derived from an open
 * Leave record, Phase 3) and inactivity-threshold-driven "Inactive" (Phase 6,
 * Section 3.7) are not yet computable and are deliberately left as later inputs
 * to this same function rather than columns on the members table itself.
 */
export function deriveMemberStatus(member: Pick<Tables<"members">, "status_manual">): MemberStatus {
  if (member.status_manual === "transferred") return "transferred";
  if (member.status_manual === "inactive") return "inactive";
  return "active";
}
