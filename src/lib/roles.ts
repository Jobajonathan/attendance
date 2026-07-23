import type { Enums } from "@/lib/supabase/database.types";

export type AppRole = Enums<"app_role">;

export const ROLE_LABELS: Record<AppRole, string> = {
  administrative_officer: "Administrative Officer",
  head_of_department: "Head of Department",
  assistant_head_of_department: "Assistant Head of Department",
  minister_in_charge: "Minister in Charge",
  // Added alongside the super_admin DB enum value (PR: super admin role).
  // LEADERSHIP_ROLES/isLeadershipRole are intentionally left unchanged here —
  // wiring super_admin into permission checks is that PR's scope, not this one's.
  super_admin: "Super Admin",
};

// Section 2.11 / 6.2: leadership roles land on the Dashboard; the Administrative
// Officer's primary task is Activity Management, matching each role's daily job.
export const LEADERSHIP_ROLES: AppRole[] = [
  "head_of_department",
  "assistant_head_of_department",
  "minister_in_charge",
];

export function isLeadershipRole(role: AppRole): boolean {
  return LEADERSHIP_ROLES.includes(role);
}

// Section 6.2: login routes each role to its primary task, not a shared landing page.
export function homePathForRole(role: AppRole): string {
  return isLeadershipRole(role) ? "/dashboard" : "/activities";
}
