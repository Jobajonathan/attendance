"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";

export async function updateMember(
  memberId: string,
  _prevState: { error: string } | null,
  formData: FormData,
) {
  const profile = await requireProfile();
  if (profile.role !== "administrative_officer") {
    return { error: "Only the Administrative Officer can edit members." };
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
      gender: String(formData.get("gender") ?? "").trim() || null,
      birthday: String(formData.get("birthday") ?? "") || null,
      anniversary_date: String(formData.get("anniversary_date") ?? "") || null,
      status_manual: statusManual === "" ? null : (statusManual as "active" | "transferred" | "inactive"),
    })
    .eq("id", memberId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/members/${memberId}`);
  revalidatePath("/members");
  return { error: "" };
}
