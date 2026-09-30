"use server";

import { WAITLIST_CONFIG } from "@/constants/config";

export type WaitlistStatus = "idle" | "joined" | "invalid" | "failed";

export interface WaitlistState {
  readonly status: WaitlistStatus;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Adds an email to the club waitlist, a contact list in Brevo. Runs on the server, so the API key
 * never reaches the browser. An address already in Brevo is added to the list and counts as joined:
 * signing up twice is not an error for the coach.
 */
export async function joinWaitlist(_previous: WaitlistState, form: FormData): Promise<WaitlistState> {
  // A bot that fills in the hidden field is thanked, and nothing is written.
  if (String(form.get(WAITLIST_CONFIG.trapField) ?? "")) return { status: "joined" };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (email.length > WAITLIST_CONFIG.maxEmail || !EMAIL.test(email)) return { status: "invalid" };

  const key = process.env.BREVO_API_KEY;
  const list = Number(process.env.BREVO_WAITLIST_LIST_ID);
  if (!key || !Number.isInteger(list) || list <= 0) return { status: "failed" };

  try {
    const res = await fetch(WAITLIST_CONFIG.endpoint, {
      method: "POST",
      headers: { "api-key": key, accept: "application/json", "Content-Type": "application/json" },
      // updateEnabled: an existing contact is put on the list instead of turned away as a duplicate.
      body: JSON.stringify({ email, listIds: [list], updateEnabled: true }),
      cache: "no-store",
    });
    return { status: res.ok ? "joined" : "failed" };
  } catch {
    return { status: "failed" };
  }
}
