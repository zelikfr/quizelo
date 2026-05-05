/**
 * Shape-leak detection rules — shared between the standalone lint
 * script (`lint-bank.ts`) and the seed pipeline (`seed/index.ts`),
 * which uses them to force-disable any question that fails so a
 * human can review in the backoffice.
 *
 * Surfaces tells that the build-time auto-strip can't safely repair:
 *   - parens that auto-strip somehow missed (unbalanced bracket, etc.)
 *   - a comma only on the correct answer
 *   - a content word ≥3 chars present in every distractor but absent
 *     from the correct answer — "FreeBSD seul / OpenBSD seul /
 *     NetBSD seul / 4BSD".
 *
 * Two earlier rules were deliberately removed: "length leak" and
 * "digit-shape". They produced too many false positives on legitimate
 * proper nouns ("République démocratique du Congo", "MP3", "Pitcairn
 * Islands"). See `lint-bank.ts` header for the rationale.
 */

const PAREN_RE = /[(\[][^)\]]*[)\]]/;

/**
 * FR + EN stopwords ignored when comparing tokens across distractors.
 * Anything ≤2 chars is excluded automatically; this set covers the
 * 3-letter and 4-letter words that are still semantically empty.
 */
const STOPWORDS = new Set([
  // FR
  "les",
  "des",
  "une",
  "aux",
  "par",
  "sur",
  "sous",
  "dans",
  "son",
  "ses",
  "qui",
  "que",
  "quoi",
  "donc",
  "puis",
  "tres",
  "très",
  "comme",
  "avec",
  "sans",
  "pour",
  "mais",
  "celui",
  "celle",
  // EN
  "the",
  "and",
  "but",
  "for",
  "with",
  "from",
  "into",
  "onto",
  "upon",
  "than",
  "this",
  "that",
  "these",
  "those",
  "their",
  "there",
]);

function tokensOf(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .split(/[\s,;:.!?'"\(\)\[\]\-]+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w)),
  );
}

/**
 * Run the leak rules against a (correct, distractors) pair.
 * Returns the first matching reason, or `null` if the answer shape
 * is consistent with the distractors. Reasons are short
 * machine-readable strings — the lint script groups by them, the
 * seed pipeline persists them on `questions.lintReason`.
 */
export function detectShapeLeak(
  correct: string,
  distractors: readonly string[],
): string | null {
  // 1. Parens on correct only — should already be auto-fixed at
  //    build, but surface here in case the auto-strip missed
  //    something (e.g. unbalanced bracket pair).
  if (PAREN_RE.test(correct) && !distractors.some((d) => PAREN_RE.test(d))) {
    return "parens-only-on-correct";
  }

  // 2. Comma — correct contains commas, no distractor does. A stray
  //    comma in "Marie, reine d'Écosse" against bare names is almost
  //    always a real shape tell unless the distractors match the
  //    same `Title, role` template.
  if (correct.includes(",") && !distractors.some((d) => d.includes(","))) {
    return "comma-only-on-correct";
  }

  // 3. Word common to every distractor but absent from the correct
  //    answer — "FreeBSD seul / OpenBSD seul / NetBSD seul / 4BSD"
  //    is the canonical example. The player picks the lone outlier
  //    without knowing the topic.
  if (distractors.length >= 2) {
    const correctTokens = tokensOf(correct);
    const distractorTokenSets = distractors.map(tokensOf);
    const first = distractorTokenSets[0]!;
    const commonInAll: string[] = [];
    for (const w of first) {
      if (distractorTokenSets.every((s) => s.has(w))) {
        commonInAll.push(w);
      }
    }
    const leaks = commonInAll.filter((w) => !correctTokens.has(w));
    if (leaks.length > 0) {
      return `common-in-distractors-only: "${leaks.join('", "')}"`;
    }
  }

  return null;
}
