import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/account/SignInForm";
import { SignOutButton } from "@/components/account/SignOutButton";
import { PageShell } from "@/components/landing/PageShell";
import { AUTH_CONFIG } from "@/constants/config";
import { ACCOUNT } from "@/constants/content/account";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo";
import { getSession } from "@/lib/server/auth";

export const metadata: Metadata = {
  ...pageMetadata({ title: ACCOUNT.title, description: ACCOUNT.description, path: ROUTES.account }),
  // A sign-in page has nothing for a search engine.
  robots: { index: false, follow: false },
};

interface AccountPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const [session, params] = await Promise.all([getSession(), searchParams]);
  const status = params[AUTH_CONFIG.statusParam];

  if (session) {
    const copy = ACCOUNT.signedIn;
    return (
      <PageShell>
        <h1 className="text-5xl tracking-heading has-mb-3">{copy.heading}</h1>
        {status === "ok" && (
          <p role="status" className="text-lg is-kit has-font-semibold has-mb-6">
            {copy.welcome}
          </p>
        )}
        <dl className="is-flex is-flex-column has-gap-4 has-mb-8 text-md">
          <div>
            <dt className="text-sm is-dim uppercase tracking-caps has-font-headline has-font-semibold">{copy.as}</dt>
            <dd className="is-chalk has-font-semibold">{session.email}</dd>
          </div>
          <div>
            <dt className="text-sm is-dim uppercase tracking-caps has-font-headline has-font-semibold">{copy.planLabel}</dt>
            <dd className="is-chalk has-font-semibold">{copy.plan}</dd>
            <dd className="is-dim has-mt-1 measure-52ch">{copy.planNote}</dd>
          </div>
        </dl>
        <div className="is-flex is-flex-wrap is-align-center has-gap-3">
          <Link href={ROUTES.board} className="button button--primary has-py-3 has-px-4 has-radius-field has-font-bold text-base">
            {copy.board}
          </Link>
          <SignOutButton />
        </div>
      </PageShell>
    );
  }

  const copy = ACCOUNT.signedOut;
  const linkProblem = status === "expired" ? ACCOUNT.link.expired : status === "invalid" ? ACCOUNT.link.invalid : null;
  return (
    <PageShell>
      <h1 className="text-5xl tracking-heading has-mb-3">{copy.heading}</h1>
      {linkProblem && (
        <p role="alert" className="text-md is-out has-mb-4">
          {linkProblem}
        </p>
      )}
      <p className="text-lg leading-relaxed has-mb-2">{copy.lede}</p>
      <p className="text-md is-dim has-mb-6 measure-52ch">{copy.note}</p>
      <SignInForm />
    </PageShell>
  );
}
