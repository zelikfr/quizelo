import type { Config } from "tailwindcss";

/**
 * Backoffice palette — purposely sober and high-contrast. We don't need
 * the gamey neon glow of the player-facing app: an admin panel should be
 * fast to scan and read on a desk monitor at 100% zoom.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          0: "#0A0C12",
          1: "#0F1219",
          2: "#161A24",
          3: "#1F2433",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.16)",
        },
        fg: {
          0: "#FFFFFF",
          1: "#E6E8F2",
          2: "#9AA0BF",
          3: "#5C6390",
        },
        accent: {
          DEFAULT: "#7C5CFF",
          hover: "#9377FF",
        },
        success: "#4ADE80",
        danger: "#FF4D6D",
        warn: "#FFB020",
        info: "#5BC8FF",
      },
      fontFamily: {
        body: ["ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
