import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/landing/PageShell";
import { NOT_FOUND } from "@/constants/content/pages";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: NOT_FOUND.title,
};

export default function NotFound() {
  return (
    <PageShell>
      <h1 className="text-5xl tracking-heading has-mb-3">{NOT_FOUND.heading}</h1>
      <p className="text-lg is-dim has-mb-6">{NOT_FOUND.body}</p>
      <Link
        href={ROUTES.board}
        className="button button--primary is-inline-flex is-align-center has-font-bold has-radius-field has-py-4 has-px-6 text-lg"
      >
        {NOT_FOUND.cta}
      </Link>
    </PageShell>
  );
}
