"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONFIG } from "@/constants/config";
import { SIGN_IN_EMAIL } from "@/constants/content/account";
import { ROUTES } from "@/constants/routes";
import { SITE_URL } from "@/constants/seo";
import { makeLinkToken } from "./auth";

export type SignInStatus = "idle" | "sent" | "invalid" | "failed";

export interface SignInState {
  readonly status: SignInStatus;
  readonly email?: string;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function emailHtml(link: string): string {
  const e = SIGN_IN_EMAIL;
  const href = escape(link);
  // Plain, dark and short, like the board. Inline styles only: email clients ignore stylesheets.
  // One link, on the button, and no web address written out as text: if a link is ever rewritten for
  // tracking, an address that reads one way and goes another is what spam filters call phishing.
  // The plain-text part carries the address for anyone whose app hides the button.
  return `<!doctype html><html><body style="margin:0;background:#0A0A0A;color:#F6F6F3;font-family:Arial,sans-serif">
<div style="max-width:480px;margin:0 auto;padding:32px 24px">
<p style="font-size:22px;font-weight:bold;margin:0 0 12px">${escape(e.heading)}</p>
<p style="font-size:16px;line-height:1.5;color:#96968F;margin:0 0 24px">${escape(e.body)}</p>
<p style="margin:0 0 24px"><a href="${href}" style="display:inline-block;background:#F2D106;color:#0A0A0A;font-weight:bold;text-decoration:none;padding:12px 20px;border-radius:8px">${escape(e.button)}</a></p>
<p style="font-size:13px;line-height:1.5;color:#7E7E76;margin:16px 0 0">${escape(e.ignore)}</p>
</div></body></html>`;
}

/**
 * Where the link points. Always the live site in production, so a forged Host header can never put
 * someone else's address in the email. Locally, the dev server the request came to.
 */
async function origin(): Promise<string> {
  if (process.env.NODE_ENV === "production") return SITE_URL;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;
}

/**
 * Emails a sign-in link. Nothing is stored: the link carries the address, signed and timed. The same
 * answer comes back whether or not the address has signed in before, so nobody can test addresses.
 */
export async function requestSignIn(_previous: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  // A bot that fills in the hidden field is told it worked, and nothing is sent.
  if (String(form.get(AUTH_CONFIG.trapField) ?? "")) return { status: "sent", email };
  if (email.length > AUTH_CONFIG.maxEmail || !EMAIL.test(email)) return { status: "invalid" };

  const key = process.env.BREVO_API_KEY;
  const from = process.env.BREVO_SENDER_EMAIL;
  const token = makeLinkToken(email, Date.now());
  if (!key || !from || !token) return { status: "failed" };

  const link = `${await origin()}${ROUTES.signInLink}?${AUTH_CONFIG.tokenParam}=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(AUTH_CONFIG.emailEndpoint, {
      method: "POST",
      headers: { "api-key": key, accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: AUTH_CONFIG.senderName, email: from },
        to: [{ email }],
        subject: SIGN_IN_EMAIL.subject,
        htmlContent: emailHtml(link),
        textContent: `${SIGN_IN_EMAIL.body}\n\n${link}\n\n${SIGN_IN_EMAIL.ignore}`,
        // A sign-in email is not marketing: no open or click tracking on it.
        tags: ["sign-in"],
      }),
      cache: "no-store",
    });
    return res.ok ? { status: "sent", email } : { status: "failed" };
  } catch {
    return { status: "failed" };
  }
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(AUTH_CONFIG.cookie);
  redirect(ROUTES.account);
}
