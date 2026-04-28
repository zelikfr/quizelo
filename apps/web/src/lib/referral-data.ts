/**
 * Static fixtures for the referral mockup. At runtime these come from
 * `/api/referral/state`.
 */

export const REFERRAL_CODE = "NYRA-92K3";

export type MilestoneState = "done" | "active" | "idle";

export interface Milestone {
  /** Stable id used for i18n key lookup. */
  id: "firstGame" | "tenGames" | "premium";
  /** Credits the referrer earns when this is completed. */
  ownerCredits: number;
  /** Credits the referee earns. */
  refereeCredits: number;
  state: MilestoneState;
  /** 0..1, only meaningful for `state === "active"`. */
  progress?: number;
}

export const MILESTONES: readonly Milestone[] = [
  { id: "firstGame", ownerCredits:  50, refereeCredits:  50, state: "done"   },
  { id: "tenGames",  ownerCredits: 100, refereeCredits:  50, state: "active", progress: 0.6 },
  { id: "premium",   ownerCredits: 200, refereeCredits: 100, state: "idle"   },
];

export type FriendStatus = "active" | "premium";

export interface ReferredFriend {
  name: string;
  /** ISO-ish locale-agnostic display string used as-is. */
  joinedLabel: string;
  /** Tier reached among the milestones (1, 2, 3). */
  tier: 1 | 2 | 3;
  earnedCredits: number;
  status: FriendStatus;
  seed: number;
}

export const REFERRED_FRIENDS: readonly ReferredFriend[] = [
  { name: "lior_pix",  joinedLabel: "12 avr.", tier: 2, earnedCredits: 150, status: "active",  seed: 3 },
  { name: "mae.exe",   joinedLabel: "08 avr.", tier: 1, earnedCredits:  50, status: "active",  seed: 4 },
  { name: "theory_07", joinedLabel: "02 avr.", tier: 3, earnedCredits: 350, status: "premium", seed: 5 },
  { name: "kovax",     joinedLabel: "28 mar.", tier: 2, earnedCredits: 150, status: "active",  seed: 6 },
];

export const REFERRAL_TOTALS = {
  friendsCount: 4,
  earnedCredits: 700,
} as const;

export const SHARE_PLATFORMS = ["WhatsApp", "Discord", "Twitter/X", "iMessage"] as const;
