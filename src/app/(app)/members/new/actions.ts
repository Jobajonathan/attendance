"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";

export async function createMember(_prevState: { error: string } | null, formData: FormData) {
  const profile = await requireProfile();
  if (profile.role !== "administrative_officer") {
    return { error: "Only the Administrative Officer can add members." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("members").insert({
    name,
    phone_number: String(formData.get("phone_number") ?? "").trim() || null,
    occupation: String(formData.get("occupation") ?? "").trim() || null,
    gender: String(formData.get("gender") ?? "").trim() || null,
    join_date: String(formData.get("join_date") ?? "") || undefined,
    birthday: String(formData.get("birthday") ?? "") || null,
    anniversary_date: String(formData.get("anniversary_date") ?? "") || null,
    residential_address: String(formData.get("residential_address") ?? "").trim() || null,
    join_reason: String(formData.get("join_reason") ?? "").trim() || null,
    created_by: profile.id,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/members");
}
