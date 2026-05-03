import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Backoffice operators — completely separate from the player `users` table.
 *
 * Why a separate table?
 *   - A player's account compromise should never grant admin access.
 *   - The two surfaces have different password policies, MFA needs, and
 *     audit requirements; mixing them under one row makes that messy.
 *   - We don't want admin rows to show up in player-side queries
 *     (leaderboard, matchmaking, etc.).
 *
 * Bootstrap an initial admin with `pnpm --filter @quizelo/admin admin:create`.
 */
export const adminUsers = pgTable("admin_users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
