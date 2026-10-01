import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/constants/config";

// Signed tokens for sign-in, with no database. A token is base64url(JSON) + "." + an HMAC of it,
// keyed with AUTH_SECRET. "purpose" keeps an emailed link from ever working as a session and the
// other way round. Server only: imported by the account page, the link route and the sign-in actions.

type Purpose = "link" | "session";

interface Payload {
  readonly p: Purpose;
  readonly email: string;
  /** Expiry, in milliseconds since 1970. */
  readonly exp: number;
}

export interface Session {
  readonly email: string;
}

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
// A secret shorter than this is a mistake, not a key.
const MIN_SECRET = 32;

function secret(): string | null {
  const s = process.env.AUTH_SECRET;
  return s && s.length >= MIN_SECRET ? s : null;
}

function sign(body: string, key: string): string {
  return createHmac("sha256", key).update(body).digest("base64url");
}

function make(purpose: Purpose, email: string, lifeMs: number, now: number): string | null {
  const key = secret();
  if (!key) return null;
  const payload: Payload = { p: purpose, email, exp: now + lifeMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, key)}`;
}

export type CheckResult = { readonly ok: true; readonly email: string } | { readonly ok: false; readonly reason: "expired" | "invalid" };

function check(token: string, purpose: Purpose, now: number): CheckResult {
  const key = secret();
  const [body, mac] = token.split(".");
  if (!key || !body || !mac) return { ok: false, reason: "invalid" };
  const want = Buffer.from(sign(body, key));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return { ok: false, reason: "invalid" };
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Partial<Payload>;
    if (payload.p !== purpose || typeof payload.email !== "string" || typeof payload.exp !== "number") {
      return { ok: false, reason: "invalid" };
    }
    if (payload.exp < now) return { ok: false, reason: "expired" };
    return { ok: true, email: payload.email };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

export const makeLinkToken = (email: string, now: number) => make("link", email, AUTH_CONFIG.linkMinutes * MINUTE_MS, now);
export const checkLinkToken = (token: string, now: number) => check(token, "link", now);

export const SESSION_MAX_AGE_S = (AUTH_CONFIG.sessionDays * DAY_MS) / 1000;
export const makeSessionToken = (email: string, now: number) => make("session", email, AUTH_CONFIG.sessionDays * DAY_MS, now);

/** The cookie's settings. httpOnly so page scripts never see it; lax so the emailed link can set it. */
export const SESSION_COOKIE = {
  name: AUTH_CONFIG.cookie,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_S,
} as const;

/** Who is signed in on this browser, or null. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(AUTH_CONFIG.cookie)?.value;
  if (!token) return null;
  const result = check(token, "session", Date.now());
  return result.ok ? { email: result.email } : null;
}
