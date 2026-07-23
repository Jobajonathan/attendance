import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkContactedButton } from "./mark-contacted-button";
import { AssignFollowUpForm } from "./assign-followup-form";
import type { Database } from "@/lib/supabase/database.types";

type FollowUpRow = Database["public"]["Functions"]["get_needs_follow_up"]["Returns"][number];

export type FollowUpAssignment = {
  assigneeName: string;
  status: string;
  url: string;
};

export function NeedsFollowUpTable({
  rows,
  canContact,
  assignments,
}: {
  rows: FollowUpRow[];
  canContact: boolean;
  assignments: Map<string, FollowUpAssignment>;
}) {
  return (
    <Card className="mt-2 overflow-hidden">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="px-4 py-2">Member</th>
            <th className="px-4 py-2">Consecutive absences</th>
            <th className="px-4 py-2">Last contacted</th>
            <th className="px-4 py-2">Follow-up assignment</th>
            {canContact && <th className="px-4 py-2" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((row) => {
            const assignment = assignments.get(row.member_id);
            return (
              <tr key={row.member_id}>
                <td className="px-4 py-2 text-neutral-900">{row.member_name}</td>
                <td className="px-4 py-2">
                  <Badge tone="warning">{row.consecutive_absences}</Badge>
                </td>
                <td className="px-4 py-2 text-neutral-500">
                  {row.last_contacted_at
                    ? `${new Date(row.last_contacted_at).toLocaleDateString()} by ${row.last_contacted_by ?? "unknown"}`
                    : "—"}
                </td>
                <td className="px-4 py-2">
                  {assignment ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-900">{assignment.assigneeName}</span>
                        <Badge tone={assignment.status === "done" ? "success" : "warning"}>
                          {assignment.status === "done" ? "Done" : "Pending"}
                        </Badge>
                      </div>
                      {assignment.status !== "done" && canContact && (
                        <a href={assignment.url} className="block break-all text-xs text-brand underline">
                          {assignment.url}
                        </a>
                      )}
                    </div>
                  ) : canContact ? (
                    <AssignFollowUpForm memberId={row.member_id} />
                  ) : (
                    <span className="text-neutral-400">Unassigned</span>
                  )}
                </td>
                {canContact && (
                  <td className="px-4 py-2">
                    <MarkContactedButton memberId={row.member_id} />
                  </td>
                )}
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={canContact ? 5 : 4} className="px-4 py-6 text-center text-neutral-400">
                No one needs follow-up right now.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
