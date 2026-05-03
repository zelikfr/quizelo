/**
 * Admin app NextAuth instance.
 *
 * The admin panel runs on its own port (3001), uses its own JWT cookie,
 * and authenticates against the dedicated `admin_users` table — fully
 * decoupled from the player `users` table.
 *
 *   - There is no signup flow. Bootstrap admins via
 *     `pnpm --filter @quizelo/admin admin:create`.
 *   - The Credentials authorize fn looks up `admin_users` by email and
 *     verifies the scrypt hash. Any other auth flow is intentionally
 *     absent (no OAuth, no magic link, no password reset UI yet).
 *   - On success we bump `last_login_at` for audit purposes.
 *
 * The `isAdmin` claim on the JWT is set to `true` for any successful
 * sign-in here — being able to authorize against `admin_users` IS the
 * admin check. Middleware re-verifies the claim on every request via
 * the edge auth handle (see `auth.edge.ts`).
 */
import { adminUsers, db } from "@quizelo/db";
import { verifyPassword } from "@quizelo/auth";
import { eq } from "drizzle-orm";
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

/**
 * Cookie names — prefixed with `quizelo-admin.` so they don't collide
 * with the player app's NextAuth cookies. Browsers scope cookies by
 * host (not port), so on `localhost` the admin app and the player app
 * share the same cookie jar; without distinct names you can only be
 * signed in to one at a time.
 */
const COOKIE_PREFIX = "quizelo-admin";
const isProd = process.env.NODE_ENV === "production";
const securePrefix = isProd ? "__Secure-" : "";
const hostPrefix = isProd ? "__Host-" : "";

export const authConfig: NextAuthConfig = {
  // JWT only — admin sessions are short-lived and we don't want to
  // store admin sessions in Postgres next to player sessions.
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8h
  trustHost: true,
  pages: {
    signIn: "/login",
  },
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
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const lower = email.toLowerCase();

        const admin = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.email, lower),
        });
        if (!admin) return null;

        const ok = await verifyPassword(admin.passwordHash, password);
        if (!ok) return null;

        // Best-effort audit; failure here doesn't block the login.
        try {
          await db
            .update(adminUsers)
            .set({ lastLoginAt: new Date() })
            .where(eq(adminUsers.id, admin.id));
        } catch {
          // ignore
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name ?? admin.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        // Authorize() only returns a row that exists in admin_users, so
        // every successful sign-in is by definition an admin.
        token.isAdmin = true;
      }
      return token;
    },
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

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
