/**
 * Bootstrap / upsert an admin operator.
 *
 *   pnpm --filter @quizelo/admin admin:create
 *     → interactive prompts for email + password (hidden)
 *
 *   pnpm --filter @quizelo/admin admin:create -- --email=foo@bar.com --password=secret
 *     → non-interactive, useful for one-shot scripts (CI/etc.)
 *
 * Idempotent: if the email already exists in `admin_users`, the password
 * hash is overwritten — handy as a recovery path if you forget your
 * admin password without ever needing the player-side reset flow.
 */
// MUST be the first import — populates process.env BEFORE @quizelo/db
// runs its top-level DATABASE_URL check.
import "./_env";
import { hashPassword } from "@quizelo/auth";
import { adminUsers, db } from "@quizelo/db";
import { eq } from "drizzle-orm";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

function parseArgs(): { email?: string; password?: string; name?: string } {
  const out: { email?: string; password?: string; name?: string } = {};
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(/^--(\w+)=(.*)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (k === "email" || k === "password" || k === "name") out[k] = v;
  }
  return out;
}

async function readMaskedPassword(prompt: string): Promise<string> {
  // node:readline doesn't have native masking. We toggle stdout writes
  // off while echoing '*' for each keystroke. Best-effort — terminals
  // without TTY just see plain echo.
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  // Cast to access internal _writeToOutput hook (Node API surface, stable enough).
  const internal = rl as unknown as { _writeToOutput: (s: string) => void };
  const original = internal._writeToOutput?.bind(rl);
  internal._writeToOutput = (s: string) => {
    if (s.includes(prompt)) {
      original?.(s);
    } else {
      original?.("*".repeat(s.length));
    }
  };
  try {
    return await rl.question(prompt);
  } finally {
    rl.close();
    if (original) internal._writeToOutput = original;
    stdout.write("\n");
  }
}

async function ask(prompt: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return await rl.question(prompt);
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const args = parseArgs();

  let email = args.email;
  let password = args.password;
  let name = args.name;

  if (!email) email = (await ask("Email: ")).trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("✗ Invalid email.");
    process.exit(1);
  }
  email = email.toLowerCase();

  if (!password) password = await readMaskedPassword("Password (min 8): ");
  if (!password || password.length < 8) {
    console.error("✗ Password must be at least 8 characters.");
    process.exit(1);
  }

  if (!name && !args.email) {
    name = (await ask("Display name (optional): ")).trim() || undefined;
  }

  const hash = await hashPassword(password);

  const existing = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email),
  });

  if (existing) {
    await db
      .update(adminUsers)
      .set({ passwordHash: hash, ...(name ? { name } : {}) })
      .where(eq(adminUsers.id, existing.id));
    console.log(`✓ Password updated for existing admin: ${email}`);
  } else {
    await db.insert(adminUsers).values({
      email,
      passwordHash: hash,
      name: name ?? null,
    });
    console.log(`✓ Admin created: ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
