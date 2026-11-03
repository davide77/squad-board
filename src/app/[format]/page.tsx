import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { FormationDiagram } from "@/components/landing/FormationDiagram";
import { PageShell } from "@/components/landing/PageShell";
import { FA_SOURCES, FORMAT_PAGE, FORMAT_PAGES } from "@/constants/content/formats";
import { AGE_GROUPS, FORMATS } from "@/constants/football";
import { MAKER } from "@/constants/content/pages";
import { GUIDE_SLUGS } from "@/constants/content/guides";
import { ROUTES, boardOnFormat, formatPagePath, guidePath } from "@/constants/routes";
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
      <p className="text-sm is-dimmer has-mb-6">
        {FORMAT_PAGE.updated(longDate(PAGE_UPDATED.formats))} {FORMAT_PAGE.byline}{" "}
        <Link href={ROUTES.credits} className="is-kit has-font-semibold">
          {MAKER.name}
        </Link>
      </p>
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
      {page.rules && (
        <section className="has-mb-7">
          <h2 className="text-2xl tracking-heading has-mb-3">{FORMAT_PAGE.rulesHeading(FORMATS[page.format].label)}</h2>
          <table className="format-rules is-w-full text-md has-mb-3">
            <tbody>
              {page.rules.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="text-left has-font-semibold has-py-2 has-pr-4">
                    {r.label}
                  </th>
                  <td className="is-dim leading-snug has-py-2">{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm is-dimmer has-mb-2">{FORMAT_PAGE.rulesSource}</p>
          <p className="text-sm is-dimmer has-mb-1">{FORMAT_PAGE.rulesLinks}</p>
          <ul className="is-flex is-flex-column has-gap-1">
            {[FA_SOURCES.formats, FA_SOURCES.futureFit].map((l) => (
              <li key={l.url}>
                <a href={l.url} className="hit-area is-kit has-font-semibold text-sm">
                  {l.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="has-mb-7">
        <h2 className="text-2xl tracking-heading has-mb-3">{FORMAT_PAGE.agesHeading}</h2>
        <p className="text-md is-dim has-mb-2">{FORMAT_PAGE.ages(ages)}</p>
        <Link href={guidePath(GUIDE_SLUGS.formatsByAge)} className="hit-area is-kit has-font-semibold text-md">
          {FORMAT_PAGE.agesMore}
        </Link>
      </section>
      <section className="has-mb-7">
        <h2 className="text-2xl tracking-heading has-mb-4">{FORMAT_PAGE.shapesHeading}</h2>
        <ul className="format-shapes is-grid has-gap-6">
          {FORMATS[page.format].shapes.map((s) => (
            <li key={s} className="is-flex is-flex-column has-gap-3">
              <h3 className="has-font-headline has-font-bold text-xl tracking-tag">{FORMAT_PAGE.shapeHeading(s)}</h3>
              <FormationDiagram shape={s} />
              <p className="text-md is-dim leading-snug">{page.shapeNotes[s]}</p>
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
