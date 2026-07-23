"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { datetimeLocalToUtcIso } from "@/lib/timezone";
import { canManageOperations } from "@/lib/roles";

export async function updateActivity(
  activityId: string,
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    return { error: "Only the Administrative Officer or a super admin can edit activities." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const scheduledDate = String(formData.get("scheduled_date") ?? "");
  const opensAt = String(formData.get("opens_at") ?? "");
  const closesAt = String(formData.get("closes_at") ?? "");

  if (!title || !scheduledDate || !opensAt || !closesAt) {
    return { error: "Title, scheduled date, opening time, and closing time are all required." };
  }
  if (new Date(closesAt) <= new Date(opensAt)) {
    return { error: "Closing time must be after opening time." };
  }

  const supabase = await createClient();
  const { data: activity } = await supabase
    .from("activities")
    .select("type")
    .eq("id", activityId)
    .single();
  if (!activity) {
    return { error: "Activity not found." };
  }

  const isAttendance = activity.type === "attendance";
  const latRaw = isAttendance ? String(formData.get("location_lat") ?? "").trim() : "";
  const lngRaw = isAttendance ? String(formData.get("location_lng") ?? "").trim() : "";
  const radiusRaw = isAttendance ? String(formData.get("geofence_radius_m") ?? "").trim() : "";
  const keywordNoLocationRaw = isAttendance
    ? String(formData.get("keyword_no_location") ?? "").trim()
    : "";

  const { error } = await supabase
    .from("activities")
    .update({
      title,
      scheduled_date: scheduledDate,
      opens_at: datetimeLocalToUtcIso(opensAt),
      closes_at: datetimeLocalToUtcIso(closesAt),
      location_lat: latRaw ? Number(latRaw) : null,
      location_lng: lngRaw ? Number(lngRaw) : null,
      geofence_radius_m: radiusRaw ? Number(radiusRaw) : null,
      keyword_no_location: keywordNoLocationRaw ? keywordNoLocationRaw.toUpperCase() : null,
    })
    .eq("id", activityId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/activities/${activityId}`);
  revalidatePath("/activities");
  return { error: "" };
}
