"use client";

import {
  NextIntlClientProvider,
  type AbstractIntlMessages,
  type IntlError,
} from "next-intl";

interface IntlProviderProps {
  locale: string;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}

/**
 * Default time zone for client-side date/number formatting.
 *
 * MUST match the value in `request.ts` so server and client produce the
 * same markup — a mismatch triggers next-intl's `ENVIRONMENT_FALLBACK`
 * warning on every render that uses `useTranslations` from a client
 * component (e.g. PlayButton, MatchScreen, etc.).
 */
export const DEFAULT_TIME_ZONE = "Europe/Paris";

/**
 * Client-side wrapper for NextIntlClientProvider that mirrors the silent
 * fallback configured in `request.ts` — missing keys return the last segment
 * of the path instead of crashing the UI or spamming the console.
 */
export function IntlProvider({ locale, messages, children }: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={DEFAULT_TIME_ZONE}
      onError={(err: IntlError) => {
        if (err.code === "MISSING_MESSAGE") return;
        // eslint-disable-next-line no-console
        console.error(err);
      }}
      getMessageFallback={({ key }) => {
        const last = key.split(".").pop() ?? key;
        return last;
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
