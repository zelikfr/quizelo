import { decode } from "@auth/core/jwt";

const SESSION_COOKIE_DEV = "authjs.session-token";
const SESSION_COOKIE_PROD = "__Secure-authjs.session-token";

export const sessionCookieName = (isProd: boolean) =>
  isProd ? SESSION_COOKIE_PROD : SESSION_COOKIE_DEV;

export interface AuthSession {
  userId: string;
  email?: string | null;
}

/**
 * Decode the Auth.js session JWT shared via cookie between apps/web and
 * apps/api. Both must use the same AUTH_SECRET.
 */
export const decodeSessionToken = async (
  token: string,
  opts: { secret: string; isProd?: boolean },
): Promise<AuthSession | null> => {
  if (!token) return null;
  const salt = sessionCookieName(opts.isProd ?? false);

  try {
    const payload = await decode({
      token,
      secret: opts.secret,
      salt,
    });

    if (!payload || typeof payload !== "object") return null;

    const userId =
      (payload as { userId?: string }).userId ?? (payload as { sub?: string }).sub;
    if (!userId) return null;

    return {
      userId,
      email: (payload as { email?: string | null }).email ?? null,
    };
  } catch {
    return null;
  }
};
