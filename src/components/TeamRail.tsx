"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { STORAGE_KEY } from "@/constants/config";
import { NAV } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { kitColours } from "@/lib/board/kit";
import { useStoredBoard } from "@/lib/hooks";
import { cx } from "./cx";
import { Crest } from "./board/Crest";

interface Team {
  readonly key: string;
  readonly name: string;
  readonly team: string;
  readonly badge: string;
  readonly colour: number;
}

/** The coach's own teams in this browser. Never the example team. */
function useTeams(): readonly Team[] {
  const board = useStoredBoard();
  if (!board || board.example) return [];
  // One board per browser today. Everything below takes a list, so a second team is one more entry.
  return [
    { key: STORAGE_KEY, name: board.team.trim() || NAV.team.fallback, team: board.team, badge: board.badge, colour: board.colour },
  ];
}

interface TeamMagnetProps {
  readonly team: Team;
  readonly index: number;
  /** In the rail the name sits under the crest. In the header it sits beside it, under "Your team". */
  readonly layout: "rail" | "dock";
  /** Only one team in the header gets words beside it. With more, the crests speak for themselves. */
  readonly labelled?: boolean;
}

function TeamMagnet({ team, index, layout, labelled = false }: TeamMagnetProps) {
  return (
    <Link
      href={ROUTES.board}
      aria-label={NAV.team.aria(team.name)}
      title={NAV.team.aria(team.name)}
      className={cx(
        "team-magnet is-flex is-align-center is-min-w-0",
        layout === "rail" ? "is-flex-column has-gap-1" : "has-gap-2",
      )}
      style={{ ...kitColours(team.colour), "--i": index } as CSSProperties}
    >
      <span className="team-magnet__puck is-flex is-align-center is-justify-center is-shrink-0 has-radius-pill">
        <Crest team={team.team} badge={team.badge} />
      </span>
      {layout === "rail" ? (
        <span className="team-magnet__name is-block is-chalk has-font-headline has-font-semibold text-xs leading-tight text-center is-truncate">
          {team.name}
        </span>
      ) : (
        labelled && (
          <span className="is-flex is-flex-column is-min-w-0 has-font-headline leading-tight" aria-hidden="true">
            <span className="is-dim has-font-semibold text-2xs uppercase tracking-caps">{NAV.team.label}</span>
            <span className="team-magnet__name is-chalk has-font-bold text-md tracking-number is-truncate">{team.name}</span>
          </span>
        )
      )}
    </Link>
  );
}

/**
 * Fixed at the top left, clear of the header: "Your team", then each crest with its name under it.
 * Only where the page leaves room beside it.
 */
export function TeamRail() {
  const teams = useTeams();
  if (!teams.length) return null;
  return (
    <nav aria-label={NAV.team.label} className="team-rail is-flex-column is-align-center has-gap-3">
      <p className="is-dim has-font-headline has-font-semibold text-2xs uppercase tracking-caps text-center" aria-hidden="true">
        {teams.length > 1 ? NAV.team.many : NAV.team.label}
      </p>
      {teams.map((t, i) => (
        <TeamMagnet key={t.key} team={t} index={i} layout="rail" />
      ))}
    </nav>
  );
}

/** The same crests at the header's far end, for screens too narrow for the rail. They stand in for the header button. */
export function TeamDock() {
  const teams = useTeams();
  if (!teams.length) return null;
  return (
    <span className="team-dock is-align-center is-min-w-0 has-gap-2">
      {teams.map((t, i) => (
        <TeamMagnet key={t.key} team={t} index={i} layout="dock" labelled={teams.length === 1} />
      ))}
    </span>
  );
}
