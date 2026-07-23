"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { isLeadershipRole } from "@/lib/roles";

// prevState/formData are unused but required so this matches useActionState's
// (state, payload) => state shape once bound with the target memberId.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function markContacted(memberId: string, _prevState: { error: string } | null, _formData: FormData) {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    return { error: "Only leadership can mark a member as contacted." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_member_contacted", { p_member_id: memberId });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: "" };
}

export async function assignFollowUp(memberId: string, _prevState: { error: string } | null, formData: FormData) {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    return { error: "Only leadership can assign a follow-up." };
  }

  const assigneeName = String(formData.get("assignee_name") ?? "").trim();
  if (!assigneeName) {
    return { error: "Assignee name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("follow_up_assignments").insert({
    member_id: memberId,
    assignee_name: assigneeName,
    assignee_phone: String(formData.get("assignee_phone") ?? "").trim() || null,
    assigned_by: profile.id,
  });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: "" };
}
