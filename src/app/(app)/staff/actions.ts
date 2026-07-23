"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/current-profile";
import { isLeadershipRole, type AppRole } from "@/lib/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { Constants } from "@/lib/supabase/database.types";

const APP_ROLES = Constants.public.Enums.app_role;

async function logStaffAction(
  admin: ReturnType<typeof createAdminClient>,
  actingUserId: string,
  targetUserId: string,
  action: string,
  reason?: string,
) {
  await admin.from("audit_log").insert({
    entity_type: "staff",
    entity_id: targetUserId,
    action,
    acting_user_id: actingUserId,
    reason: reason ?? null,
  });
}

export async function inviteStaff(_prevState: { error: string } | null, formData: FormData) {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    return { error: "Only leadership can invite staff." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "");

  if (!fullName || !email) {
    return { error: "Name and email are required." };
  }
  if (!APP_ROLES.includes(role as AppRole)) {
    return { error: "Choose a valid role." };
  }

  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
  if (inviteError || !invited.user) {
    return { error: inviteError?.message ?? "Could not send the invite." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: invited.user.id,
    full_name: fullName,
    email,
    role: role as AppRole,
  });
  if (profileError) {
    return { error: profileError.message };
  }

  await logStaffAction(admin, profile.id, invited.user.id, "invited");
  redirect("/staff");
}

export async function updateStaffRole(
  userId: string,
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    return { error: "Only leadership can change roles." };
  }
  if (userId === profile.id) {
    return { error: "You cannot change your own role from here." };
  }

  const role = String(formData.get("role") ?? "");
  if (!APP_ROLES.includes(role as AppRole)) {
    return { error: "Choose a valid role." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role: role as AppRole }).eq("id", userId);
  if (error) {
    return { error: error.message };
  }

  await logStaffAction(admin, profile.id, userId, "role_changed");
  revalidatePath("/staff");
  return { error: "" };
}

// prevState/formData are unused but required so this matches useActionState's
// (state, payload) => state shape once bound with the target userId.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function revokeStaffAccess(userId: string, _prevState: { error: string } | null, _formData: FormData) {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    return { error: "Only leadership can revoke access." };
  }
  if (userId === profile.id) {
    return { error: "You cannot revoke your own access." };
  }

  const admin = createAdminClient();
  // Ban, never delete: members/activities/audit_log all reference profiles
  // with ON DELETE NO ACTION, so deleting a staff account who has ever
  // created anything would fail with a foreign-key violation.
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "876000h",
  });
  if (banError) {
    return { error: banError.message };
  }

  const { error } = await admin.from("profiles").update({ is_active: false }).eq("id", userId);
  if (error) {
    return { error: error.message };
  }

  await logStaffAction(admin, profile.id, userId, "revoked");
  revalidatePath("/staff");
  return { error: "" };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function reactivateStaffAccess(userId: string, _prevState: { error: string } | null, _formData: FormData) {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    return { error: "Only leadership can reactivate access." };
  }

  const admin = createAdminClient();
  const { error: unbanError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (unbanError) {
    return { error: unbanError.message };
  }

  const { error } = await admin.from("profiles").update({ is_active: true }).eq("id", userId);
  if (error) {
    return { error: error.message };
  }

  await logStaffAction(admin, profile.id, userId, "reactivated");
  revalidatePath("/staff");
  return { error: "" };
}
