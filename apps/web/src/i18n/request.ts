import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    /**
     * Silent fallback for missing keys — return the last segment of the
     * namespace path. Keeps the UI sane while we backfill translations.
     */
    onError(err) {
      if (err.code === "MISSING_MESSAGE") return;
      console.error(err);
    },
    getMessageFallback({ key }) {
      const last = key.split(".").pop() ?? key;
      return last;
    },
  };
});

type Locale = (typeof routing.locales)[number];
