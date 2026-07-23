import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/current-profile";
import { createClient } from "@/lib/supabase/server";
import { isLeadershipRole, ROLE_LABELS } from "@/lib/roles";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StaffRowActions } from "./staff-row-actions";

export default async function StaffPage() {
  const profile = await requireProfile();
  if (!isLeadershipRole(profile.role)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage who has an account and what role they hold."
        action={
          <LinkButton href="/staff/new" size="sm">
            Invite staff
          </LinkButton>
        }
      />

      <Card className="mt-4 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {staff?.map((member) => (
              <tr key={member.id}>
                <td className="px-4 py-2 text-neutral-900">{member.full_name}</td>
                <td className="px-4 py-2 text-neutral-500">{member.email ?? "—"}</td>
                <td className="px-4 py-2 text-neutral-500">{ROLE_LABELS[member.role]}</td>
                <td className="px-4 py-2">
                  <Badge tone={member.is_active ? "success" : "neutral"}>
                    {member.is_active ? "Active" : "Revoked"}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  <StaffRowActions
                    userId={member.id}
                    role={member.role}
                    isActive={member.is_active}
                    isSelf={member.id === profile.id}
                  />
                </td>
              </tr>
            ))}
            {staff?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  No staff yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
