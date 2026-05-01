import type { DefaultSession, NextAuthConfig } from "next-auth";
import Apple from "next-auth/providers/apple";
import Google from "next-auth/providers/google";

/* ── Module augmentations ────────────────────────────────────────
 * Live inside this file (re-exported as `@quizelo/auth/edge`) so any
 * consumer that imports the auth config also picks up the augmented
 * `Session.user` and `JWT` shapes.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      /** Date the email was verified, or `null` if still unverified. */
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }
}

// JWT augmentation removed — `next-auth/jwt` resolution is flaky across
// the monorepo. The JWT callback below uses runtime type-casting, which
// is enough for our purposes (no consumer reads token.emailVerifiedAt
// directly outside this file).

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
    async jwt({ token, user, trigger }) {
      // First sign-in (`user` is the row from the adapter or the
      // credentials authorize fn) → snapshot the verification status.
      if (user) {
        if (user.id) token.userId = user.id;
        const verified = (user as { emailVerified?: Date | null }).emailVerified;
        token.emailVerifiedAt = verified ? new Date(verified).getTime() : null;
      }
      // After the user updates their session (e.g. clicks the magic
      // link a 2nd time), re-snapshot.
      if (trigger === "update" && user) {
        const verified = (user as { emailVerified?: Date | null }).emailVerified;
        token.emailVerifiedAt = verified ? new Date(verified).getTime() : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
        session.user.emailVerified =
          typeof token.emailVerifiedAt === "number"
            ? new Date(token.emailVerifiedAt)
            : null;
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
