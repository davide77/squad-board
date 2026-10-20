import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "@/constants/config";
import { authStore, type AuthStore } from "./store";

// Signed tokens for sign-in, with no account database. A token is base64url(JSON) + "." + an HMAC
// of it, keyed with AUTH_SECRET. "purpose" keeps an emailed link from ever working as a session and
// the other way round. The signature alone is not enough: an emailed link carries an id the store
// marks used the first time, and a session is refused if its address signed out after it was made.
// Server only: imported by the account pages and the sign-in actions.

type Purpose = "link" | "session";

interface Payload {
  readonly p: Purpose;
  readonly email: string;
  /** Expiry, in milliseconds since 1970. */
  readonly exp: number;
  /** A link's own id, so it can be used once. Sessions have none. */
  readonly id?: string;
}

export interface Session {
  readonly email: string;
}

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const LINK_MS = AUTH_CONFIG.linkMinutes * MINUTE_MS;
const SESSION_MS = AUTH_CONFIG.sessionDays * DAY_MS;
// A secret shorter than this is a mistake, not a key.
const MIN_SECRET = 32;

function secret(): string | null {
  const s = process.env.AUTH_SECRET;
  return s && s.length >= MIN_SECRET ? s : null;
}

function sign(body: string, key: string): string {
  return createHmac("sha256", key).update(body).digest("base64url");
}

function make(purpose: Purpose, email: string, lifeMs: number, now: number, id?: string): string | null {
  const key = secret();
  if (!key) return null;
  const payload: Payload = { p: purpose, email, exp: now + lifeMs, ...(id ? { id } : {}) };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, key)}`;
}

type Checked = { readonly ok: true; readonly email: string; readonly exp: number; readonly id?: string } | { readonly ok: false; readonly reason: "expired" | "invalid" };

function check(token: string, purpose: Purpose, now: number): Checked {
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
    return { ok: true, email: payload.email, exp: payload.exp, id: typeof payload.id === "string" ? payload.id : undefined };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

/** The store never sees an address as written: only this keyed hash of it. */
function signedOutKey(email: string, key: string): string {
  return AUTH_CONFIG.signedOutKey + createHmac("sha256", key).update(email).digest("base64url");
}

export const makeLinkToken = (email: string, now: number) => make("link", email, LINK_MS, now, randomUUID());

export type LinkCheck = { readonly ok: true; readonly email: string } | { readonly ok: false; readonly reason: "expired" | "invalid" };

/** Whether an emailed link looks good, without using it up. For the page it lands on. */
export function peekLink(token: string, now: number): LinkCheck {
  const result = check(token, "link", now);
  if (!result.ok) return result;
  return result.id ? { ok: true, email: result.email } : { ok: false, reason: "invalid" };
}

/** The same check against the clock, for the page itself. */
export const peekLinkNow = (token: string) => peekLink(token, Date.now());

export type Redeemed = { readonly ok: true; readonly session: string } | { readonly ok: false; readonly reason: "expired" | "invalid" | "used" | "failed" };

/** Uses an emailed link up and returns a new session for its address. A second go at the same link is refused. */
export async function redeemLink(token: string, now: number, store: AuthStore): Promise<Redeemed> {
  const result = check(token, "link", now);
  if (!result.ok) return result;
  if (!result.id) return { ok: false, reason: "invalid" };
  try {
    // Kept a minute past the link's own life, so it is still marked used for as long as it could work.
    const fresh = await store.claim(AUTH_CONFIG.usedLinkKey + result.id, LINK_MS / 1000 + 60);
    if (!fresh) return { ok: false, reason: "used" };
  } catch {
    return { ok: false, reason: "failed" };
  }
  const session = make("session", result.email, SESSION_MS, now);
  return session ? { ok: true, session } : { ok: false, reason: "invalid" };
}

/** The address a session cookie signs in, or null when it is bad, old, or its address has signed out since. */
export async function sessionEmail(token: string, now: number, store: AuthStore): Promise<string | null> {
  const result = check(token, "session", now);
  const key = secret();
  if (!result.ok || !key) return null;
  try {
    const signedOutAt = await store.read(signedOutKey(result.email, key));
    const madeAt = result.exp - SESSION_MS;
    return signedOutAt !== null && madeAt <= signedOutAt ? null : result.email;
  } catch {
    // If the store cannot say, nobody is let in on the strength of the cookie alone.
    return null;
  }
}

/** Ends every session made for this address until now, on every device, copied cookies included. */
export async function endSessions(email: string, now: number, store: AuthStore): Promise<void> {
  const key = secret();
  if (key) await store.put(signedOutKey(email, key), now, SESSION_MS / 1000);
}

/** The cookie's settings. httpOnly so page scripts never see it; lax so it travels when the coach follows a link to the site. */
export const SESSION_COOKIE = {
  name: AUTH_CONFIG.cookie,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MS / 1000,
} as const;

/** Who is signed in on this browser, or null. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(AUTH_CONFIG.cookie)?.value;
  const store = authStore();
  if (!token || !store) return null;
  const email = await sessionEmail(token, Date.now(), store);
  return email ? { email } : null;
}
