import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

// Reuses an existing short code for the same target path where possible,
// so re-rendering a page doesn't mint a new code every time.
export async function getOrCreateShortLink(
  supabase: SupabaseClient<Database>,
  targetPath: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("short_links")
    .select("code")
    .eq("target_path", targetPath)
    .maybeSingle();
  if (existing) {
    return existing.code;
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { data, error } = await supabase
      .from("short_links")
      .insert({ code, target_path: targetPath })
      .select("code")
      .single();
    if (!error) {
      return data.code;
    }
    if (error.code !== "23505") {
      throw error;
    }
  }
  throw new Error("Could not generate a unique short link code.");
}
