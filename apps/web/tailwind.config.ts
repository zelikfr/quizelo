import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  // `hoverOnlyWhenSupported` gates every `hover:` modifier behind
  // `@media (hover: hover)`. On touch devices (iOS Safari, Android
  // Chrome) `:hover` would otherwise stick after a tap until the
  // user touches somewhere else — making just-tapped buttons look
  // pre-selected on the next render (e.g. a Q1 answer button that
  // bleeds into Q2's UI). With this flag, hover styles only apply
  // on devices that actually have a hover-capable pointer.
  // Tailwind v4 makes this the default; we opt in early.
  future: { hoverOnlyWhenSupported: true },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        surface: {
          0: "#06080F",
          1: "#0B0F1A",
          2: "#11162A",
          3: "#1A2140",
          elev: "#1E2647",
        },
        // Foreground
        fg: {
          0: "#FFFFFF",
          1: "#E6E8F2",
          2: "#9AA0BF",
          3: "#5C6390",
          4: "#353B5E",
        },
        // Brand
        violet: {
          DEFAULT: "#7C5CFF",
          light: "#A18BFF",
        },
        gold: {
          DEFAULT: "#FFD166",
          light: "#FFE08A",
          warm: "#FF8B5C",
        },
        // Semantic
        success: "#4ADE80",
        danger: "#FF4D6D",
        warn: "#FFB020",
        info: "#5BC8FF",
        // Rank tiers
        rank: {
          bronze: "#B07A4A",
          silver: "#C9CFE0",
          gold: "#FFD166",
          plat: "#7DE0E0",
          diamond: "#93B4FF",
          elite: "#FF6BB5",
        },
      },

      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },

      fontSize: {
        "2xs": ["9px", { lineHeight: "1.4" }],
        "3xs": ["8px", { lineHeight: "1.4" }],
      },

      letterSpacing: {
        widest2: "0.2em",
        widest3: "0.3em",
      },

      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "22px",
        pill: "999px",
      },

      backgroundImage: {
        "gradient-violet": "linear-gradient(180deg, #A18BFF, #7C5CFF)",
        "gradient-gold": "linear-gradient(180deg, #FFE08A, #FFD166)",
        "gradient-gold-warm": "linear-gradient(135deg, #FFD166, #FF8B5C)",
        "gradient-surface": "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        "live-card": "linear-gradient(180deg, rgba(124,92,255,0.10), rgba(11,15,26,0.9))",
        "live-card-mini": "linear-gradient(180deg, rgba(124,92,255,0.12), rgba(11,15,26,0.9))",
        "ambient-desktop": "radial-gradient(ellipse at 70% 0%, rgba(124,92,255,0.22), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(255,209,102,0.10), transparent 50%)",
        "ambient-mobile": "radial-gradient(ellipse at 50% 0%, rgba(124,92,255,0.25), transparent 50%)",
        "grid-dots": "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },

      boxShadow: {
        "btn-violet": "0 8px 24px -8px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
        "btn-violet-hover": "0 12px 32px -8px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
        "btn-gold": "0 8px 24px -8px rgba(255,209,102,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
        "btn-gold-hover": "0 12px 32px -8px rgba(255,209,102,0.35)",
        "hero-card": "0 30px 80px -20px rgba(124,92,255,0.4), 0 0 0 1px rgba(124,92,255,0.25)",
        "card-mini": "0 20px 50px -15px rgba(124,92,255,0.4)",
        "card-elev": "0 8px 24px -8px rgba(0,0,0,0.6)",
        "elo-badge": "0 12px 30px -8px rgba(255,209,102,0.5)",
        "choice-correct": "0 0 24px -8px rgba(74,222,128,0.6)",
        "choice-selected": "0 0 0 2px rgba(124,92,255,0.4)",
      },

      keyframes: {
        "qa-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(124,92,255,0.35)" },
          "50%": { boxShadow: "0 0 0 8px transparent" },
        },
        "live-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "qa-pulse": "qa-pulse 1.6s ease-in-out infinite",
        "live-dot": "live-dot 1.2s ease-in-out infinite",
      },

      transitionDuration: { "120": "120ms" },
    },
  },
  plugins: [],
};

export default config;
