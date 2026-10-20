// What the server remembers about signing in, and nothing else: which emailed links have been used,
// and when each address last signed out. It lives in Upstash Redis, through its REST API, as short
// keys that expire on their own. Squads are never here. Server only.

export interface AuthStore {
  /** True the first time a key is claimed, false every time after, until it expires. */
  claim(key: string, ttlS: number): Promise<boolean>;
  put(key: string, value: number, ttlS: number): Promise<void>;
  /** The number kept under a key, or null when there is none. */
  read(key: string): Promise<number | null>;
}

const toNumber = (v: unknown): number | null => {
  const n = typeof v === "string" || typeof v === "number" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

function upstash(url: string, token: string): AuthStore {
  async function run(command: readonly (string | number)[]): Promise<unknown> {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Auth store answered ${res.status}`);
    return ((await res.json()) as { result?: unknown }).result ?? null;
  }
  return {
    claim: async (key, ttlS) => (await run(["SET", key, "1", "NX", "EX", ttlS])) === "OK",
    put: async (key, value, ttlS) => {
      await run(["SET", key, String(value), "EX", ttlS]);
    },
    read: async (key) => toNumber(await run(["GET", key])),
  };
}

/** A store held in memory: for the tests, and for local work without Upstash. Forgets on restart. */
export function memoryStore(): AuthStore {
  const keys = new Map<string, { value: string; until: number }>();
  const live = (key: string) => {
    const hit = keys.get(key);
    if (hit && hit.until <= Date.now()) keys.delete(key);
    return keys.get(key) ?? null;
  };
  return {
    claim: async (key, ttlS) => {
      if (live(key)) return false;
      keys.set(key, { value: "1", until: Date.now() + ttlS * 1000 });
      return true;
    },
    put: async (key, value, ttlS) => {
      keys.set(key, { value: String(value), until: Date.now() + ttlS * 1000 });
    },
    read: async (key) => toNumber(live(key)?.value),
  };
}

let local: AuthStore | null = null;

/**
 * The store, or null when there is none to use. The Vercel Marketplace sets KV_REST_API_URL and
 * KV_REST_API_TOKEN; a store made on Upstash directly uses the UPSTASH_ names. Locally, without
 * either, a memory store stands in. In production with neither, sign-in refuses rather than guess.
 */
export function authStore(): AuthStore | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return upstash(url, token);
  if (process.env.NODE_ENV !== "production") return (local ??= memoryStore());
  return null;
}
