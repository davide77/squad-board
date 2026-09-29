import Link from "next/link";
import { PRIVATE_MORE, PRIVATE_ROWS } from "@/constants/content/landing";
import { FOOTER_LINKS, MAKER } from "@/constants/content/pages";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { VoiceCta, VoiceText } from "./VoiceText";

export function PrivateSection() {
  return (
    <section id="private" className="landing-section">
      <div className="container landing-split is-grid has-gap-8 landing-section__pad">
        <h2 className="landing-display landing-display--section">
          <VoiceText k="privH" />
        </h2>
        <div>
          <ul className="landing-rows is-flex is-flex-column">
            {PRIVATE_ROWS.map((r) => (
              <li key={r.title} className="is-flex is-flex-column has-gap-1 has-py-4">
                <span className="has-font-semibold text-lg">{r.title}</span>
                <span className="text-md is-dim">{r.body}</span>
              </li>
            ))}
          </ul>
          <Link href={ROUTES.privacy} className="hit-area is-inline-block has-mt-4 text-md has-font-semibold is-kit">
            {PRIVATE_MORE}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EndSection() {
  return (
    <section className="landing-section">
      <div className="container is-flex is-flex-column is-align-start has-gap-7 landing-section__pad landing-section__pad--end">
        <h2 className="landing-display landing-display--end">
          <VoiceText k="endH" />
        </h2>
        <VoiceCta size="large" />
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="landing-section">
      <div className="container is-flex is-flex-wrap is-justify-between has-gap-3 has-py-6 text-sm is-dimmer">
        <span>{SITE.name}</span>
        <nav aria-label={FOOTER_LINKS.label} className="is-flex is-flex-wrap has-gap-6">
          <Link href={ROUTES.privacy} className="hit-area">
            {FOOTER_LINKS.privacy}
          </Link>
          <Link href={ROUTES.credits} className="hit-area">
            {FOOTER_LINKS.credits}
          </Link>
        </nav>
        <p>
          {FOOTER_LINKS.madeBy} {MAKER.name} {FOOTER_LINKS.at}{" "}
          <a href={MAKER.url} className="hit-area is-dim has-font-semibold">
            {MAKER.studio}
          </a>
        </p>
      </div>
    </footer>
  );
}
