import { createClient } from "@/lib/supabase/server";
import { CheckinForm } from "./checkin-form";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default async function CheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  // Opportunistic status sync — see the matching comment in /activities/page.tsx.
  // The very first visitor to a check-in link "wakes up" a stale scheduled/open
  // status, independent of staff activity or the coarse daily cron.
  await supabase.rpc("sync_activity_statuses");

  const { data: activityRows } = await supabase.rpc("get_checkin_activity", { p_link_token: token });
  const activity = activityRows?.[0];

  const members =
    activity?.status === "open"
      ? (await supabase.rpc("list_checkin_members", { p_link_token: token })).data ?? []
      : [];

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Logo size={40} className="mb-6" />
      <Card className="w-full max-w-sm p-8">
        {!activity ? (
          <Alert tone="info">This check-in link isn&apos;t valid.</Alert>
        ) : activity.status === "closed" ? (
          <>
            <h1 className="text-lg font-semibold text-slate-900">{activity.title}</h1>
            <Alert tone="info" className="mt-3">
              This session is closed. If you were present, let your Administrative Officer know
              directly.
            </Alert>
          </>
        ) : activity.status === "scheduled" ? (
          <>
            <h1 className="text-lg font-semibold text-slate-900">{activity.title}</h1>
            <Alert tone="info" className="mt-3">
              Check-in hasn&apos;t opened yet. It opens at {new Date(activity.opens_at).toLocaleString()}.
            </Alert>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-slate-900">{activity.title}</h1>
            <p className="mt-1 text-sm text-slate-500">Enter the keyword you were given to check in.</p>
            <CheckinForm token={token} members={members} />
          </>
        )}
      </Card>
    </div>
  );
}
