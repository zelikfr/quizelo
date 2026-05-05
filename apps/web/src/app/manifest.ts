import type { MetadataRoute } from "next";

/**
 * Web App Manifest — drives the install prompt UI on Chrome/Edge/
 * Android, plus iOS Safari "Add to Home Screen" branding.
 *
 * The accompanying icons (`/icon-192.png`, `/icon-512.png`,
 * `/apple-touch-icon.png`) need to live in `public/`. Generate them
 * once from the brand asset (square PNG, dark background) — any PWA
 * icon generator works.
 *
 * `display: "standalone"` hides the browser chrome on launch from
 * the home screen, which is what makes the app feel native. Combined
 * with the matching `theme_color` it gives a solid first impression
 * before our own UI mounts.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quizelo — 10 players. 3 phases. 1 survivor.",
    short_name: "Quizelo",
    description:
      "Competitive multiplayer quiz. Fresh questions every match, climb the seasonal ladder.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#06080F",
    theme_color: "#7C5CFF",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
