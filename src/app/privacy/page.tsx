import type { Metadata } from "next";
import { PageShell } from "@/components/landing/PageShell";
import { MAKER, PRIVACY } from "@/constants/content/pages";
import { ROUTES } from "@/constants/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: PRIVACY.title,
  description: PRIVACY.description,
  path: ROUTES.privacy,
});

export default function PrivacyPage() {
  return (
    <PageShell>
      <h1 className="text-5xl tracking-heading has-mb-3">{PRIVACY.title}</h1>
      <p className="text-sm is-dimmer has-mb-6">{PRIVACY.updated}</p>
      <p className="text-lg leading-relaxed has-mb-8">{PRIVACY.intro}</p>
      {PRIVACY.sections.map((s) => (
        <section key={s.heading} className="has-mb-8">
          <h2 className="text-2xl tracking-heading has-mb-3">{s.heading}</h2>
          {s.body.map((p) => (
            <p key={p} className="text-md leading-relaxed is-dim has-mb-3">
              {p}
            </p>
          ))}
        </section>
      ))}
      <section>
        <h2 className="text-2xl tracking-heading has-mb-3">{PRIVACY.contactHeading}</h2>
        <p className="text-md leading-relaxed is-dim">
          {PRIVACY.contact}{" "}
          <a href={MAKER.url} className="is-kit has-font-semibold">
            {MAKER.site}
          </a>
          .
        </p>
      </section>
    </PageShell>
  );
}
