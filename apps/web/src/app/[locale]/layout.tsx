import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { IntlProvider } from "@/i18n/IntlProvider";
import { routing, type Locale } from "@/i18n/routing";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quizelo — 10 players. 3 phases. 1 survivor.",
  description:
    "Competitive multiplayer quiz. Fresh questions every match — no two matches alike. Climb the seasonal ladder.",
  openGraph: {
    title: "Quizelo",
    description: "Competitive multiplayer quiz with fresh questions every match.",
    type: "website",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enables static rendering of the locale-aware tree.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        <IntlProvider locale={locale} messages={messages}>
          {children}
        </IntlProvider>
      </body>
    </html>
  );
}
