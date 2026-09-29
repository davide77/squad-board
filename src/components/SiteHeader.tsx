import type { ReactNode } from "react";
import { NAV } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { cx } from "./cx";
import { SiteLogo } from "./SiteLogo";

interface SiteHeaderProps {
  /** The button on the right, when the page has one. */
  readonly action?: ReactNode;
  /** On the home page the section links jump down the page. Everywhere else they go back to it. */
  readonly onHome?: boolean;
  /** Pinned to the top as the page scrolls. The board turns it off so the pitch keeps the room. */
  readonly sticky?: boolean;
}

/** The floating header on every page: the logo, the way round the home page, and one action. */
export function SiteHeader({ action, onHome = false, sticky = true }: SiteHeaderProps) {
  return (
    <header className={cx("landing-header", !sticky && "landing-header--static")}>
      <div className="container">
        <div className="landing-header__bar is-flex is-align-center is-justify-between has-gap-3 has-radius-sheet">
          <SiteLogo label={NAV.home} />
          <nav aria-label={NAV.label} className="is-flex is-align-center has-gap-5 text-md">
            {/* The jump links wait for room. On a phone the logo is the way home. */}
            <span className="is-hidden is-md-flex is-align-center has-gap-5">
              {NAV.links.map((l) => (
                <a key={l.href} href={onHome ? l.href : `${ROUTES.home}${l.href}`} className="hit-area is-dim">
                  {l.label}
                </a>
              ))}
            </span>
            {action}
          </nav>
        </div>
      </div>
    </header>
  );
}
