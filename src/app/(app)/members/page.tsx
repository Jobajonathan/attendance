import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { deriveMemberStatus, MEMBER_STATUS_LABELS } from "@/lib/member-status";
import { canManageOperations } from "@/lib/roles";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

const MEMBER_STATUS_TONE: Record<string, BadgeTone> = {
  active: "success",
  suspended: "danger",
  relocated: "neutral",
  out_of_town: "warning",
  other: "neutral",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const profile = await requireProfile();
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("members").select("*").order("name", { ascending: true });
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  const { data: members, error } = await query;

  const canManage = canManageOperations(profile.role);

  return (
    <div>
      <PageHeader
        title="Member Directory"
        action={
          canManage && (
            <div className="flex gap-2">
              <LinkButton href="/members/import" variant="secondary" size="sm">
                Import Members
              </LinkButton>
              <LinkButton href="/members/new" size="sm">
                Add member
              </LinkButton>
            </div>
          )
        }
      />

      <form method="get" className="mt-4">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name..."
          className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </form>

      {error && (
        <Alert tone="error" className="mt-4">
          {error.message}
        </Alert>
      )}

      <Card className="mt-4 overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-2">S/N</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Occupation</th>
              <th className="px-4 py-2">Marital Status</th>
              <th className="px-4 py-2">Residential Address</th>
              {canManage && <th className="px-4 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {members?.map((member, index) => {
              const status = deriveMemberStatus(member);
              return (
                <tr key={member.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2 text-neutral-500">{index + 1}</td>
                  <td className="px-4 py-2">
                    <Link href={`/members/${member.id}`} className="font-medium text-neutral-900 hover:text-brand">
                      {member.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-neutral-500">{member.join_date}</td>
                  <td className="px-4 py-2">
                    <Badge tone={MEMBER_STATUS_TONE[status]}>{MEMBER_STATUS_LABELS[status]}</Badge>
                  </td>
                  <td className="px-4 py-2 text-neutral-500">{member.phone_number ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-500">{member.occupation ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-500 capitalize">{member.marital_status ?? "—"}</td>
                  <td className="px-4 py-2 text-neutral-500">{member.residential_address ?? "—"}</td>
                  {canManage && (
                    <td className="px-4 py-2">
                      <LinkButton href={`/members/${member.id}`} variant="secondary" size="sm">
                        Edit
                      </LinkButton>
                    </td>
                  )}
                </tr>
              );
            })}
            {members?.length === 0 && (
              <tr>
                <td colSpan={canManage ? 9 : 8} className="px-4 py-6 text-center text-neutral-400">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
