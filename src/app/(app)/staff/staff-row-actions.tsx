"use client";

import { useActionState } from "react";
import { updateStaffRole, revokeStaffAccess, reactivateStaffAccess } from "./actions";
import { ROLE_LABELS, type AppRole } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function StaffRowActions({
  userId,
  role,
  isActive,
  isSelf,
}: {
  userId: string;
  role: AppRole;
  isActive: boolean;
  isSelf: boolean;
}) {
  const boundUpdateRole = updateStaffRole.bind(null, userId);
  const [roleState, roleAction, rolePending] = useActionState(boundUpdateRole, null);

  const boundRevoke = revokeStaffAccess.bind(null, userId);
  const [revokeState, revokeAction, revokePending] = useActionState(boundRevoke, null);

  const boundReactivate = reactivateStaffAccess.bind(null, userId);
  const [reactivateState, reactivateAction, reactivatePending] = useActionState(boundReactivate, null);

  if (isSelf) {
    return <span className="text-xs text-neutral-400">This is you</span>;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={roleAction} className="flex items-center gap-2">
        <select
          name="role"
          defaultValue={role}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary" size="sm" disabled={rolePending}>
          {rolePending ? "Saving..." : "Save"}
        </Button>
      </form>

      <form
        action={isActive ? revokeAction : reactivateAction}
        onSubmit={(e) => {
          if (isActive && !confirm("Revoke this person's access? They'll be signed out and unable to log in.")) {
            e.preventDefault();
          }
        }}
      >
        <Button type="submit" variant={isActive ? "danger" : "secondary"} size="sm" disabled={revokePending || reactivatePending}>
          {isActive ? (revokePending ? "Revoking..." : "Revoke") : reactivatePending ? "Reactivating..." : "Reactivate"}
        </Button>
      </form>

      {roleState?.error && <Alert tone="error">{roleState.error}</Alert>}
      {revokeState?.error && <Alert tone="error">{revokeState.error}</Alert>}
      {reactivateState?.error && <Alert tone="error">{reactivateState.error}</Alert>}
    </div>
  );
}
