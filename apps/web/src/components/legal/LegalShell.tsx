import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";

interface LegalShellProps {
  /** Page title shown as the H1. */
  title: string;
  /** Last updated date label, displayed under the title. */
  updatedAt?: string;
  /** Localized "Back" label for the top-left arrow. */
  backLabel: string;
  children: ReactNode;
}

/**
 * Common layout for /legal/* pages — sober, prose-friendly. Same
 * surface chrome as the rest of the app but no top bar, no rails;
 * reads like a long-form document.
 *
 * Headings + lists are styled via the global prose-quizelo class so
 * each legal page just dumps Markdown-shaped JSX.
 */
export function LegalShell({
  title,
  updatedAt,
  backLabel,
  children,
}: LegalShellProps) {
  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-surface-1">
      <div className="qa-grid-bg" aria-hidden />

      <div className="relative mx-auto max-w-3xl px-6 py-10 md:py-16">
        <Link
          href="/home"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-3 no-underline transition hover:text-fg-1"
        >
          ‹ {backLabel}
        </Link>

        <h1 className="font-display text-[36px] font-bold leading-tight tracking-[-0.025em] text-white">
          {title}
        </h1>
        {updatedAt && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-fg-3">
            {updatedAt}
          </p>
        )}

        <div className="prose-quizelo mt-8 text-[14px] leading-relaxed text-fg-2">
          {children}
        </div>
      </div>
    </main>
  );
}
