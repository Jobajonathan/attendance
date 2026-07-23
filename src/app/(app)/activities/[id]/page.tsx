import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { CloseActivityButton, ReopenActivityButton } from "./activity-actions";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";

const ACTIVITY_STATUS_TONE: Record<string, BadgeTone> = {
  scheduled: "neutral",
  open: "brand",
  closed: "neutral",
};

const SUBMISSION_STATUS_TONE: Record<string, BadgeTone> = {
  present: "brand",
  absent: "danger",
  excused: "warning",
};

const GEOFENCE_TONE: Record<string, BadgeTone> = {
  match: "success",
  mismatch: "warning",
  unknown: "neutral",
};

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
      <h1 className="font-heading text-2xl font-semibold text-neutral-900">{activity.title}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
        <span>
          {activity.scheduled_date} &middot; {new Date(activity.opens_at).toLocaleString()} &ndash;{" "}
          {new Date(activity.closes_at).toLocaleString()}
        </span>
        <Badge tone={ACTIVITY_STATUS_TONE[activity.status]}>{activity.status}</Badge>
        {activity.is_backfilled && <Badge tone="warning">Backfilled</Badge>}
      </p>

      {activity.status !== "closed" && (
        <Card className="mt-4 p-4">
          <p className="text-sm font-medium text-neutral-700">Check-in keyword: {activity.keyword}</p>
          <p className="mt-1 break-all text-sm text-neutral-600">
            Link: <a href={checkinUrl} className="text-brand underline">{checkinUrl}</a>
          </p>
        </Card>
      )}

      <div className="mt-4 flex gap-6">
        {canClose && activity.status !== "closed" && <CloseActivityButton activityId={activity.id} />}
        {canReopen && activity.status === "closed" && <ReopenActivityButton activityId={activity.id} />}
      </div>

      <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">
        Roster {submissions ? `(${presentCount} present, ${absentCount} absent)` : ""}
      </h2>
      <Card className="mt-2 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-2">Member</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Submitted</th>
              <th className="px-4 py-2">Geofence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {submissions?.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-neutral-900">{s.members?.name}</td>
                <td className="px-4 py-2">
                  <Badge tone={SUBMISSION_STATUS_TONE[s.status]}>{s.status}</Badge>
                </td>
                <td className="px-4 py-2 text-neutral-500">{new Date(s.submitted_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  {s.geofence_outcome && <Badge tone={GEOFENCE_TONE[s.geofence_outcome]}>{s.geofence_outcome}</Badge>}
                </td>
              </tr>
            ))}
            {(!submissions || submissions.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  {activity.status === "closed" ? "No one checked in." : "No check-ins yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {auditEntries && auditEntries.length > 0 && (
        <>
          <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">Audit log</h2>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
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
