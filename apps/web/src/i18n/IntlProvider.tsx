"use client";

import { NextIntlClientProvider, type IntlError } from "next-intl";

interface IntlProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
}

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
