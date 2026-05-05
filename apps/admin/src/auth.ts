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
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

// We deliberately do NOT augment `next-auth`'s `Session` interface
// here — `@quizelo/auth` (loaded transitively via `verifyPassword`)
// already declares its own `Session.user` shape with `emailVerified`,
// and TypeScript refuses to merge two `user` properties of different
// types (TS2717). We work around it with `getAdminSession` below,
// which casts the session into the admin-flavored shape every
// consumer in this app should use.

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
          // @quizelo/auth's augmentation makes `id` non-optional but
          // its type matches; the cast below is just for `isAdmin`.
          session.user.id = token.userId;
        }
        // Augmentation conflict — see comment at top of the file.
        // We cast through a minimal local shape rather than augmenting
        // globally and breaking the player app.
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

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

/**
 * Typed shape of an admin session as seen by this app.
 *
 * The next-auth `Session` interface gets augmented in two places:
 * here, AND inside `@quizelo/auth/config.ts` (player web app). When
 * both are loaded into the same TypeScript program (which happens
 * via `verifyPassword` re-exporting from `@quizelo/auth`), the two
 * `user` property declarations conflict and TS picks one — without
 * the `isAdmin` claim.
 *
 * `getAdminSession` works around that by reading the raw session
 * and re-asserting the shape inline. Use it instead of `auth()`
 * everywhere we need `user.isAdmin` (layout gate, server actions).
 */
export interface AdminSession {
  user: {
    id: string;
    email: string | null | undefined;
    name?: string | null;
    isAdmin: boolean;
  };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth();
  if (!session?.user) return null;
  // Cast through unknown — the augmentation conflict means TS sees
  // `Session.user` with the player shape; we know the admin JWT
  // callback set `isAdmin` and that's what we hand back.
  return session as unknown as AdminSession;
}
