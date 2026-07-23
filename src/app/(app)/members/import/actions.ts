"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { parseCsvToObjects } from "@/lib/csv";
import { parseBirthdayInput } from "@/lib/birthday";
import type { TablesInsert } from "@/lib/supabase/database.types";

type ImportResult = {
  error?: string;
  createdCount?: number;
  skipped?: { row: number; reason: string }[];
  held?: { row: number; name: string; reason: string }[];
};

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

export async function importMembers(_prevState: ImportResult | null, formData: FormData): Promise<ImportResult> {
  const profile = await requireProfile();
  if (profile.role !== "administrative_officer") {
    return { error: "Only the Administrative Officer can import members." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file exported from the department's Google Sheet." };
  }

  const text = await file.text();
  const rows = parseCsvToObjects(text);
  if (rows.length === 0) {
    return { error: "The file has no data rows." };
  }

  const supabase = await createClient();
  const { data: existingMembers, error: fetchError } = await supabase
    .from("members")
    .select("name, phone_number");
  if (fetchError) {
    return { error: fetchError.message };
  }

  const existingByNormalizedName = new Map<string, { phone_number: string | null }[]>();
  for (const m of existingMembers ?? []) {
    const key = normalizeName(m.name);
    const list = existingByNormalizedName.get(key) ?? [];
    list.push({ phone_number: m.phone_number });
    existingByNormalizedName.set(key, list);
  }

  const skipped: ImportResult["skipped"] = [];
  const held: ImportResult["held"] = [];
  const toInsert: TablesInsert<"members">[] = [];
  const seenInBatch = new Set<string>();

  rows.forEach((raw, index) => {
    const rowNumber = index + 2; // header is row 1
    const name = raw.name?.trim();

    if (!name) {
      skipped.push({ row: rowNumber, reason: "missing required field: name" });
      return;
    }

    const phone = raw.phone_number?.trim() || null;
    const normalized = normalizeName(name);
    const existingMatches = existingByNormalizedName.get(normalized) ?? [];

    const exactDuplicate = phone && existingMatches.some((m) => m.phone_number === phone);
    const nearDuplicate = existingMatches.length > 0 && !exactDuplicate;
    const duplicateInBatch = seenInBatch.has(normalized);

    if (exactDuplicate) {
      held.push({ row: rowNumber, name, reason: "duplicate: same name and phone number already on file" });
      return;
    }
    if (duplicateInBatch) {
      held.push({ row: rowNumber, name, reason: "possible duplicate: same name appears earlier in this file" });
      return;
    }
    if (nearDuplicate) {
      held.push({ row: rowNumber, name, reason: "possible duplicate: matching name already on file, held for manual review" });
      return;
    }

    seenInBatch.add(normalized);
    toInsert.push({
      name,
      phone_number: phone,
      occupation: raw.occupation?.trim() || null,
      gender: raw.gender?.trim() || null,
      join_date: raw.join_date?.trim() || undefined,
      birthday: parseBirthdayInput(raw.birthday ?? ""),
      anniversary_date: raw.anniversary_date?.trim() || null,
      residential_address: raw.residential_address?.trim() || null,
      join_reason: raw.join_reason?.trim() || null,
      created_by: profile.id,
    });
  });

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("members").insert(toInsert);
    if (insertError) {
      return { error: insertError.message };
    }
  }

  return { createdCount: toInsert.length, skipped, held };
}
