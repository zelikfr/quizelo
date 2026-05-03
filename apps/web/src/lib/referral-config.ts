/**
 * Pure constants + types for the referral system.
 *
 * Lives in its own module (not in `referral-actions.ts`) because Next
 * forbids non-async exports from a `"use server"` file. Import from
 * here when you only need the shape, and from `referral-actions.ts`
 * when you need the server-side behaviour.
 */

export type MilestoneId = "firstGame" | "tenGames" | "premium";
export type MilestoneState = "done" | "active" | "idle";

/** Awards per milestone — referrer / referee. Tweak in one place. */
export const MILESTONE_AWARDS: Record<
  MilestoneId,
  { referrer: number; referee: number }
> = {
  firstGame: { referrer: 50, referee: 50 },
  tenGames: { referrer: 100, referee: 50 },
  premium: { referrer: 200, referee: 100 },
};

/** Length of generated referral codes (8 chars + a `-` separator). */
export const REFERRAL_CODE_LEN = 8;

/** Alphabet used for generated codes — excludes 0/O/I/1 to avoid
 *  ambiguity when read aloud. */
export const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export interface ReferralFriend {
  userId: string;
  name: string;
  joinedAt: Date;
  isPremium: boolean;
  matchesPlayed: number;
  earnedCredits: number;
  tier: 1 | 2 | 3;
}

export interface ReferralState {
  code: string;
  friends: ReferralFriend[];
  totals: {
    friendsCount: number;
    earnedCredits: number;
  };
  milestones: Array<{
    id: MilestoneId;
    state: MilestoneState;
    progress: number;
  }>;
}
