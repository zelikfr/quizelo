import { cn } from "@/lib/cn";

interface WordmarkProps {
  className?: string;
  /**
   * Override the logo size (px) when embedding inside text whose
   * `font-size` doesn't match the wordmark's `text-[…]` class — the
   * default scales to roughly the cap height of the wordmark via `1em`.
   */
  logoSize?: number;
  /** Hide the icon (text-only fallback for very tight spaces). */
  iconOnly?: boolean;
  withoutIcon?: boolean;
}

/**
 * Brand lock-up: logo mark + "QUIZELO" wordmark. Used in the home
 * top bar, the auth shells, the landing nav, and the mobile header.
 *
 * Server-renderable; the logo is inlined as raw SVG so it inherits the
 * rendering pipeline of its host component (no extra `<img>` request,
 * no theme-flicker from CSS-only color overrides).
 */
export function Wordmark({
  className,
  logoSize,
  iconOnly = false,
  withoutIcon = false,
}: WordmarkProps) {
  const showIcon = !withoutIcon;
  // Crown viewBox aspect is 384×244 (~1.57:1). Sizing by `width` lets
  // the height auto-derive from that ratio so we don't pad empty
  // space above/below the artwork.
  const iconStyle: React.CSSProperties = logoSize
    ? { width: logoSize, height: "auto" }
    : { width: "1.4em", height: "auto" };

  return (
    <span
      className={cn(
        "font-display inline-flex items-center gap-2 font-bold tracking-[0.1em]",
        className,
      )}
    >
      {showIcon && <Logomark style={iconStyle} aria-hidden />}
      {!iconOnly && <span className="text-white">QUIZELO</span>}
    </span>
  );
}

interface LogomarkProps {
  className?: string;
  style?: React.CSSProperties;
  /**
   * Render the dark rounded-square frame that wraps the crown — used
   * for PWA splash screens / standalone tiles where we want a fully
   * boxed mark. Off by default: in headers and brand lock-ups we
   * want the crown floating against the page chrome, not stuck inside
   * a tinted square that fights the layout.
   */
  framed?: boolean;
  /**
   * Decorative-only by default — the wordmark text already labels the
   * brand. Pass aria-label only when using `<Wordmark iconOnly />`.
   */
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

/**
 * The logo mark itself. Default render is the crown alone (gold peaks
 * + keyboard with red dots) on a transparent background so it sits
 * inline next to text. Pass `framed` to draw the dark gradient
 * rounded-square wrapper for cases where we need a self-contained
 * tile (PWA splash, social cards…).
 */
export function Logomark({ className, style, framed = false, ...rest }: LogomarkProps) {
  if (framed) {
    return (
      <svg
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("inline-block flex-shrink-0", className)}
        style={style}
        role={rest["aria-label"] ? "img" : undefined}
        {...rest}
      >
        <defs>
          <linearGradient id="qz-logo-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1A1330" />
            <stop offset="1" stopColor="#06080F" />
          </linearGradient>
          <linearGradient id="qz-logo-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE08A" />
            <stop offset="1" stopColor="#FFD166" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="112" fill="url(#qz-logo-bg)" />
        <g transform="translate(0 -34)">
          <path
            d="M 64 332 L 132 196 L 200 304 L 256 168 L 312 304 L 380 196 L 448 332 Z"
            fill="url(#qz-logo-gold)"
          />
          <rect x="64" y="332" width="384" height="80" rx="14" fill="url(#qz-logo-gold)" />
          <circle cx="148" cy="372" r="18" fill="#FF4D6D" />
          <circle cx="256" cy="372" r="18" fill="#FF4D6D" />
          <circle cx="364" cy="372" r="18" fill="#FF4D6D" />
        </g>
      </svg>
    );
  }

  // Crown-only — viewBox is tight to the artwork (x 64..448, y 168..412)
  // so the SVG occupies its full intrinsic bounds without dead space
  // around the mark.
  return (
    <svg
      viewBox="64 168 384 244"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block flex-shrink-0 align-[-0.15em]", className)}
      style={style}
      role={rest["aria-label"] ? "img" : undefined}
      {...rest}
    >
      <defs>
        <linearGradient id="qz-logo-gold-naked" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="1" stopColor="#FFD166" />
        </linearGradient>
      </defs>
      <path
        d="M 64 332 L 132 196 L 200 304 L 256 168 L 312 304 L 380 196 L 448 332 Z"
        fill="url(#qz-logo-gold-naked)"
      />
      <rect x="64" y="332" width="384" height="80" rx="14" fill="url(#qz-logo-gold-naked)" />
      <circle cx="148" cy="372" r="18" fill="#FF4D6D" />
      <circle cx="256" cy="372" r="18" fill="#FF4D6D" />
      <circle cx="364" cy="372" r="18" fill="#FF4D6D" />
    </svg>
  );
}
