import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SoundUnlock } from "@/components/SoundUnlock";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PWARegister } from "@/components/pwa/PWARegister";
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
  // PWA hints. The manifest itself is auto-emitted from
  // `app/manifest.ts`. `appleWebApp.statusBarStyle: "black-translucent"`
  // lets the dark surface bleed under the iOS status bar when
  // launched from the home screen.
  applicationName: "Quizelo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Quizelo",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport = {
  themeColor: "#7C5CFF",
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
          <SoundUnlock />
          <PWARegister />
          {children}
          <CookieBanner />
          <InstallPrompt />
        </IntlProvider>
      </body>
    </html>
  );
}
