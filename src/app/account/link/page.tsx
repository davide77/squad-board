import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConfirmSignInButton } from "@/components/account/ConfirmSignInButton";
import { PageShell } from "@/components/landing/PageShell";
import { AUTH_CONFIG } from "@/constants/config";
import { ACCOUNT } from "@/constants/content/account";
import { ROUTES } from "@/constants/routes";
import { peekLinkNow } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: ACCOUNT.confirm.title,
  robots: { index: false, follow: false },
};

interface SignInLinkPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Where the emailed link lands. Opening it changes nothing: email apps open links to check them.
// The link is only used up when the coach presses the button.
export default async function SignInLinkPage({ searchParams }: SignInLinkPageProps) {
  const raw = (await searchParams)[AUTH_CONFIG.tokenParam];
  const token = typeof raw === "string" ? raw : "";
  const link = peekLinkNow(token);
  if (!link.ok) redirect(`${ROUTES.account}?${AUTH_CONFIG.statusParam}=${link.reason}`);

  const copy = ACCOUNT.confirm;
  return (
    <PageShell>
      <h1 className="text-5xl tracking-heading has-mb-3">{copy.heading}</h1>
      <p className="text-lg leading-relaxed has-mb-2">{copy.as(link.email)}</p>
      <p className="text-md is-dim has-mb-6 measure-52ch">{copy.note}</p>
      <ConfirmSignInButton token={token} />
    </PageShell>
  );
}
