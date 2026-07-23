import type { Tables } from "@/lib/supabase/database.types";

export type MemberStatus = "active" | "suspended" | "relocated" | "out_of_town" | "other";

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  relocated: "Relocated",
  out_of_town: "Out of Town",
  other: "Other",
};

/**
 * Derives a member's effective status (FR-MEM-03, User Story MEM-2) directly
 * from status_manual — a null override means "Active". A future Leave
 * Register (Phase 3, not yet built) would add an "On Leave" status derived
 * from an open Leave record; it isn't one of these values since it's not a
 * manual override.
 */
export function deriveMemberStatus(member: Pick<Tables<"members">, "status_manual">): MemberStatus {
  return member.status_manual ?? "active";
}
