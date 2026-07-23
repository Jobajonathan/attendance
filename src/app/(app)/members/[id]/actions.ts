"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { canManageOperations } from "@/lib/roles";
import type { Tables } from "@/lib/supabase/database.types";

export async function updateMember(
  memberId: string,
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    return { error: "Only the Administrative Officer or a super admin can edit members." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const statusManual = String(formData.get("status_manual") ?? "");

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({
      name,
      phone_number: String(formData.get("phone_number") ?? "").trim() || null,
      occupation: String(formData.get("occupation") ?? "").trim() || null,
      gender: String(formData.get("gender") ?? "").trim() || null,
      marital_status: String(formData.get("marital_status") ?? "").trim() || null,
      birthday: String(formData.get("birthday") ?? "") || null,
      anniversary_date: String(formData.get("anniversary_date") ?? "") || null,
      residential_address: String(formData.get("residential_address") ?? "").trim() || null,
      join_reason: String(formData.get("join_reason") ?? "").trim() || null,
      status_manual: statusManual === "" ? null : (statusManual as Tables<"members">["status_manual"]),
      status_reason: String(formData.get("status_reason") ?? "").trim() || null,
    })
    .eq("id", memberId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/members/${memberId}`);
  revalidatePath("/members");
  return { error: "" };
}
