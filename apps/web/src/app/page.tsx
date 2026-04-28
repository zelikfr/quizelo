/**
 * Fallback for the root URL. The next-intl middleware redirects `/` to the
 * detected locale before this is reached, so this page only fires when
 * the middleware is skipped (e.g. on direct internal calls).
 */
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
