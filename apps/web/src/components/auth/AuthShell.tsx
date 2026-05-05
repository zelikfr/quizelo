import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { Wordmark } from "@/components/shared/Wordmark";
import { QALangToggle } from "@/components/shared/QALangToggle";
import { LegalFooterLinks } from "@/components/legal/LegalFooterLinks";

interface AuthShellProps {
  /**
   * Left-side brand panel. The panel is responsible for its own internal
   * layout — the shell just provides the chrome (border, padding, ambient
   * background). Omit for centered layouts.
   */
  brand?: ReactNode;
  /** Right-column content (the form). */
  children: ReactNode;
}

/**
 * Two-column auth shell.
 *
 * Background stack (bottom → top):
 *   1. `bg-surface-1`   — the deep navy base color
 *   2. `qa-ambient`     — radial violet + gold glows (whole screen)
 *   3. `qa-grid-bg`     — subtle dot grid (whole screen)
 *   4. brand panel's own linear gradient (absolute inside the aside)
 *   5. content (header / form / footer)
 *
 * `isolate` on `main` and `aside` keeps each panel's negative-z layers
 * scoped instead of escaping into the root stacking context.
 */
export function AuthShell({ brand, children }: AuthShellProps) {
  const showBrand = Boolean(brand);

  return (
    <main className="relative isolate grid min-h-screen overflow-x-clip bg-surface-1 qa-scan md:grid-cols-2">
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* ── Brand panel — desktop only ───────────────────────── */}
      {showBrand && (
        <aside className="relative isolate hidden min-h-screen flex-col justify-between border-r border-white/[0.08] p-12 md:flex md:p-14">
          {brand}
        </aside>
      )}

      {/* ── Form column ──────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-6 pt-10 md:hidden">
          <Link href="/" className="no-underline">
            <Wordmark className="text-base" />
          </Link>
          <QALangToggle />
        </div>

        {/* Desktop top bar — only on centered layouts (no brand panel) */}
        {!showBrand && (
          <div className="hidden items-center justify-between px-12 pt-10 md:flex md:px-14">
            <Link href="/" className="no-underline">
              <Wordmark className="text-lg" />
            </Link>
            <QALangToggle />
          </div>
        )}

        <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-14 md:py-12">
          <div className="w-full max-w-[380px]">{children}</div>
        </div>

        {/* Footer with legal links — required to be reachable from
            every public page in the EU. */}
        <div className="border-t border-white/[0.06] px-6 py-4 md:px-14 md:py-5">
          <LegalFooterLinks />
        </div>
      </section>
    </main>
  );
}
