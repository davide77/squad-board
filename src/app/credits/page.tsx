import type { Metadata } from "next";
import { PageShell } from "@/components/landing/PageShell";
import { CREDITS, MAKER } from "@/constants/content/pages";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: CREDITS.title,
  description: CREDITS.description,
  path: ROUTES.credits,
});

export default function CreditsPage() {
  return (
    <PageShell>
      <h1 className="text-5xl tracking-heading has-mb-8">{CREDITS.heading}</h1>
      <section className="has-mb-8">
        <p className="text-sm uppercase tracking-caps is-dimmer has-mb-2">{CREDITS.makerLabel}</p>
        <p className="has-font-headline has-font-bold text-4xl is-chalk has-mb-2">{MAKER.name}</p>
        <p className="text-lg leading-relaxed is-dim has-mb-3">{MAKER.bio}</p>
        <a href={MAKER.url} className="hit-area is-kit has-font-semibold text-lg">
          {CREDITS.makerLink}
        </a>
      </section>
      <section className="has-mb-8">
        <h2 className="text-2xl tracking-heading has-mb-3">{CREDITS.builtHeading}</h2>
        <ul className="is-flex is-flex-column">
          {CREDITS.built.map((b) => (
            <li key={b.name} className="is-flex is-flex-column has-gap-1 has-py-3">
              <span className="has-font-semibold text-md">{b.name}</span>
              <span className="text-sm is-dim">{b.note}</span>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-md is-dim">{CREDITS.thanks}</p>
    </PageShell>
  );
}
