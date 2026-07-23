import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import EditActivityForm from "./edit-form";

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  if (profile.role !== "administrative_officer") {
    notFound();
  }

  const supabase = await createClient();
  const { data: activity } = await supabase.from("activities").select("*").eq("id", id).single();
  if (!activity) {
    notFound();
  }

  return <EditActivityForm activity={activity} />;
}
