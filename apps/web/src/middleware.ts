import { authConfig } from "@quizelo/auth/edge";
import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const { auth: edgeAuth } = NextAuth(authConfig);
const intl = createIntlMiddleware(routing);

/** Routes that require an authenticated user. */
const PROTECTED = [
  /^\/(en|fr)\/home/,
  /^\/(en|fr)\/profile/,
  /^\/(en|fr)\/settings/,
  /^\/(en|fr)\/match/,
  /^\/(en|fr)\/lobby/,
  /^\/(en|fr)\/leaderboard/,
  /^\/(en|fr)\/shop/,
  /^\/(en|fr)\/referral/,
];

/**
 * Once you're signed in, the landing page and the auth flows shouldn't be
 * reachable — every visit gets bounced to /home so you don't accidentally
 * lose context.
 */
const SIGNED_IN_REDIRECT = [
  /^\/$/, // root
  /^\/(en|fr)\/?$/, // locale landing
  /^\/(en|fr)\/auth(\/|$)/, // login / signup / verify / forgot-password
];

/**
 * Pages an unverified-email user is *allowed* to reach. Everything else
 * gets bounced to `/auth/verify-required`. We must let the auth flow
 * routes through so they can resend the magic link, log out, etc.
 */
const UNVERIFIED_ALLOWED = [
  /^\/(en|fr)\/auth(\/|$)/,
];

export default edgeAuth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Pass non-page routes through (api, static, etc.)
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeMatch = pathname.match(/^\/(en|fr)/);
  const locale = localeMatch?.[1] ?? "fr";

  // 2. Already signed in? Bounce off the landing / auth pages straight to /home.
  if (req.auth) {
    // 2a. Block every page except /auth/* until the email is verified.
    const isVerified = !!req.auth.user?.emailVerified;
    if (!isVerified) {
      const allowedWhileUnverified = UNVERIFIED_ALLOWED.some((re) =>
        re.test(pathname),
      );
      if (!allowedWhileUnverified) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/auth/verify-required`;
        url.search = "";
        return NextResponse.redirect(url);
      }
      // Inside /auth/* — let it through. /auth/verify-required is the
      // canonical page; /auth/login can sign out, /auth/forgot-password
      // remains useful, etc.
      return intl(req);
    }

    const shouldBounce = SIGNED_IN_REDIRECT.some((re) => re.test(pathname));
    if (shouldBounce) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/home`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  } else {
    // 3. Auth gate for protected paths.
    const needsAuth = PROTECTED.some((re) => re.test(pathname));
    if (needsAuth) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/auth/login`;
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 4. Hand off to next-intl for locale negotiation / rewrites.
  return intl(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
