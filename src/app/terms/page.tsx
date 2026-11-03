import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/landing/PageShell";
import { TERMS } from "@/constants/content/pages";
import { ROUTES } from "@/constants/routes";
import { PAGE_UPDATED } from "@/constants/seo";
import { longDate, pageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: TERMS.title,
  description: TERMS.description,
  path: ROUTES.terms,
});

export default function TermsPage() {
  return (
    <PageShell>
      <JsonLd
        data={pageJsonLd({
          path: ROUTES.terms,
          name: TERMS.title,
          description: TERMS.description,
          updated: PAGE_UPDATED.terms,
        })}
      />
      <h1 className="text-5xl tracking-heading has-mb-3">{TERMS.title}</h1>
      <p className="text-sm is-dimmer has-mb-6">{TERMS.updated(longDate(PAGE_UPDATED.terms))}</p>
      <p className="text-lg leading-relaxed has-mb-8">{TERMS.intro}</p>
      {TERMS.sections.map((s) => (
        <section key={s.heading} className="has-mb-8">
          <h2 className="text-2xl tracking-heading has-mb-3">{s.heading}</h2>
          {s.body.map((p) => (
            <p key={p} className="text-md leading-relaxed is-dim has-mb-3">
              {p}
            </p>
          ))}
        </section>
      ))}
    </PageShell>
  );
}
