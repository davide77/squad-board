import { NAV } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { BoardCta } from "./BoardCta";
import { cx } from "./cx";
import { SiteLogo } from "./SiteLogo";
import { TeamDock, TeamRail } from "./TeamRail";

interface SiteHeaderProps {
  /** On the board the header is only the logo, so nothing on it pulls the coach off the board mid-match. */
  readonly onBoard?: boolean;
  /** On the home page the section links jump down the page. Everywhere else they go back to it. */
  readonly onHome?: boolean;
  /** Pinned to the top as the page scrolls. The board turns it off so the pitch keeps the room. */
  readonly sticky?: boolean;
}

/**
 * The floating header on every page: the logo, the way round the home page, and the way to the board.
 * The coach's teams sit in a rail of their own beside it, and fold into the header's far end when the screen is too narrow.
 * On the board the team is already on screen, so neither shows.
 */
export function SiteHeader({ onBoard = false, onHome = false, sticky = true }: SiteHeaderProps) {
  return (
    <>
      <header className={cx("landing-header", !sticky && "landing-header--static")}>
        {/* The board runs wider than the other pages, for its three columns, and the header lines up with it. */}
        <div className={onBoard ? "container-lg" : "container"}>
          <div className="landing-header__bar is-flex is-align-center is-justify-between has-gap-3 has-radius-sheet">
            <SiteLogo label={NAV.home} />
            {!onBoard && (
              <nav aria-label={NAV.label} className="is-flex is-align-center has-gap-5 text-md">
                {/* The jump links wait for room. On a phone the logo is the way home. */}
                <span className="is-hidden is-md-flex is-align-center has-gap-5">
                  {NAV.links.map((l) => (
                    <a key={l.href} href={onHome ? l.href : `${ROUTES.home}${l.href}`} className="hit-area is-dim">
                      {l.label}
                    </a>
                  ))}
                </span>
                <BoardCta className="landing-header__cta has-py-2 has-px-4 text-md" />
                <TeamDock />
              </nav>
            )}
          </div>
        </div>
      </header>
      {!onBoard && <TeamRail />}
    </>
  );
}
