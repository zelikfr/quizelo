/**
 * Root layout — pass-through.
 * The actual `<html>` / `<body>` shell lives in `app/[locale]/layout.tsx`,
 * which is reached for every request thanks to the next-intl middleware.
 */
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
