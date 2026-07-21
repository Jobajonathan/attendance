import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/current-profile";
import { deriveMemberStatus, MEMBER_STATUS_LABELS } from "@/lib/member-status";

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

  const canManage = profile.role === "administrative_officer";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Member Directory</h1>
        {canManage && (
          <div className="flex gap-2">
            <Link
              href="/members/import"
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Import from Google Sheets
            </Link>
            <Link
              href="/members/new"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800"
            >
              Add member
            </Link>
          </div>
        )}
      </div>

      <form method="get" className="mt-4">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name..."
          className="w-full max-w-sm rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}

      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {members?.map((member) => (
              <tr key={member.id} className="hover:bg-zinc-50">
                <td className="px-4 py-2">
                  <Link href={`/members/${member.id}`} className="font-medium text-zinc-900 hover:underline">
                    {member.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-500">{member.join_date}</td>
                <td className="px-4 py-2 text-zinc-500">
                  {MEMBER_STATUS_LABELS[deriveMemberStatus(member)]}
                </td>
                <td className="px-4 py-2 text-zinc-500">{member.phone_number ?? "—"}</td>
              </tr>
            ))}
            {members?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-400">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
