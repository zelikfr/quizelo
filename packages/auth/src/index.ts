import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, accounts, sessions, users, verificationTokens } from "@quizelo/db";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { z } from "zod";
import { authConfig } from "./config";
import { verifyPassword } from "./password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

/**
 * Full Auth.js setup — runs on the Node runtime (route handlers, server
 * actions, apps/api). Drizzle adapter + Resend + Credentials are added
 * here. The edge config (config.ts) only carries OAuth providers.
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    // Re-declare OAuth providers here so the dangerous-email-account-linking
    // flag (which requires an adapter) is set when the adapter is present.
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM,
    }),
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
        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase()),
        });

        if (!user?.passwordHash) return null;

        const ok = await verifyPassword(user.passwordHash, password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.displayName ?? user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
});

export { authConfig } from "./config";
export { hashPassword, verifyPassword } from "./password";
