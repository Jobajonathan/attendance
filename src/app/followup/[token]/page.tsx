import { createClient } from "@/lib/supabase/server";
import { FollowUpForm } from "./followup-form";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default async function FollowUpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: assignmentRows } = await supabase.rpc("get_follow_up_assignment", { p_token: token });
  const assignment = assignmentRows?.[0];

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <Logo size={40} className="mb-6" />
      <Card className="w-full max-w-sm p-8">
        {!assignment ? (
          <Alert tone="info">This follow-up link isn&apos;t valid.</Alert>
        ) : (
          <>
            <h1 className="font-heading text-lg font-semibold text-neutral-900">Follow up: {assignment.member_name}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Thanks for reaching out. Once you&apos;ve spoken with {assignment.member_name}, share a quick note
              below.
            </p>
            <FollowUpForm token={token} memberName={assignment.member_name} alreadyDone={assignment.status === "done"} />
          </>
        )}
      </Card>
    </div>
  );
}
