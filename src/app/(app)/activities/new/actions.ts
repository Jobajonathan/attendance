"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { generateActivityKeyword } from "@/lib/activity-keyword";
import { datetimeLocalToUtcIso } from "@/lib/timezone";
import { canManageOperations } from "@/lib/roles";
import type { Enums } from "@/lib/supabase/database.types";

export async function createActivity(_prevState: { error: string } | null, formData: FormData) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    return { error: "Only the Administrative Officer or a super admin can create activities." };
  }

  const typeRaw = String(formData.get("type") ?? "attendance");
  const type: Enums<"activity_type"> = typeRaw === "message_review" ? "message_review" : "attendance";

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

  // Message Review has no geofence concept — ignore any submitted values
  // regardless of type, rather than trusting the client to have hidden them.
  const latRaw = type === "attendance" ? String(formData.get("location_lat") ?? "").trim() : "";
  const lngRaw = type === "attendance" ? String(formData.get("location_lng") ?? "").trim() : "";
  const radiusRaw = type === "attendance" ? String(formData.get("geofence_radius_m") ?? "").trim() : "";
  const keywordNoLocationRaw =
    type === "attendance" ? String(formData.get("keyword_no_location") ?? "").trim() : "";

  // FR-ATT-09: an activity scheduled for a date already in the past is backfilled
  // history, not a live session, and stays out of real-time dashboard cards later.
  const isBackfilled = scheduledDate < new Date().toISOString().slice(0, 10);

  const supabase = await createClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("activities").insert({
      type,
      title,
      scheduled_date: scheduledDate,
      opens_at: datetimeLocalToUtcIso(opensAt),
      closes_at: datetimeLocalToUtcIso(closesAt),
      location_lat: latRaw ? Number(latRaw) : null,
      location_lng: lngRaw ? Number(lngRaw) : null,
      geofence_radius_m: radiusRaw ? Number(radiusRaw) : null,
      keyword: generateActivityKeyword(),
      keyword_no_location: keywordNoLocationRaw ? keywordNoLocationRaw.toUpperCase() : null,
      is_backfilled: isBackfilled,
      created_by: profile.id,
    });

    if (!error) {
      redirect("/activities");
    }
    // Unique-keyword collision (astronomically unlikely at 6 chars) — retry with a fresh one.
    if (error.code !== "23505") {
      return { error: error.message };
    }
  }

  return { error: "Could not generate a unique keyword. Please try again." };
}
