import type { Enums } from "@/lib/supabase/database.types";

export type AppRole = Enums<"app_role">;

export const ROLE_LABELS: Record<AppRole, string> = {
  administrative_officer: "Administrative Officer",
  head_of_department: "Head of Department",
  assistant_head_of_department: "Assistant Head of Department",
  minister_in_charge: "Minister in Charge",
  super_admin: "Super Admin",
};

// Section 2.11 / 6.2: leadership roles land on the Dashboard; the Administrative
// Officer's primary task is Activity Management, matching each role's daily job.
// Minister in Charge, Head of Department, and Assistant HOD are explicitly
// "same privilege" — super_admin sits above all of them and inherits
// everything leadership can do, plus staff/role management (see the
// escalation guard in staff/actions.ts for who can grant super_admin itself).
export const LEADERSHIP_ROLES: AppRole[] = [
  "head_of_department",
  "assistant_head_of_department",
  "minister_in_charge",
  "super_admin",
];

export function isLeadershipRole(role: AppRole): boolean {
  return LEADERSHIP_ROLES.includes(role);
}

// administrative_officer's operational scope (Member Directory, Activity
// creation) — super_admin can do everything every other role can do, so it's
// included here too rather than only in isLeadershipRole().
export function canManageOperations(role: AppRole): boolean {
  return role === "administrative_officer" || role === "super_admin";
}

// Section 6.2: login routes each role to its primary task, not a shared landing page.
export function homePathForRole(role: AppRole): string {
  return isLeadershipRole(role) ? "/dashboard" : "/activities";
}
