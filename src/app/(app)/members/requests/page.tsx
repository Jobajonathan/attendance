import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { canManageOperations } from "@/lib/roles";
import { getOrCreateShortLink } from "@/lib/short-link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ShareableLink } from "@/components/shareable-link";
import { RequestRowActions } from "./request-row-actions";
import { GenerateLinkButton, ToggleLinkButton } from "./link-actions";

const STATUS_TONE: Record<string, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default async function MemberRequestsPage() {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    notFound();
  }

  const supabase = await createClient();
  const [{ data: requests }, { data: links }] = await Promise.all([
    supabase.from("member_registration_requests").select("*").order("submitted_at", { ascending: false }),
    supabase.from("registration_links").select("*").order("created_at", { ascending: false }).limit(1),
  ]);

  const currentLink = links?.[0];
  const headerList = await headers();
  const origin = `${headerList.get("x-forwarded-proto") ?? "https"}://${headerList.get("host")}`;
  const registrationShortCode = currentLink
    ? await getOrCreateShortLink(supabase, `/register/${currentLink.token}`)
    : null;
  const registrationUrl = registrationShortCode ? `${origin}/s/${registrationShortCode}` : null;

  const pending = requests?.filter((r) => r.status === "pending") ?? [];
  const reviewed = requests?.filter((r) => r.status !== "pending") ?? [];

  return (
    <div>
      <PageHeader
        title="Member Registration Requests"
        description="Self-service sign-ups submitted through the public registration link, awaiting your review."
      />

      <Card className="mt-4 p-4">
        <p className="text-sm font-medium text-neutral-700">Registration link</p>
        <p className="mt-1 text-xs text-neutral-400">
          Public — anyone with this link can fill the form without logging in. Share it freely.
        </p>
        {currentLink ? (
          <>
            <ShareableLink url={registrationUrl!} label="Member registration" className="mt-2" />
            <div className="mt-3 flex items-center gap-2">
              <Badge tone={currentLink.is_active ? "success" : "neutral"}>
                {currentLink.is_active ? "Active" : "Revoked"}
              </Badge>
              <ToggleLinkButton linkId={currentLink.id} isActive={currentLink.is_active} />
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-neutral-400">No registration link generated yet.</p>
        )}
        <div className="mt-3">
          <GenerateLinkButton />
        </div>
      </Card>

      <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">Pending ({pending.length})</h2>
      <Card className="mt-2 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Submitted</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {pending.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2 text-neutral-900">{r.name}</td>
                <td className="px-4 py-2 text-neutral-500">{r.phone_number ?? "—"}</td>
                <td className="px-4 py-2 text-neutral-500">{new Date(r.submitted_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <RequestRowActions requestId={r.id} />
                </td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  No pending requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {reviewed.length > 0 && (
        <>
          <h2 className="font-heading mt-8 text-lg font-semibold text-neutral-900">Reviewed</h2>
          <Card className="mt-2 overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Reviewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reviewed.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-neutral-900">{r.name}</td>
                    <td className="px-4 py-2">
                      <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-neutral-500">
                      {r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
