/**
 * Season / leaderboard cycle helper.
 *
 * Seasons are simple time-windows of `SEASON_DURATION_DAYS` starting from
 * `EPOCH`. Each season gets a sequential number starting at 1. The
 * leaderboard resets at every season boundary (UI side — actual DB reset
 * is a future cron job).
 *
 * To shift the cadence, change the two constants below.
 */

/** Start of season 1 (UTC). Tweak if the launch slipped. */
const EPOCH = new Date("2026-01-01T00:00:00Z");
/** Length of a single season in days. */
const SEASON_DURATION_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;
const SEASON_MS = SEASON_DURATION_DAYS * DAY_MS;

export interface Season {
  /** Sequential number, starting at 1. */
  number: number;
  /** Inclusive start of this season (UTC). */
  startDate: Date;
  /** Exclusive end of this season (= start of next). */
  endDate: Date;
  /** Whole calendar days remaining until `endDate` (rounded up, min 0). */
  daysLeft: number;
}

/** Compute the season covering `now` (defaults to the current time). */
export function getCurrentSeason(now: Date = new Date()): Season {
  const elapsed = Math.max(0, now.getTime() - EPOCH.getTime());
  const idx = Math.floor(elapsed / SEASON_MS); // 0-based
  const startDate = new Date(EPOCH.getTime() + idx * SEASON_MS);
  const endDate = new Date(startDate.getTime() + SEASON_MS);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / DAY_MS));
  return {
    number: idx + 1,
    startDate,
    endDate,
    daysLeft,
  };
}

/** Format the season number with a leading zero ("03", "12", "104"). */
export function formatSeasonNumber(n: number): string {
  return n.toString().padStart(2, "0");
}
