"use client";

import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Lets descendants of a `<Paywall>` close the modal — used by the plan
 * activation buttons (`PaywallActivateButton`) so they can dismiss the
 * dialog after a successful activation.
 */
export const PaywallCloseContext = createContext<(() => void) | null>(null);

interface PaywallDialogProps {
  open: boolean;
  onClose: () => void;
  /** Accessibility label for the close (×) button. */
  closeLabel: string;
  /** Server-rendered paywall content. */
  children: ReactNode;
}

/**
 * Full-screen paywall modal. Uses the same chrome (bg, ambient, dot grid,
 * scanline) as a regular page — the only difference with a route is the
 * floating × close button in the top-right corner. Closeable via the ×
 * button or the Escape key.
 */
export function PaywallDialog({
  open,
  onClose,
  closeLabel,
  children,
}: PaywallDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while open + autofocus the close button so Escape
  // is captured by the modal's keydown listener.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-[100] isolate overflow-y-auto bg-surface-1 qa-scan"
    >
      <div className="qa-ambient" aria-hidden />
      <div className="qa-grid-bg" aria-hidden />

      {/* Floating close × — fixed so it stays visible while content scrolls */}
      <button
        ref={closeButtonRef}
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className={cn(
          "fixed right-4 top-4 z-50 flex h-10 w-10 cursor-pointer items-center justify-center",
          "rounded-full border border-white/[0.08] bg-surface-1/85 text-base text-fg-2 backdrop-blur-md",
          "transition-colors duration-120 hover:bg-white/[0.08] hover:text-fg-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50",
          "md:right-6 md:top-6",
        )}
      >
        ✕
      </button>

      {children}
    </div>
  );
}

interface PaywallProps {
  /** The trigger button label (e.g. "PLAY RANKED"). */
  triggerLabel: string;
  /** Visual variant of the trigger button. */
  triggerVariant?: "primary" | "gold" | "ghost";
  /** Accessibility label for the close (×) button. */
  closeLabel: string;
  /** Server-rendered paywall content. */
  children: ReactNode;
}

/**
 * Convenience wrapper: a trigger Button + the paywall dialog.
 */
export function Paywall({
  triggerLabel,
  triggerVariant = "gold",
  closeLabel,
  children,
}: PaywallProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size="full"
        className="py-3.5"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>

      <PaywallDialog open={open} onClose={() => setOpen(false)} closeLabel={closeLabel}>
        <PaywallCloseContext.Provider value={() => setOpen(false)}>
          {children}
        </PaywallCloseContext.Provider>
      </PaywallDialog>
    </>
  );
}
