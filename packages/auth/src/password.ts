import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// `promisify(scryptCb)`'s default type signature only exposes the
// 3-arg overload `(password, salt, keylen) => Promise<Buffer>`. The
// node:crypto callback variant accepts an `options` 4th argument
// (N / r / p tuning) which `promisify` carries through fine at
// runtime, but TS can't pick the right overload through `promisify`.
// We re-type it manually so the calls below stop erroring.
const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: { N?: number; r?: number; p?: number; maxmem?: number },
) => Promise<Buffer>;

/**
 * Password hashing — scrypt via node:crypto.
 *
 * Why scrypt and not argon2id?
 *   - Pure JS resolution: no native binding, webpack/Next bundle it cleanly.
 *   - Built into Node, no extra dependency.
 *   - Memory-hard, RFC 7914, recommended by Auth.js.
 *
 * Format: `scrypt$<N>$<r>$<p>$<saltB64>$<hashB64>`
 */
const N = 16_384; // CPU/memory cost (2^14)
const r = 8;
const p = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

export const hashPassword = async (plain: string): Promise<string> => {
  const salt = randomBytes(SALT_LEN);
  const derived = (await scrypt(plain, salt, KEY_LEN, { N, r, p })) as Buffer;
  return [
    "scrypt",
    N,
    r,
    p,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
};

export const verifyPassword = async (
  storedHash: string,
  plain: string,
): Promise<boolean> => {
  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nStr, rStr, pStr, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64!, "base64");
  const expected = Buffer.from(hashB64!, "base64");
  const params = { N: Number(nStr), r: Number(rStr), p: Number(pStr) };

  if (!params.N || !params.r || !params.p) return false;

  const actual = (await scrypt(plain, salt, expected.length, params)) as Buffer;
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
};
