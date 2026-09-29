"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { STORAGE_KEY } from "@/constants/config";
import { NAV } from "@/constants/content/landing";
import { ROUTES } from "@/constants/routes";
import { kitColours } from "@/lib/board/kit";
import { useStoredBoard } from "@/lib/hooks";
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
}

function TeamMagnet({ team, index }: TeamMagnetProps) {
  return (
    <Link
      href={ROUTES.board}
      aria-label={NAV.team.aria(team.name)}
      title={team.name}
      className="team-magnet is-flex is-align-center is-justify-center is-shrink-0 has-radius-pill"
      style={{ ...kitColours(team.colour), "--i": index } as CSSProperties}
    >
      <Crest team={team.team} badge={team.badge} />
    </Link>
  );
}

/** Fixed at the top left, clear of the header, one crest under another. Only where the page leaves room beside it. */
export function TeamRail() {
  const teams = useTeams();
  if (!teams.length) return null;
  return (
    <nav aria-label={NAV.team.label} className="team-rail is-flex-column has-gap-3">
      {teams.map((t, i) => (
        <TeamMagnet key={t.key} team={t} index={i} />
      ))}
    </nav>
  );
}

/** The same crests in the header, for screens too narrow for the rail. */
export function TeamDock() {
  const teams = useTeams();
  if (!teams.length) return null;
  return (
    <span className="team-dock is-align-center has-gap-2">
      {teams.map((t, i) => (
        <TeamMagnet key={t.key} team={t} index={i} />
      ))}
    </span>
  );
}
