/**
 * Shop catalog. Source of truth for the in-app prices, used by:
 *   - the shop UI (display cards)
 *   - `purchaseCreditPackAction` (Stripe PaymentIntent amount)
 *   - `spendCoinsOnBoostAction` (price in coins)
 *
 * To launch a new pack, just push a row here — no Stripe Product/Price
 * needed because we create PaymentIntents with the amount inline.
 */

export type BadgeKey = "popular" | "bestValue";

export interface CreditPack {
  id: string;
  /** Mono-cap eyebrow shown above the price. */
  name: string;
  credits: number;
  /** Total in the smallest currency unit (e.g. 199 = 1,99 €). */
  amountCents: number;
  /** ISO 4217 lowercase code passed to Stripe (`eur`, `usd`, …). */
  currency: string;
  /** Display label, e.g. "1,99 €". Pre-localized for FR; the UI can
   *  re-format from amount/currency for other locales. */
  priceLabel: string;
  /** Per-credit price in cents — drives the "0,91 ¢ / credit" sub-line. */
  pricePerCredit: string;
  /** Highlighted pack (visual emphasis). */
  highlighted?: boolean;
  /** Optional floating badge i18n key. */
  badge?: BadgeKey;
}

export const CREDIT_PACKS: readonly CreditPack[] = [
  { id: "starter",  name: "Starter",  credits:  200, amountCents:   199, currency: "eur", priceLabel: "1,99 €",  pricePerCredit: "1,00" },
  { id: "standard", name: "Standard", credits:  550, amountCents:   499, currency: "eur", priceLabel: "4,99 €",  pricePerCredit: "0,91", badge: "popular" },
  { id: "premium",  name: "Premium",  credits: 1200, amountCents:   999, currency: "eur", priceLabel: "9,99 €",  pricePerCredit: "0,83", highlighted: true },
  { id: "mega",     name: "Mega",     credits: 2800, amountCents:  1999, currency: "eur", priceLabel: "19,99 €", pricePerCredit: "0,71", badge: "bestValue" },
];

export function findCreditPack(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

export type BoostKind = "double-elo" | "shield";

export interface BoostCard {
  id: string;
  kind: BoostKind;
  /** Glyph rendered inside the colored tile. */
  icon: string;
  /** Tile + price color. */
  tint: string;
  /** Game count or qualifier shown after the kind label, e.g. "3" or "5". */
  count: number;
  /** Price in coins. */
  price: number;
  /** Marks the card as "TOP" — gold gradient + ★ TOP badge. */
  best?: boolean;
}

export const BOOST_CARDS: readonly BoostCard[] = [
  { id: "x2-3",      kind: "double-elo", icon: "×2", tint: "#7C5CFF", count:  3, price: 150 },
  { id: "x2-5",      kind: "double-elo", icon: "×2", tint: "#7C5CFF", count:  5, price: 220 },
  { id: "x2-10",     kind: "double-elo", icon: "×2", tint: "#FFD166", count: 10, price: 380, best: true },
  { id: "shield-1",  kind: "shield",     icon: "◊",  tint: "#4ADE80", count:  1, price: 100 },
  { id: "shield-3",  kind: "shield",     icon: "◊",  tint: "#4ADE80", count:  3, price: 270 },
];

export function findBoost(id: string): BoostCard | undefined {
  return BOOST_CARDS.find((b) => b.id === id);
}
