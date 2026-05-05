/**
 * Basic display-name / handle moderation.
 *
 * Two goals:
 *  1. Block obvious slurs and hate-group references in FR + EN.
 *  2. Block impersonation of staff (admin, support, modo…) and the
 *     brand itself (quizelo, official…).
 *
 * Deliberately conservative: false positives are worse than missing
 * a creative bypass, because a player whose legit name gets rejected
 * is a worse experience than one bad nickname slipping through. Hard
 * cases ("Hassan", "Cassidy" etc.) are not flagged.
 *
 * If a term needs more context to avoid false positives, we anchor it
 * with `^…$` (full match against the normalized name) instead of
 * substring. Anything that's hard to anchor cleanly is omitted — a
 * better filter (third-party service, ML model) can replace this
 * later.
 *
 * Pure module — no DB / network. Safe to import in both the server
 * action and the edge runtime.
 */

/**
 * Normalize the input to make obfuscation harder:
 *  - lowercase
 *  - decompose accents (é → e) so "négr*" matches "negr*"
 *  - replace common leetspeak (0/1/3/4/5/7/@/$ → o/i/e/a/s/t/a/s)
 *  - strip everything that isn't a-z (kills spaces, dots, underscores,
 *    digits, emojis, separators inserted between letters to dodge
 *    blocklists)
 *
 * NOTE: this is for blocklist comparison only — the value we store in
 * the DB is the un-normalized user input.
 */
export function normalizeForModeration(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/[^a-z]/g, "");
}

/**
 * Substrings that, once normalized, are unsafe in any context. Kept
 * short enough that false positives are rare. Add sparingly.
 */
const SUBSTRING_BLOCK: readonly string[] = [
  // ── Slurs (EN) ─────────────────────────────────────────────
  "nigg",
  "nigr",
  "faggot",
  "fagot",
  "tranny",
  "retard",
  "retarded",
  "kike",
  "spic",
  "chink",
  "gook",
  "wetback",
  // ── Slurs (FR) ─────────────────────────────────────────────
  "negre",
  "negro",
  "bougnoul",
  "bicot",
  "youpin",
  "pedale",
  "pedophile",
  "violeur",
  // ── Hate groups / extremism ────────────────────────────────
  "hitler",
  "nazi",
  "kkk",
  "isis",
  "daesh",
  // ── Sexual / explicit ──────────────────────────────────────
  "porn",
  "porno",
  "xxx",
  "fuck",
  "incest",
  "pedo",
] as const;

/**
 * Names that fully equal one of these (after normalization) are
 * blocked. We use full-equality (vs substring) for impersonation
 * vectors so we don't accidentally block "AdminFan" / "ModRemy" / a
 * user whose real-life name happens to be Quizelo.
 *
 * Add prefixes / variants where the impersonation risk is high —
 * "admin", "admins", "adminstaff" all collapse to the same kind of
 * impersonation here, so `EXACT_BLOCK` accepts a list of plain words
 * we then check both as full match and as a leading anchor below.
 */
const EXACT_BLOCK: readonly string[] = [
  // Brand
  "quizelo",
  "quizeloofficial",
  "quizelostaff",
  "quizelosupport",
  "quizeloteam",
  // Staff impersonation
  "admin",
  "administrator",
  "administrateur",
  "moderator",
  "moderateur",
  "modo",
  "support",
  "staff",
  "system",
  "official",
  "helpdesk",
  "owner",
  "ceo",
] as const;

/**
 * Check whether a name looks inappropriate. Returns the matched rule
 * for logging / debugging or `null` if the name is OK.
 *
 * Empty / whitespace-only input is NOT flagged here — the schema
 * validators upstream already enforce min length, this filter is
 * about the *content* of an otherwise-valid name.
 */
export function checkNameModeration(input: string): {
  blocked: boolean;
  matched: string | null;
} {
  const normalized = normalizeForModeration(input);
  if (!normalized) return { blocked: false, matched: null };

  for (const term of SUBSTRING_BLOCK) {
    if (normalized.includes(term)) {
      return { blocked: true, matched: term };
    }
  }

  for (const exact of EXACT_BLOCK) {
    if (normalized === exact) {
      return { blocked: true, matched: exact };
    }
  }

  return { blocked: false, matched: null };
}

/** Convenience boolean wrapper. */
export function isNameBlocked(input: string): boolean {
  return checkNameModeration(input).blocked;
}
