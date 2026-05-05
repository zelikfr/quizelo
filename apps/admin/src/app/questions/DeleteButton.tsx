"use client";

import { useTransition } from "react";
import { deleteQuestionAction } from "./actions";

/**
 * Soft-delete affordance for the questions list. Sets `active=false`
 * and stamps `lintReviewedAt` so the next `db:seed` won't try to
 * resurrect the row. We don't hard-delete because `match_answers`
 * still references the question id and we need that history intact.
 *
 * Asks for confirmation before firing — soft-delete is reversible
 * (toggle active back on in the edit page) but the click is one-shot
 * from the list, so a guard keeps muscle-memory clicks safe.
 */
export function DeleteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer cette question ? (réversible — soft delete)")) return;
        start(async () => {
          await deleteQuestionAction(id);
        });
      }}
      className="rounded-md border border-danger/40 bg-danger/10 px-2.5 py-1 text-xs text-danger hover:bg-danger/20 disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
