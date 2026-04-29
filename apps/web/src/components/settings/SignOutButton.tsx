import { signOutAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface SignOutButtonProps {
  label: string;
  /** Mobile full-width variant. */
  full?: boolean;
  className?: string;
}

/**
 * Form-based sign-out button. Submits the existing `signOutAction` server
 * action so we don't need any client-side glue.
 */
export function SignOutButton({ label, full = false, className }: SignOutButtonProps) {
  return (
    <form action={signOutAction} className={full ? "w-full" : undefined}>
      <Button
        type="submit"
        variant="ghost"
        size={full ? "full" : "sm"}
        className={cn(
          full ? "justify-center py-3 text-xs" : "px-3.5 py-2 text-[11px]",
          className,
        )}
      >
        {label}
      </Button>
    </form>
  );
}
