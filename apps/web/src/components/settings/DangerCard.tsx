"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

interface DangerCardProps {
  /** Email of the signed-in account, threaded down for the confirm match. */
  email: string | null;
}

/**
 * "Delete my account" entrypoint on the /settings page. Opens the
 * confirmation dialog; the actual destruction happens server-side via
 * `deleteAccountAction` (RGPD right to erasure — irreversible).
 */
export function DangerCard({ email }: DangerCardProps) {
  const t = useTranslations("settings.danger");
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center gap-3.5 rounded-lg border p-[18px]"
        style={{
          background: "rgba(255,77,109,0.04)",
          borderColor: "rgba(255,77,109,0.25)",
        }}
      >
        <span aria-hidden className="text-xl text-danger">⚠</span>
        <div className="flex-1">
          <div className="font-display text-[13px] font-semibold text-fg-1">
            {t("deleteTitle")}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-fg-3">
            {t("deleteSubtitle")}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-3.5 py-2 text-[11px] text-danger"
          style={{ borderColor: "rgba(255,77,109,0.4)" }}
          onClick={() => setOpen(true)}
          disabled={!email}
        >
          {t("deleteAction")}
        </Button>
      </div>

      <DeleteAccountDialog
        open={open}
        email={email}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
