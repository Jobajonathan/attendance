"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { canManageOperations, isLeadershipRole } from "@/lib/roles";

export async function closeActivity(activityId: string) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role) && !isLeadershipRole(profile.role)) {
    return { error: "You don't have permission to close this activity." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("close_activity", { p_activity_id: activityId });
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/activities");
  return { error: "" };
}

export async function reopenActivity(
  activityId: string,
  _prevState: { error: string; reasonRequired?: boolean } | null,
  formData: FormData,
) {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    return { error: "Only leadership can reopen a closed activity." };
  }

  const reason = String(formData.get("reason") ?? "").trim() || undefined;

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("reopen_activity", { p_activity_id: activityId, p_reason: reason })
    .single();

  if (error) {
    return { error: error.message };
  }
  if (data?.outcome === "reason_required") {
    return {
      error: "This activity closed on a different day — a reason is required to reopen it.",
      reasonRequired: true,
    };
  }

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/activities");
  return { error: "" };
}
