"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const CARD_BG =
  "linear-gradient(135deg, rgba(124,92,255,0.18), rgba(255,209,102,0.06))";
const CARD_BG_MOBILE =
  "linear-gradient(135deg, rgba(124,92,255,0.20), rgba(255,209,102,0.08))";

interface ReferralCodeCardProps {
  /** Live referral code (already lazy-created server-side). */
  code: string;
  compact?: boolean;
}

/**
 * Shows the user's personal referral code with copy-to-clipboard + a
 * native-share button. Client component because both interactions
 * touch browser APIs (`navigator.clipboard`, `navigator.share`).
 *
 * If the browser doesn't have `navigator.share` (most desktop
 * browsers), the share button copies the URL to the clipboard
 * instead — never leaves the user with a dead button.
 */
export function ReferralCodeCard({ code, compact = false }: ReferralCodeCardProps) {
  const t = useTranslations("referral.code");
  const tShare = useTranslations("referral.share");
  const [copyState, setCopyState] = useState<"idle" | "code" | "url">("idle");

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/signup?ref=${encodeURIComponent(code)}`
      : `/auth/signup?ref=${encodeURIComponent(code)}`;

  async function copyToClipboard(text: string): Promise<boolean> {
    // Modern path — Clipboard API. Requires a "secure context"
    // (localhost / 127.0.0.1 / HTTPS); fails silently on bare LAN
    // IPs like `192.168.1.94`, which is exactly how we test multi-
    // device locally.
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // fall through to legacy path
      }
    }
    // Legacy path — works on HTTP non-secure contexts (LAN IPs).
    // Render a hidden textarea, select it, ask the browser to copy.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      ta.style.pointerEvents = "none";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  async function copyCode() {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopyState("code");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  async function shareLink() {
    const data: ShareData = {
      title: tShare("title"),
      text: tShare("text", { code }),
      url: shareUrl,
    };
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      canShare?: (data: ShareData) => boolean;
    };

    // Try Web Share API first — Chrome/Safari mobile, Safari macOS,
    // some Chromium desktops. Only call it when `canShare()` says yes,
    // otherwise the call would throw on desktops that expose the API
    // but reject most payloads.
    const canUseShare =
      typeof nav.share === "function" &&
      (typeof nav.canShare !== "function" || nav.canShare(data));

    if (canUseShare && nav.share) {
      try {
        await nav.share(data);
        return;
      } catch (err) {
        // User cancelled the sheet → AbortError → swallow silently.
        // Anything else (NotAllowedError, etc.) → fall through to
        // the clipboard fallback so the button always does something.
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        // fall through
      }
    }

    // Clipboard fallback — handles both the modern Clipboard API and
    // the legacy `execCommand("copy")` path so the button still works
    // on bare LAN IPs (non-secure contexts).
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopyState("url");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  if (compact) {
    return (
      <div
        className="rounded-[14px] border p-3.5"
        style={{ background: CARD_BG_MOBILE, borderColor: "rgba(124,92,255,0.4)" }}
      >
        <div className="font-mono text-[9px] tracking-[0.18em] text-fg-3">
          {t("titleShort")}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className="flex-1 rounded-[10px] border-dashed border bg-black/40 px-3.5 py-3 text-center font-mono text-lg font-bold tracking-[0.15em] text-gold"
            style={{ borderColor: "rgba(255,209,102,0.4)" }}
          >
            {code}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-3 py-2.5"
            aria-label={t("copy")}
            onClick={copyCode}
          >
            {copyState === "code" ? "✓" : "⧉"}
          </Button>
        </div>
        <Button
          type="button"
          variant="primary"
          size="full"
          className="mt-2.5 justify-center py-2.5 text-xs"
          onClick={shareLink}
        >
          {copyState === "url" ? `${tShare("copied")} ✓` : `${t("share")} ▸`}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border p-5"
      style={{ background: CARD_BG, borderColor: "rgba(124,92,255,0.4)" }}
    >
      <div className="font-mono text-[10px] tracking-[0.2em] text-fg-3">
        {t("title")}
      </div>
      <div className="mt-2.5 flex items-center gap-3">
        <div
          className="flex-1 rounded-xl border-dashed border bg-black/40 px-[18px] py-3.5 font-mono text-[26px] font-bold tracking-[0.15em] text-gold"
          style={{ borderColor: "rgba(255,209,102,0.4)" }}
        >
          {code}
        </div>
        <Button type="button" variant="ghost" size="md" className="px-3.5 py-3" onClick={copyCode}>
          {copyState === "code" ? `✓ ${tShare("copied")}` : `⧉ ${t("copy")}`}
        </Button>
      </div>
      <Button
        variant="primary"
        size="full"
        className="mt-3 justify-center py-2.5 text-xs"
        onClick={shareLink}
      >
        {copyState === "url" ? `${tShare("copied")} ✓` : `${t("share")} ▸`}
      </Button>
      <p className="mt-2 truncate font-mono text-[10px] text-fg-3">{shareUrl}</p>
    </div>
  );
}
