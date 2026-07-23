"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { generateActivityKeyword } from "@/lib/activity-keyword";

export async function createActivity(_prevState: { error: string } | null, formData: FormData) {
  const profile = await requireProfile();
  if (profile.role !== "administrative_officer") {
    return { error: "Only the Administrative Officer can create activities." };
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

  const latRaw = String(formData.get("location_lat") ?? "").trim();
  const lngRaw = String(formData.get("location_lng") ?? "").trim();
  const radiusRaw = String(formData.get("geofence_radius_m") ?? "").trim();

  // FR-ATT-09: an activity scheduled for a date already in the past is backfilled
  // history, not a live session, and stays out of real-time dashboard cards later.
  const isBackfilled = scheduledDate < new Date().toISOString().slice(0, 10);

  const supabase = await createClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("activities").insert({
      type: "attendance",
      title,
      scheduled_date: scheduledDate,
      opens_at: new Date(opensAt).toISOString(),
      closes_at: new Date(closesAt).toISOString(),
      location_lat: latRaw ? Number(latRaw) : null,
      location_lng: lngRaw ? Number(lngRaw) : null,
      geofence_radius_m: radiusRaw ? Number(radiusRaw) : null,
      keyword: generateActivityKeyword(),
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
