import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { CloseActivityButton, ReopenActivityButton } from "./activity-actions";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: activity } = await supabase.from("activities").select("*").eq("id", id).single();
  if (!activity) {
    notFound();
  }

  const [{ data: submissions }, { data: auditEntries }] = await Promise.all([
    supabase
      .from("submissions")
      .select("*, members(name)")
      .eq("activity_id", id)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("audit_log")
      .select("*, profiles(full_name)")
      .eq("entity_type", "activity")
      .eq("entity_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const headerList = await headers();
  const origin = `${headerList.get("x-forwarded-proto") ?? "https"}://${headerList.get("host")}`;
  const checkinUrl = `${origin}/checkin/${activity.link_token}`;
  const canClose = ["administrative_officer", "head_of_department"].includes(profile.role);
  const canReopen = profile.role === "head_of_department";

  const presentCount = submissions?.filter((s) => s.status === "present").length ?? 0;
  const absentCount = submissions?.filter((s) => s.status === "absent").length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">{activity.title}</h1>
      <p className="text-sm text-zinc-500">
        {activity.scheduled_date} &middot; {new Date(activity.opens_at).toLocaleString()} &ndash;{" "}
        {new Date(activity.closes_at).toLocaleString()} &middot;{" "}
        <span className="capitalize">{activity.status}</span>
        {activity.is_backfilled && " (backfilled)"}
      </p>

      {activity.status !== "closed" && (
        <div className="mt-4 rounded-md border border-zinc-200 bg-white p-4">
          <p className="text-sm font-medium text-zinc-700">Check-in keyword: {activity.keyword}</p>
          <p className="mt-1 break-all text-sm text-zinc-600">
            Link: <a href={checkinUrl} className="underline">{checkinUrl}</a>
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-6">
        {canClose && activity.status !== "closed" && <CloseActivityButton activityId={activity.id} />}
        {canReopen && activity.status === "closed" && <ReopenActivityButton activityId={activity.id} />}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">
        Roster {submissions ? `(${presentCount} present, ${absentCount} absent)` : ""}
      </h2>
      <div className="mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-2">Member</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Submitted</th>
              <th className="px-4 py-2">Geofence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {submissions?.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-zinc-900">{s.members?.name}</td>
                <td className="px-4 py-2 capitalize text-zinc-700">{s.status}</td>
                <td className="px-4 py-2 text-zinc-500">{new Date(s.submitted_at).toLocaleString()}</td>
                <td className="px-4 py-2 text-zinc-500">{s.geofence_outcome}</td>
              </tr>
            ))}
            {(!submissions || submissions.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                  {activity.status === "closed" ? "No one checked in." : "No check-ins yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {auditEntries && auditEntries.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-zinc-900">Audit log</h2>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {auditEntries.map((entry) => (
              <li key={entry.id}>
                {new Date(entry.created_at).toLocaleString()} &mdash; {entry.action} by{" "}
                {entry.profiles?.full_name ?? "unknown"}
                {entry.reason && <>: &ldquo;{entry.reason}&rdquo;</>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
