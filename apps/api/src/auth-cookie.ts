import { decodeSessionToken, sessionCookieName, type AuthSession } from "@quizelo/auth/jwt";
import type { FastifyRequest } from "fastify";
import { env } from "./env";

const isProd = env.NODE_ENV === "production";
const cookieName = sessionCookieName(isProd);

export type { AuthSession };

export const readSession = async (req: FastifyRequest): Promise<AuthSession | null> => {
  const token = req.cookies[cookieName];
  if (!token) return null;
  return decodeSessionToken(token, { secret: env.AUTH_SECRET, isProd });
};
