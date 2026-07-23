import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import EditMemberForm from "./edit-form";
import { updateMember } from "./actions";

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: member } = await supabase.from("members").select("*").eq("id", id).single();
  if (!member) {
    notFound();
  }

  const boundAction = updateMember.bind(null, member.id);

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">{member.name}</h1>
      <p className="text-sm text-neutral-500">Joined {member.join_date}</p>

      <EditMemberForm
        member={member}
        action={boundAction}
        canManage={profile.role === "administrative_officer"}
      />
    </div>
  );
}
