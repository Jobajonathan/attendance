"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/roles";

export async function signIn(_prevState: { error: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "This account has no ProtocolOS role assigned. Contact an administrator." };
  }

  redirect(homePathForRole(profile.role));
}
