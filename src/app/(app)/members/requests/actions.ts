"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { canManageOperations } from "@/lib/roles";

// prevState/formData are unused but required so this matches useActionState's
// (state, payload) => state shape once bound with the target requestId.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function approveRegistrationRequest(requestId: string, _prevState: { error: string } | null, _formData: FormData) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    return { error: "Only the Administrative Officer or a super admin can review registrations." };
  }

  const supabase = await createClient();
  const { data: request, error: fetchError } = await supabase
    .from("member_registration_requests")
    .select("*")
    .eq("id", requestId)
    .single();
  if (fetchError || !request) {
    return { error: fetchError?.message ?? "Registration request not found." };
  }
  if (request.status !== "pending") {
    return { error: "This request has already been reviewed." };
  }

  const { error: insertError } = await supabase.from("members").insert({
    name: request.name,
    phone_number: request.phone_number,
    occupation: request.occupation,
    gender: request.gender,
    marital_status: request.marital_status,
    birthday: request.birthday,
    anniversary_date: request.anniversary_date,
    residential_address: request.residential_address,
    join_reason: request.join_reason,
    created_by: profile.id,
  });
  if (insertError) {
    return { error: insertError.message };
  }

  const { error: updateError } = await supabase
    .from("member_registration_requests")
    .update({ status: "approved", reviewed_by: profile.id, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);
  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/members/requests");
  revalidatePath("/members");
  return { error: "" };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function rejectRegistrationRequest(requestId: string, _prevState: { error: string } | null, _formData: FormData) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    return { error: "Only the Administrative Officer or a super admin can review registrations." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("member_registration_requests")
    .update({ status: "rejected", reviewed_by: profile.id, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending");
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/members/requests");
  return { error: "" };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateRegistrationLink(_prevState: { error: string } | null, _formData: FormData) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    return { error: "Only the Administrative Officer or a super admin can manage the registration link." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("registration_links").insert({ created_by: profile.id });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/members/requests");
  return { error: "" };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function setRegistrationLinkActive(linkId: string, isActive: boolean, _prevState: { error: string } | null, _formData: FormData) {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    return { error: "Only the Administrative Officer or a super admin can manage the registration link." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("registration_links").update({ is_active: isActive }).eq("id", linkId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/members/requests");
  return { error: "" };
}
