import { createClient } from "@/lib/supabase/server";
import { CheckinForm } from "./checkin-form";

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
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        {!activity ? (
          <p className="text-sm text-zinc-700">This check-in link isn&apos;t valid.</p>
        ) : activity.status === "closed" ? (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">{activity.title}</h1>
            <p className="mt-2 text-sm text-zinc-700">
              This session is closed. If you were present, let your Administrative Officer know
              directly.
            </p>
          </>
        ) : activity.status === "scheduled" ? (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">{activity.title}</h1>
            <p className="mt-2 text-sm text-zinc-700">
              Check-in hasn&apos;t opened yet. It opens at{" "}
              {new Date(activity.opens_at).toLocaleString()}.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-zinc-900">{activity.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">Enter the keyword you were given to check in.</p>
            <CheckinForm token={token} members={members} />
          </>
        )}
      </div>
    </div>
  );
}
