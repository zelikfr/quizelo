"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Standard `beforeinstallprompt` event shape. Not in lib.dom yet
 * (still considered experimental), so we declare the bits we use.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

/**
 * "Install Quizelo" CTA, shown only when the browser fires the
 * `beforeinstallprompt` event (Chrome / Edge / Android). iOS Safari
 * doesn't dispatch that event; we detect iOS separately and surface
 * a one-off Add-to-Home-Screen tip instead.
 *
 * The dismissed state is remembered in `localStorage` so we don't
 * nag — re-visits and re-renders won't re-show the bar. A future
 * "show me again" toggle in /settings can clear the key.
 */
export function InstallPrompt() {
  const t = useTranslations("pwa.install");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [iosTipVisible, setIosTipVisible] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed — `display: standalone` MQ matches once the
    // app is launched from the home screen.
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS-specific signal
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    ) {
      return;
    }

    // Respect a previous "no thanks".
    if (window.localStorage.getItem("quizelo:install-dismissed") === "1") {
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS detection — Safari doesn't fire `beforeinstallprompt`.
    // We surface a manual tip on first visit. UA sniff is
    // acceptable here; the only other reliable signal is presence
    // of `navigator.standalone`, which is undefined off-PWA.
    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    if (isIos) {
      setIosTipVisible(true);
      setHidden(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  if (hidden) return null;

  const handleInstall = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "dismissed") {
        window.localStorage.setItem("quizelo:install-dismissed", "1");
      }
    } catch {
      /* noop */
    } finally {
      setDeferred(null);
      setHidden(true);
    }
  };

  const handleDismiss = () => {
    window.localStorage.setItem("quizelo:install-dismissed", "1");
    setHidden(true);
  };

  return (
    <div
      role="region"
      aria-label={t("title")}
      className="bg-surface-2/95 fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-md border border-violet/30 px-3 py-2.5 shadow-card-elev backdrop-blur-md md:left-auto md:right-3 md:max-w-sm"
    >
      <div className="flex-1">
        <p className="font-display text-[12px] font-semibold text-fg-1">
          {t("title")}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-fg-3">
          {iosTipVisible ? t("iosTip") : t("body")}
        </p>
      </div>

      {deferred ? (
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-md bg-violet/90 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-violet"
        >
          {t("install")}
        </button>
      ) : null}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t("dismiss")}
        className="px-1.5 py-1 text-fg-3 hover:text-fg-1"
      >
        ✕
      </button>
    </div>
  );
}
