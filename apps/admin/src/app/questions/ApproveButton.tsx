"use client";

import { useTransition } from "react";
import { approveQuestionAction } from "./actions";

/**
 * One-click "this flagged question is fine" affordance for the
 * questions list. Clears `lintReason` and flips `active = true`.
 *
 * Lives next to the Edit link so reviewers don't have to navigate
 * into each question that's a clear false positive (most are: the
 * shape-leak rules are conservative enough that real edits are the
 * minority of the queue).
 */
export function ApproveButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await approveQuestionAction(id);
        })
      }
      className="rounded-md border border-success/40 bg-success/10 px-2.5 py-1 text-xs text-success hover:bg-success/20 disabled:opacity-50"
    >
      {pending ? "…" : "Approve"}
    </button>
  );
}
