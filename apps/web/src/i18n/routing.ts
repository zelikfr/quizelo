import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];

// Typed navigation helpers — import useRouter / usePathname / Link from here
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
