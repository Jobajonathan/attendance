import { PageHeader } from "@/components/ui/page-header";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Leadership Dashboard" />
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        The composite Engagement metric, snapshot and trend views, and the Needs Follow Up list
        (PRD Section 4.7, FR-DSH-01 to 09) are built in Phase 6, once Attendance, Leave, Message
        Review, and Celebrations exist to aggregate. This placeholder confirms leadership roles
        land here on login per Section 6.2.
      </p>
    </div>
  );
}
