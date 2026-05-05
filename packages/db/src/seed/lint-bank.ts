/**
 * Bank lint — flags questions whose correct answer is shaped
 * differently from its distractors enough that a player could guess
 * by shape alone. The build pipeline already auto-strips
 * parenthesized context off correct answers (see
 * `_builder.ts:deLeakAnswerShape`), so this script surfaces tells
 * that auto-fix can't safely repair on its own:
 *   - parens that the auto-strip somehow missed (unbalanced bracket,
 *     etc.) — should be ~zero in practice
 *   - a comma only on the correct answer
 *   - a content word ≥3 chars present in every distractor but absent
 *     from the correct answer — the "FreeBSD seul / OpenBSD seul /
 *     NetBSD seul / 4BSD" case where the player picks the odd one
 *     out without knowing the topic.
 *
 * NOTE: two earlier rules were deliberately removed:
 *
 *   - "length leak" (correct ≥1.6× avg distractor) — too many false
 *     positives on official names ("République démocratique du Congo"
 *     vs "Pérou"), multi-word toponyms ("Pitcairn Islands" vs "Niue").
 *
 *   - "digit-shape" (only correct has digits, or only distractors) —
 *     same problem with format names (MP3 vs WAV/FLAC/OGG), model
 *     numbers (iPhone 4), version strings (Web 2.0). The digit isn't
 *     a curator choice, it's part of the entity's actual name.
 *
 * Both produced inbox noise without giving the curator anything they
 * could meaningfully fix.
 *
 * Run: `pnpm --filter @quizelo/db lint:bank`
 *
 * Read-only — prints findings to stdout and exits non-zero so it's
 * CI-safe. Auto-rewrite past parens-stripping is too risky (would
 * happily drop a meaningful comma from "Marie, reine d'Écosse"), so
 * fixes are left to the curator.
 */

import { BANK_QUESTIONS } from "./bank";
import { detectShapeLeak } from "./shape-leak";

interface Leak {
  id: string;
  category: string;
  difficulty: string;
  locale: string;
  reason: string;
  prompt: string;
  correct: string;
  distractors: string[];
}

const leaks: Leak[] = [];
for (const q of BANK_QUESTIONS) {
  const correct = q.choices[q.correctIndex]!;
  const distractors = q.choices.filter((_, i) => i !== q.correctIndex);
  const reason = detectShapeLeak(correct, distractors);
  if (reason) {
    leaks.push({
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      locale: q.locale,
      reason,
      prompt: q.prompt,
      correct,
      distractors,
    });
  }
}

if (leaks.length === 0) {
  // eslint-disable-next-line no-console
  console.log(`✓ No shape leaks detected across ${BANK_QUESTIONS.length} questions.`);
  process.exit(0);
}

// Group by reason so the curator can sweep one issue type at a time.
const byReason = new Map<string, Leak[]>();
for (const l of leaks) {
  // Normalize the dynamic word list out of the key so all
  // common-in-distractors leaks group together regardless of which
  // word(s) leaked.
  const key = l.reason.startsWith("common-in-distractors-only")
    ? "common-in-distractors-only (a word repeated in every wrong choice)"
    : l.reason;
  const arr = byReason.get(key) ?? [];
  arr.push(l);
  byReason.set(key, arr);
}

// eslint-disable-next-line no-console
console.log(
  `Found ${leaks.length} shape leaks across ${BANK_QUESTIONS.length} questions.\n`,
);

for (const [reason, items] of byReason) {
  // eslint-disable-next-line no-console
  console.log(`── ${reason} (${items.length}) ───────────────────`);
  for (const l of items.slice(0, 25)) {
    // eslint-disable-next-line no-console
    console.log(
      `  [${l.id}] "${l.prompt}"\n    correct: "${l.correct}"\n    distractors: [${l.distractors.map((d) => `"${d}"`).join(", ")}]`,
    );
  }
  if (items.length > 25) {
    // eslint-disable-next-line no-console
    console.log(`  …and ${items.length - 25} more`);
  }
  // eslint-disable-next-line no-console
  console.log("");
}

process.exit(1);
