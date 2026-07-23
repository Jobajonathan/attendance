"use client";

import { useActionState } from "react";
import { approveRegistrationRequest, rejectRegistrationRequest } from "./actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function RequestRowActions({ requestId }: { requestId: string }) {
  const boundApprove = approveRegistrationRequest.bind(null, requestId);
  const [approveState, approveAction, approvePending] = useActionState(boundApprove, null);

  const boundReject = rejectRegistrationRequest.bind(null, requestId);
  const [rejectState, rejectAction, rejectPending] = useActionState(boundReject, null);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <form action={approveAction}>
          <Button type="submit" size="sm" disabled={approvePending || rejectPending}>
            {approvePending ? "Approving..." : "Approve"}
          </Button>
        </form>
        <form
          action={rejectAction}
          onSubmit={(e) => {
            if (!confirm("Reject this registration request?")) e.preventDefault();
          }}
        >
          <Button type="submit" variant="danger" size="sm" disabled={approvePending || rejectPending}>
            {rejectPending ? "Rejecting..." : "Reject"}
          </Button>
        </form>
      </div>
      {approveState?.error && <Alert tone="error">{approveState.error}</Alert>}
      {rejectState?.error && <Alert tone="error">{rejectState.error}</Alert>}
    </div>
  );
}
