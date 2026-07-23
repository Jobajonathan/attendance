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
