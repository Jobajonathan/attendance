import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { isLeadershipRole } from "@/lib/roles";
import { buildMonthlyDigestEmail } from "@/lib/celebration-digest";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default async function CelebrationsDigestPage() {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("members")
    .select("id, name, birthday, anniversary_date, join_date, status_manual");

  const digest = buildMonthlyDigestEmail(members ?? [], new Date());

  return (
    <div className="max-w-lg">
      <PageHeader title="Monthly Celebrations Digest" description="Preview of this month's birthday email." />

      <Alert tone="info" className="mt-4">
        Email delivery isn&apos;t wired up yet — this previews what would be sent once email
        integration is authorized.
      </Alert>

      <Card className="mt-4 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Subject</p>
        <p className="mt-1 text-sm font-medium text-neutral-900">{digest.subject}</p>

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-neutral-500">Body</p>
        <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-neutral-700">{digest.body}</pre>
      </Card>
    </div>
  );
}
