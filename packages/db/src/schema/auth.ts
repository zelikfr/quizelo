import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Auth.js / next-auth core tables
 * Reference: https://authjs.dev/getting-started/adapters/drizzle
 *
 * We add Quizelo-specific columns (display_name, avatar_id, locale, premium…)
 * directly on `users` so the app and the auth layer share one source of truth.
 */
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),

  // ── Quizelo-specific
  displayName: text("display_name"),
  handle: text("handle").unique(),
  avatarId: integer("avatar_id"),
  locale: text("locale").default("fr").notNull(),
  passwordHash: text("password_hash"),
  isPremium: boolean("is_premium").default(false).notNull(),
  premiumUntil: timestamp("premium_until", { withTimezone: true }),
  /**
   * Stripe customer ID — created lazily the first time the user opens
   * the checkout flow. Persists across renewals so we don't duplicate
   * customers in the Stripe dashboard.
   */
  stripeCustomerId: text("stripe_customer_id"),
  /**
   * `true` once the user has scheduled a cancellation that hasn't kicked
   * in yet. Set by the `customer.subscription.updated` webhook when
   * Stripe flips `cancel_at_period_end`. Lets the UI show "Cancellation
   * scheduled for X" instead of a fresh "Cancel" button — and lets the
   * "Resume" CTA appear so the user can change their mind.
   */
  premiumCancelAtPeriodEnd: boolean("premium_cancel_at_period_end")
    .default(false)
    .notNull(),
  elo: integer("elo").default(1000).notNull(),
  coins: integer("coins").default(0).notNull(),

  // ── Contact + address (all optional, edited from /settings)
  phone: text("phone"),
  addressLine: text("address_line"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country"),

  // ── Quick-match daily quota (free tier only — premium ignores it).
  // Counter resets to QUICK_QUOTA_PER_DAY every UTC midnight on first read /
  // write. The "watch ad" CTA increments it without a hard cap so a user
  // who watches several ads can stack a few extra matches.
  quickMatchesRemaining: integer("quick_matches_remaining").default(3).notNull(),
  quickMatchesResetAt: timestamp("quick_matches_reset_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (account) => ({
    pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const authenticators = pgTable(
  "authenticators",
  {
    credentialId: text("credential_id").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (auth) => ({
    pk: primaryKey({ columns: [auth.userId, auth.credentialId] }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
