"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { canManageOperations } from "@/lib/roles";

export async function updateServiceTemplate(
  templateId: string,
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    return { error: "Only the Administrative Officer or a super admin can manage service templates." };
  }

  const openDayOfWeek = Number(formData.get("open_day_of_week"));
  const closeDayOfWeek = Number(formData.get("close_day_of_week"));
  const openTime = String(formData.get("open_time") ?? "");
  const closeTime = String(formData.get("close_time") ?? "");
  const isActive = formData.get("is_active") === "on";

  if (!openTime || !closeTime) {
    return { error: "Open and close times are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("service_templates")
    .update({
      open_day_of_week: openDayOfWeek,
      open_time: openTime,
      close_day_of_week: closeDayOfWeek,
      close_time: closeTime,
      is_active: isActive,
    })
    .eq("id", templateId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings/services");
  return { error: "" };
}
