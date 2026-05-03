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
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}

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
        session.user.isAdmin = !!token.isAdmin;
      }
      return session;
    },
    authorized({ auth }) {
      return !!auth && !!auth.user?.isAdmin;
    },
  },
};

export const { auth: edgeAuth } = NextAuth(edgeConfig);
