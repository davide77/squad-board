import { NextResponse, type NextRequest } from "next/server";
import { AUTH_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { checkLinkToken, makeSessionToken, SESSION_COOKIE } from "@/lib/server/auth";

// Where the sign-in email's link lands. A good link sets the session cookie and goes to the
// account page; a bad or old one goes there too, saying why, so the coach can send another.
export function GET(request: NextRequest) {
  const now = Date.now();
  const token = request.nextUrl.searchParams.get(AUTH_CONFIG.tokenParam) ?? "";
  const result = checkLinkToken(token, now);
  const to = new URL(ROUTES.account, request.nextUrl.origin);

  if (!result.ok) {
    to.searchParams.set(AUTH_CONFIG.statusParam, result.reason);
    return NextResponse.redirect(to);
  }
  const session = makeSessionToken(result.email, now);
  if (!session) {
    to.searchParams.set(AUTH_CONFIG.statusParam, "invalid");
    return NextResponse.redirect(to);
  }
  to.searchParams.set(AUTH_CONFIG.statusParam, "ok");
  const res = NextResponse.redirect(to);
  res.cookies.set({ ...SESSION_COOKIE, value: session });
  return res;
}
