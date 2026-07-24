import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { canManageOperations } from "@/lib/roles";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplateRowForm } from "./template-row-form";

const TYPE_LABELS: Record<string, string> = {
  attendance: "Attendance",
  message_review: "Message Review",
};

export default async function ServiceTemplatesPage() {
  const profile = await requireProfile();
  if (!canManageOperations(profile.role)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("service_templates")
    .select("*")
    .order("open_day_of_week", { ascending: true });

  return (
    <div>
      <Link href="/activities" className="text-sm text-brand underline">
        ← Back to Activities
      </Link>
      <PageHeader
        title="Weekly Services"
        description="These recurring services auto-create their activity each week when their window opens. Ad-hoc events (Holy Ghost Experience, IMC, etc.) are created directly from Activities — New Activity."
      />

      <Card className="mt-4 divide-y divide-neutral-100">
        {templates?.map((template) => (
          <div key={template.id} className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <p className="font-medium text-neutral-900">{template.name}</p>
              <Badge tone="neutral">{TYPE_LABELS[template.activity_type]}</Badge>
            </div>
            <TemplateRowForm template={template} />
          </div>
        ))}
        {templates?.length === 0 && <p className="p-4 text-center text-neutral-400">No service templates yet.</p>}
      </Card>
    </div>
  );
}
