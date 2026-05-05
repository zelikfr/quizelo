/**
 * Edge-only NextAuth handle for the middleware.
 *
 * Mirrors the JWT/session shape from `auth.ts` but skips the Drizzle
 * adapter and the Credentials provider (both pull in postgres-js, which
 * doesn't run on the Edge). Middleware only needs to read the JWT
 * cookie that was already signed by the full auth instance.
 *
 * IMPORTANT: the session callback here must mirror auth.ts so
 * `req.auth.user.isAdmin` is populated. Without it the middleware
 * always sees undefined and bounces every admin to /forbidden.
 */
import NextAuth, { type NextAuthConfig } from "next-auth";

// No `Session` augmentation here — see `auth.ts` for the rationale.
// The middleware reads `auth.user.isAdmin` via a local cast.

// Must match the cookie names written by `auth.ts`, otherwise the
// middleware reads the wrong cookie (or none at all) and bounces every
// admin to /login.
const COOKIE_PREFIX = "quizelo-admin";
const isProd = process.env.NODE_ENV === "production";
const securePrefix = isProd ? "__Secure-" : "";
const hostPrefix = isProd ? "__Host-" : "";

export const edgeConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [], // No providers on the edge — token is already signed.
  cookies: {
    sessionToken: {
      name: `${securePrefix}${COOKIE_PREFIX}.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
    callbackUrl: {
      name: `${securePrefix}${COOKIE_PREFIX}.callback-url`,
      options: { sameSite: "lax", path: "/", secure: isProd },
    },
    csrfToken: {
      name: `${hostPrefix}${COOKIE_PREFIX}.csrf-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: isProd },
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.userId === "string") {
          session.user.id = token.userId;
        }
        // Cast — see auth.ts for the augmentation-conflict rationale.
        (session.user as { isAdmin?: boolean }).isAdmin = !!token.isAdmin;
      }
      return session;
    },
    authorized({ auth }) {
      const u = auth?.user as { isAdmin?: boolean } | undefined;
      return !!auth && !!u?.isAdmin;
    },
  },
};

export const { auth: edgeAuth } = NextAuth(edgeConfig);
