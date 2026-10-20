import { beforeAll, describe, expect, it } from "vitest";
import { AUTH_CONFIG } from "@/constants/config";
import { endSessions, makeLinkToken, peekLink, redeemLink, sessionEmail } from "./auth";
import { memoryStore, type AuthStore } from "./store";

const COACH = "coach@example.com";
const T = Date.UTC(2026, 9, 24, 9, 0);
const MIN = 60_000;

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-that-is-at-least-thirty-two-characters";
});

const link = (now = T) => makeLinkToken(COACH, now) ?? "";

async function signIn(store: AuthStore, now = T): Promise<string> {
  const result = await redeemLink(link(now), now, store);
  if (!result.ok) throw new Error(`sign-in refused: ${result.reason}`);
  return result.session;
}

/** A store that is down. */
const broken: AuthStore = {
  claim: () => Promise.reject(new Error("down")),
  put: () => Promise.reject(new Error("down")),
  read: () => Promise.reject(new Error("down")),
};

describe("the emailed link", () => {
  it("works once: opened twice, or forwarded and opened again, the second go is refused", async () => {
    const store = memoryStore();
    const token = link();
    expect((await redeemLink(token, T + MIN, store)).ok).toBe(true);
    expect(await redeemLink(token, T + 2 * MIN, store)).toEqual({ ok: false, reason: "used" });
  });

  it("is not used up just by being opened, so an email app checking it cannot spend it", async () => {
    const store = memoryStore();
    const token = link();
    expect(peekLink(token, T)).toEqual({ ok: true, email: COACH });
    expect(peekLink(token, T)).toEqual({ ok: true, email: COACH });
    expect((await redeemLink(token, T, store)).ok).toBe(true);
  });

  it("runs out after its time", async () => {
    const late = T + AUTH_CONFIG.linkMinutes * MIN + 1;
    expect(await redeemLink(link(), late, memoryStore())).toEqual({ ok: false, reason: "expired" });
  });

  it("cannot be swapped for a session cookie, or the other way round", async () => {
    const store = memoryStore();
    const session = await signIn(store);
    expect(await redeemLink(session, T, store)).toEqual({ ok: false, reason: "invalid" });
    expect(await sessionEmail(link(), T, store)).toBeNull();
  });

  it("refuses to sign in when the store cannot record the link as used", async () => {
    expect(await redeemLink(link(), T, broken)).toEqual({ ok: false, reason: "failed" });
  });
});

describe("signing out", () => {
  // John's case: copy the session cookie, sign out, then present the copy again.
  it("ends a copied session cookie too, not just the one in this browser", async () => {
    const store = memoryStore();
    const copied = await signIn(store);
    expect(await sessionEmail(copied, T + MIN, store)).toBe(COACH);

    await endSessions(COACH, T + 2 * MIN, store);
    expect(await sessionEmail(copied, T + 3 * MIN, store)).toBeNull();
  });

  it("signs out every device that used the address", async () => {
    const store = memoryStore();
    const phone = await signIn(store, T);
    const laptop = await signIn(store, T + MIN);
    await endSessions(COACH, T + 2 * MIN, store);
    expect(await sessionEmail(phone, T + 3 * MIN, store)).toBeNull();
    expect(await sessionEmail(laptop, T + 3 * MIN, store)).toBeNull();
  });

  it("lets the coach sign in again afterwards", async () => {
    const store = memoryStore();
    await endSessions(COACH, T, store);
    const fresh = await signIn(store, T + MIN);
    expect(await sessionEmail(fresh, T + 2 * MIN, store)).toBe(COACH);
  });

  it("lets nobody in on the cookie alone when the store is down", async () => {
    const session = await signIn(memoryStore());
    expect(await sessionEmail(session, T, broken)).toBeNull();
  });
});
