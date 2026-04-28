/**
 * Static pricing fixtures for the shop mockup. Runtime values come from
 * `/api/shop/products` (or platform IAP product ids on iOS/Android).
 */

export type BadgeKey = "popular" | "bestValue";

export interface CreditPack {
  id: string;
  /** Mono-cap eyebrow shown above the price. */
  name: string;
  credits: number;
  priceLabel: string;
  /** Per-credit price in cents — drives the "0,91 ¢ / credit" sub-line. */
  pricePerCredit: string;
  /** Highlighted pack (visual emphasis). */
  highlighted?: boolean;
  /** Optional floating badge i18n key. */
  badge?: BadgeKey;
}

export const CREDIT_PACKS: readonly CreditPack[] = [
  { id: "starter",  name: "Starter",  credits:  200, priceLabel: "1,99 €",  pricePerCredit: "1,00" },
  { id: "standard", name: "Standard", credits:  550, priceLabel: "4,99 €",  pricePerCredit: "0,91", badge: "popular" },
  { id: "premium",  name: "Premium",  credits: 1200, priceLabel: "9,99 €",  pricePerCredit: "0,83", highlighted: true },
  { id: "mega",     name: "Mega",     credits: 2800, priceLabel: "19,99 €", pricePerCredit: "0,71", badge: "bestValue" },
];

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

export const SHOP_BALANCE = 1240;
