import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { canManageOperations } from "@/lib/roles";
import EditMemberForm from "./edit-form";
import { updateMember } from "./actions";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";

const SUBMISSION_STATUS_TONE: Record<string, BadgeTone> = {
  present: "brand",
  absent: "danger",
  excused: "warning",
};

const TYPE_LABELS: Record<string, string> = {
  attendance: "Attendance",
  message_review: "Message Review",
};

type ReviewPayload = { q1: number; q2: string; q3: boolean };

function asReviewPayload(payload: unknown): ReviewPayload | null {
  if (
    payload &&
    typeof payload === "object" &&
    "q1" in payload &&
    "q2" in payload &&
    "q3" in payload
  ) {
    return payload as ReviewPayload;
  }
  return null;
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: member } = await supabase.from("members").select("*").eq("id", id).single();
  if (!member) {
    notFound();
  }

  const { data: history } = await supabase
    .from("submissions")
    .select("*, activities(title, type, scheduled_date)")
    .eq("member_id", id)
    .order("submitted_at", { ascending: false });

  const boundAction = updateMember.bind(null, member.id);

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">{member.name}</h1>
      <p className="text-sm text-neutral-500">Joined {member.join_date}</p>

      <EditMemberForm
        member={member}
        action={boundAction}
        canManage={canManageOperations(profile.role)}
      />

      <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">Activity history</h2>
      <Card className="mt-2 overflow-hidden">
        <ul className="divide-y divide-neutral-100 text-sm">
          {history?.map((entry) => {
            const review = entry.activities?.type === "message_review" ? asReviewPayload(entry.response_payload) : null;
            return (
              <li key={entry.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-neutral-900">{entry.activities?.title ?? "Unknown activity"}</span>
                  <Badge tone="neutral">{TYPE_LABELS[entry.activities?.type ?? "attendance"]}</Badge>
                  <Badge tone={SUBMISSION_STATUS_TONE[entry.status]}>{entry.status}</Badge>
                  <span className="text-neutral-500">{entry.activities?.scheduled_date}</span>
                </div>
                {review && (
                  <p className="mt-1 text-neutral-600">
                    Rating {review.q1}/5 &middot; {review.q2}
                  </p>
                )}
              </li>
            );
          })}
          {(!history || history.length === 0) && (
            <li className="px-4 py-6 text-center text-neutral-400">No activity history yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
