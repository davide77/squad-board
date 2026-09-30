"use server";

import { WAITLIST_CONFIG } from "@/constants/config";

export type WaitlistStatus = "idle" | "joined" | "invalid" | "failed";

export interface WaitlistState {
  readonly status: WaitlistStatus;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SOURCE = /^\/[a-z0-9-/]*$/;

/**
 * Adds an email to the club waitlist. Runs on the server, and writes through Supabase's REST API
 * with the publishable key, which row-level security allows to insert and nothing else.
 * An address already on the list counts as joined: signing up twice is not an error for the coach.
 */
export async function joinWaitlist(_previous: WaitlistState, form: FormData): Promise<WaitlistState> {
  // A bot that fills in the hidden field is thanked, and nothing is written.
  if (String(form.get(WAITLIST_CONFIG.trapField) ?? "")) return { status: "joined" };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (email.length > WAITLIST_CONFIG.maxEmail || !EMAIL.test(email)) return { status: "invalid" };
  const asked = String(form.get("source") ?? "/");
  const source = SOURCE.test(asked) && asked.length <= WAITLIST_CONFIG.maxSource ? asked : "/";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { status: "failed" };

  try {
    const res = await fetch(`${url}/rest/v1/${WAITLIST_CONFIG.table}`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email, source }),
      cache: "no-store",
    });
    // 409 is the unique address: already on the list.
    return { status: res.ok || res.status === 409 ? "joined" : "failed" };
  } catch {
    return { status: "failed" };
  }
}
