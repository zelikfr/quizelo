import { cn } from "@/lib/cn";

interface WordmarkProps {
  className?: string;
}

/**
 * The QUIZELO wordmark. Used in `<Nav />` and `<Footer />`.
 * Server-renderable — no client-side state.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-display font-bold tracking-[0.1em] inline-block",
        className,
      )}
    >
      <span className="text-violet">QUIZ</span>ELO
    </span>
  );
}
