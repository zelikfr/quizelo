/**
 * Shadow display-name generator.
 *
 * Shared between the seed script (which mints batches up-front) and
 * the runtime shadow pool (which mints one row at a time when the
 * pool is exhausted). Both call `makeStyledDisplayName(used)` —
 * passing a `Set<string>` of names already issued lets callers
 * dedupe within a batch or against the live DB.
 *
 * Total combinatorial space ≈ 180 stems × 11 weighted styles ≈ ~2k
 * distinct display names, which is comfortably more than any
 * realistic shadow population.
 */

const STEMS = [
  // FR — short
  "Léa", "Léo", "Lou", "Maé", "Maël", "Naïa", "Inès", "Théo",
  "Anaïs", "Solène", "Gaïa", "Côme", "Élise", "Eli", "Rémi", "Noé",
  "Zoé", "Yann", "Loïc", "Loane", "Mila", "Liv", "Émy", "Joss",
  "Jules", "Nael", "Léna", "Soane", "Camille", "Romy", "Élio",
  "Margot", "Aurel", "Ondine", "Hugo", "Aïssa", "Tess", "Jade",
  "Nina", "Lola", "Pia", "Robin", "Yvain", "Iris", "Émile", "Maï",
  "Owen", "Saskia", "Cyrille", "Lior", "Manon", "Rita", "Élora",
  // EN — short / unisex
  "Riley", "Quinn", "Skyler", "Avery", "Sage", "Wren", "Eden",
  "Asher", "Nico", "Sam", "Phoenix", "Reese", "Rowan", "Blair",
  "Harper", "River", "Kai", "Hayden", "Shea", "Marlowe", "Tate",
  "Auden", "Brynn", "Cassidy", "Devon", "Finley", "Greer", "Indie",
  "Justice", "Kit", "Linden", "Morgan", "Nev", "Oakley", "Parker",
  "Remy", "Saxon", "Teagan", "Uma", "Vesper", "Wynn", "Yael",
  // EN/JP/random — slightly stylized first names
  "Akira", "Yuto", "Saba", "Kira", "Nyra", "Kaeli", "Orin",
  "Drelan", "Marlow", "Soren", "Sasha", "Tilo", "Vinz",
  "Xena", "Quirin", "Ruel", "Bran", "Doro", "Fenn",
  "Indigo", "Ivy", "Roux", "Yuna", "Anya", "Mei", "Niko", "Hana",
  "Tova", "Yara", "Selma", "Ines",
  // Pure handle-style monikers
  "Vex", "Onyx", "Frost", "Glitch", "Phantom", "Cipher", "Echo",
  "Halo", "Nova", "Ember", "Tachy", "Ren", "Wraith", "Drift",
  "Kovax", "Lynx", "Maverick", "Pulse", "Quasar", "Raze",
  "Solar", "Trace", "Vapor", "Wisp", "Zenith", "Ardent", "Bismuth",
  "Cobalt", "Cinder", "Dusk", "Flint", "Helix", "Ion", "Jolt",
  "Karma", "Lumen", "Mirage", "Nimbus", "Orbit", "Prism", "Quark",
  "Rune", "Specter", "Topaz", "Umbra", "Vector", "Xenon",
  "Yonder", "Zephyr",
] as const;

const COMPOUND_TAILS = [
  "byte", "core", "loop", "node", "wave", "axis", "sigma", "delta",
  "kai", "void", "hex", "neon", "moon", "sky", "ash", "fox",
  "kit", "raze", "drift", "rave", "flux", "echo", "jet",
] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/** Random year-style 2-digit number, biased toward common gamertag years. */
function randYear(): string {
  const r = Math.random();
  let n: number;
  if (r < 0.4) n = 80 + Math.floor(Math.random() * 20); // 80..99
  else if (r < 0.7) n = Math.floor(Math.random() * 10); // 00..09
  else if (r < 0.85) n = 10 + Math.floor(Math.random() * 15); // 10..24
  else n = 70 + Math.floor(Math.random() * 10); // 70..79
  return n.toString().padStart(2, "0");
}

function randSmallInt(): number {
  return Math.floor(Math.random() * 99) + 1;
}

function flatten(stem: string): string {
  return stem
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function leet(stem: string): string {
  const map: Record<string, string> = {
    a: "4",
    e: "3",
    i: "1",
    o: "0",
    s: "5",
    t: "7",
  };
  const chars = [...stem];
  const swappable = chars
    .map((c, i) => ({ c: c.toLowerCase(), i }))
    .filter((x) => map[x.c] != null);
  if (swappable.length === 0) return stem;
  const swaps = Math.min(swappable.length, Math.random() < 0.4 ? 2 : 1);
  for (let s = 0; s < swaps; s++) {
    const idx = Math.floor(Math.random() * swappable.length);
    const target = swappable.splice(idx, 1)[0]!;
    chars[target.i] = map[target.c]!;
  }
  return chars.join("");
}

type Style = (stem: string) => string;

const STYLES: Array<{ weight: number; render: Style }> = [
  // bare → "Léa"
  { weight: 18, render: (s) => s },
  // year suffix → "Léa92"
  { weight: 14, render: (s) => `${s}${randYear()}` },
  // underscore + year → "lea_92"
  { weight: 10, render: (s) => `${flatten(s)}_${randYear()}` },
  // dot initial → "Léa.S"
  {
    weight: 8,
    render: (s) =>
      `${s}.${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
  },
  // x prefix/suffix → "xLéa", "lea_x"
  {
    weight: 6,
    render: (s) =>
      Math.random() < 0.5 ? `x${s}` : `${flatten(s)}_x`,
  },
  // small int suffix → "Léa42"
  { weight: 8, render: (s) => `${s}${randSmallInt()}` },
  // letter-stretch → "leaaa", "novaa"
  {
    weight: 5,
    render: (s) => {
      const flat = flatten(s);
      const last = flat.slice(-1);
      return flat + last.repeat(2 + Math.floor(Math.random() * 2));
    },
  },
  // leetspeak → "L3a", "Né0n"
  { weight: 4, render: (s) => leet(s) },
  // ALLCAPS → "VEX", "ZEPHYR"
  { weight: 3, render: (s) => s.toUpperCase() },
  // compound → "nyraByte", "vex_core"
  {
    weight: 6,
    render: (s) => {
      const tail = pick(COMPOUND_TAILS);
      const sep = Math.random() < 0.4 ? "_" : "";
      return Math.random() < 0.5
        ? `${flatten(s)}${sep}${tail}`
        : `${flatten(s)}${tail.charAt(0).toUpperCase()}${tail.slice(1)}`;
    },
  },
  // dot-stutter → "L.éa"
  {
    weight: 3,
    render: (s) => {
      if (s.length < 3) return s;
      const cut = 1 + Math.floor(Math.random() * (s.length - 2));
      return `${s.slice(0, cut)}.${s.slice(cut)}`;
    },
  },
];

const STYLE_WEIGHT_TOTAL = STYLES.reduce((acc, s) => acc + s.weight, 0);

function pickStyle(): Style {
  let r = Math.random() * STYLE_WEIGHT_TOTAL;
  for (const s of STYLES) {
    r -= s.weight;
    if (r <= 0) return s.render;
  }
  return STYLES[0]!.render;
}

/**
 * Mint a styled display name. Pass `used` (lowercased) to skip names
 * already issued in the same batch / already in the DB. Falls back to
 * a random base36 nonce if the caller asked for far more names than
 * the combinatorial space supports.
 */
export function makeStyledDisplayName(used?: ReadonlySet<string>): string {
  for (let attempt = 0; attempt < 25; attempt++) {
    const stem = pick(STEMS);
    const styled = pickStyle()(stem);
    if (!used || !used.has(styled.toLowerCase())) return styled;
  }
  return `${pick(STEMS)}_${Math.floor(Math.random() * 0xffffff).toString(36)}`;
}

/**
 * Sanitize a display name into a handle-safe form. Always paired with
 * a base36 random suffix because `users.handle` is unique-indexed.
 */
export function makeShadowHandle(displayName: string): string {
  const base = displayName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "shadow";
  const suffix = Math.floor(Math.random() * 0xffffffff).toString(36);
  return `${base}_${suffix}`;
}
