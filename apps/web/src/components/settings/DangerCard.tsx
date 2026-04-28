import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export async function DangerCard() {
  const t = await getTranslations("settings.danger");

  return (
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
        variant="ghost"
        size="sm"
        className="px-3.5 py-2 text-[11px] text-danger"
        style={{ borderColor: "rgba(255,77,109,0.4)" }}
      >
        {t("deleteAction")}
      </Button>
    </div>
  );
}
