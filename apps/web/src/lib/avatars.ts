/** Deterministic palette used by `<QAAvatar seed={n} />`. */
export const AVATAR_SEEDS = [
  { bg: "linear-gradient(135deg,#7C5CFF,#3B1E8C)", fg: "#FFFFFF" },
  { bg: "linear-gradient(135deg,#FFD166,#B07A1A)", fg: "#1A1430" },
  { bg: "linear-gradient(135deg,#FF6BB5,#8C1E55)", fg: "#FFFFFF" },
  { bg: "linear-gradient(135deg,#5BC8FF,#1E5C8C)", fg: "#FFFFFF" },
  { bg: "linear-gradient(135deg,#4ADE80,#1E5C2E)", fg: "#FFFFFF" },
  { bg: "linear-gradient(135deg,#FF8B5C,#8C3D1E)", fg: "#FFFFFF" },
  { bg: "linear-gradient(135deg,#A18BFF,#5C3DAE)", fg: "#FFFFFF" },
  { bg: "linear-gradient(135deg,#7DE0E0,#1E6E8C)", fg: "#FFFFFF" },
  { bg: "linear-gradient(135deg,#FF4D6D,#8C1E2E)", fg: "#FFFFFF" },
  { bg: "linear-gradient(135deg,#FFB020,#8C5C1E)", fg: "#1A1430" },
] as const;

export type AvatarPalette = (typeof AVATAR_SEEDS)[number];

export function avatarFromSeed(seed: number): AvatarPalette {
  return AVATAR_SEEDS[seed % AVATAR_SEEDS.length];
}
