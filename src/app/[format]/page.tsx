import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/landing/PageShell";
import { FORMAT_PAGE, FORMAT_PAGES } from "@/constants/content/formats";
import { AGE_GROUPS, FORMATS } from "@/constants/football";
import { boardOnFormat, formatPagePath } from "@/constants/routes";
import { PAGE_UPDATED } from "@/constants/seo";
import { formatPageJsonLd, longDate, pageMetadata } from "@/lib/seo";

interface FormatPageProps {
  readonly params: Promise<{ readonly format: string }>;
}

// Only the format pages exist. Any other address here is a real 404, not a cached empty page.
export const dynamicParams = false;

export function generateStaticParams() {
  return FORMAT_PAGES.map((f) => ({ format: f.slug }));
}

export async function generateMetadata({ params }: FormatPageProps): Promise<Metadata> {
  const { format } = await params;
  const page = FORMAT_PAGES.find((f) => f.slug === format);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.description, path: formatPagePath(page.slug) });
}

/** One format: what it is, the questions coaches ask about it, who plays it, its shapes, and the board opened on it. */
export default async function FormatPage({ params }: FormatPageProps) {
  const { format } = await params;
  const page = FORMAT_PAGES.find((f) => f.slug === format);
  if (!page) notFound();
  const ages = AGE_GROUPS.filter((a) => a.format === page.format).map((a) => a.label);
  const others = FORMAT_PAGES.filter((f) => f.slug !== page.slug);

  return (
    <PageShell>
      <JsonLd data={formatPageJsonLd(page)} />
      <h1 className="text-5xl tracking-heading has-mb-3">{page.heading}</h1>
      <p className="text-sm is-dimmer has-mb-6">{FORMAT_PAGE.updated(longDate(PAGE_UPDATED.formats))}</p>
      {page.intro.map((p) => (
        <p key={p} className="text-lg leading-relaxed is-dim has-mb-4">
          {p}
        </p>
      ))}
      <Link href={boardOnFormat(page.format)} className="button button--primary is-inline-flex is-align-center has-py-4 has-px-6 text-lg has-radius-field has-font-bold has-mt-3 has-mb-8">
        {page.cta}
      </Link>

      {page.questions.map((item) => (
        <section key={item.q} className="has-mb-7">
          <h2 className="text-2xl tracking-heading has-mb-3">{item.q}</h2>
          {item.a.map((p) => (
            <p key={p} className="text-md leading-relaxed is-dim has-mb-3">
              {p}
            </p>
          ))}
        </section>
      ))}
      <section className="has-mb-7">
        <h2 className="text-2xl tracking-heading has-mb-3">{FORMAT_PAGE.agesHeading}</h2>
        <p className="text-md is-dim">{FORMAT_PAGE.ages(ages)}</p>
      </section>
      <section className="has-mb-7">
        <h2 className="text-2xl tracking-heading has-mb-3">{FORMAT_PAGE.shapesHeading}</h2>
        <ul className="format-shapes is-grid is-align-center has-gap-3">
          {FORMATS[page.format].shapes.map((s) => (
            <li key={s}>
              <span className="format-shape text-center has-font-headline has-font-bold text-xl tracking-tag has-radius-field has-py-2 has-px-4">{s}</span>
              <span className="text-md is-dim leading-snug">{page.shapeNotes[s]}</span>
            </li>
          ))}
        </ul>
      </section>
      <nav aria-label={FORMAT_PAGE.others} className="is-flex is-flex-wrap has-gap-5">
        {others.map((f) => (
          <Link key={f.slug} href={formatPagePath(f.slug)} className="hit-area is-kit has-font-semibold text-md">
            {f.title}
          </Link>
        ))}
      </nav>
    </PageShell>
  );
}
