import type { NextAuthConfig } from "next-auth";
import Apple from "next-auth/providers/apple";
import Google from "next-auth/providers/google";

/**
 * Edge-safe Auth.js v5 base config.
 *
 * Contains only what can run on the Edge runtime:
 *   - OAuth providers (Google, Apple) — JWT-based, no DB needed.
 *   - Callbacks/pages.
 *
 * What is NOT here:
 *   - Drizzle adapter (postgres-js is Node-only).
 *   - Resend / email magic link (requires an adapter for verification tokens).
 *   - Credentials (uses argon2 + DB lookup).
 *
 * Those live in src/index.ts (the full Node config).
 *
 * Why split? Next.js middleware runs on Edge. The middleware imports this
 * file only — it just needs to recognise an authenticated session cookie,
 * not run the actual sign-in flow.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/signup",
    verifyRequest: "/auth/verify",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
    authorized({ auth }) {
      // Quick gate used by middleware. Per-route logic lives in
      // apps/web/src/middleware.ts.
      return !!auth;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
