import Link from "next/link";
import { FORMAT_PAGE } from "@/constants/content/formats";
import { GUIDE_PAGE, type Guide, type GuideTable } from "@/constants/content/guides";
import { MAKER } from "@/constants/content/pages";
import { ROUTES } from "@/constants/routes";
import { PAGE_UPDATED } from "@/constants/seo";
import { guideJsonLd, longDate } from "@/lib/seo";
import { JsonLd } from "../JsonLd";
import { PageShell } from "./PageShell";

interface GuideArticleProps {
  readonly guide: Guide;
}

/** One guide: the answer up top, a section per question, where the rules come from, and the board. */
export function GuideArticle({ guide }: GuideArticleProps) {
  return (
    <PageShell>
      <JsonLd data={guideJsonLd(guide)} />
      <article>
        <h1 className="text-5xl tracking-heading has-mb-3">{guide.heading}</h1>
        <p className="text-sm is-dimmer has-mb-6">
          {FORMAT_PAGE.updated(longDate(PAGE_UPDATED.guides))} {FORMAT_PAGE.byline}{" "}
          <Link href={ROUTES.credits} className="is-kit has-font-semibold">
            {MAKER.name}
          </Link>
        </p>
        {guide.intro.map((p) => (
          <p key={p} className="text-lg leading-relaxed is-dim has-mb-4">
            {p}
          </p>
        ))}
        <Link href={guide.cta.href} className="button button--primary is-inline-flex is-align-center has-py-4 has-px-6 text-lg has-radius-field has-font-bold has-mt-3 has-mb-8">
          {guide.cta.label}
        </Link>

        {guide.sections.map((s) => (
          <section key={s.heading} className="has-mb-7">
            <h2 className="text-2xl tracking-heading has-mb-3">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="text-md leading-relaxed is-dim has-mb-3">
                {p}
              </p>
            ))}
            {s.table && <GuideTableView table={s.table} />}
            {s.example && (
              <pre className="guide-example bg-board-2 has-radius-panel has-p-5 text-md leading-snug">{s.example.join("\n")}</pre>
            )}
          </section>
        ))}

        {guide.sources.length > 0 && (
          <section className="has-mb-7">
            <h2 className="text-2xl tracking-heading has-mb-3">{GUIDE_PAGE.sourcesHeading}</h2>
            <p className="text-md is-dim has-mb-2">{GUIDE_PAGE.sourcesNote}</p>
            <LinkList links={guide.sources} />
          </section>
        )}
      </article>
      <nav aria-label={GUIDE_PAGE.relatedHeading}>
        <h2 className="text-2xl tracking-heading has-mb-3">{GUIDE_PAGE.relatedHeading}</h2>
        <LinkList links={guide.related} />
      </nav>
    </PageShell>
  );
}

function GuideTableView({ table }: { readonly table: GuideTable }) {
  return (
    <table className="format-rules is-w-full text-md has-mb-3">
      <caption className="sr-only">{table.caption}</caption>
      <thead>
        <tr>
          {table.head.map((h) => (
            <th key={h} scope="col" className="text-left has-font-semibold has-py-2 has-pr-4">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row) => (
          <tr key={row.join()}>
            {row.map((cell, i) =>
              i === 0 ? (
                <th key={i} scope="row" className="text-left has-font-semibold has-py-2 has-pr-4">
                  {cell}
                </th>
              ) : (
                <td key={i} className="is-dim leading-snug has-py-2 has-pr-4">
                  {cell}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LinkList({ links }: { readonly links: readonly { readonly name: string; readonly url: string }[] }) {
  return (
    <ul className="is-flex is-flex-column has-gap-1">
      {links.map((l) => (
        <li key={l.url}>
          {l.url.startsWith("/") ? (
            <Link href={l.url} className="hit-area is-kit has-font-semibold text-md">
              {l.name}
            </Link>
          ) : (
            <a href={l.url} className="hit-area is-kit has-font-semibold text-md">
              {l.name}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
