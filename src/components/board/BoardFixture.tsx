"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { kitColours } from "@/lib/board/kit";
import type { Action } from "@/lib/board/reducer";
import { exampleBoard } from "@/lib/board/start";
import type { BoardData } from "@/lib/board/types";
import { BoardProvider, useBoard } from "./BoardProvider";

/** The made-up example team with ids that are the same on every run, so stories and tests can name players. */
export function fixtureBoard(edit?: (d: BoardData) => void): BoardData {
  let n = 0;
  const d = exampleBoard(() => `p${++n}`);
  edit?.(d);
  return d;
}

/** Plays these actions once, as the coach would, before the story is looked at. */
function Setup({ actions }: { readonly actions: readonly Action[] }) {
  const { act } = useBoard();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    for (const a of actions) act(a);
  }, [act, actions]);
  return null;
}

interface BoardFixtureProps {
  readonly data: BoardData;
  readonly setup?: readonly Action[];
  readonly children: ReactNode;
}

/** A board in memory, in the club colour, for Storybook. Nothing is saved. */
export function BoardFixture({ data, setup = [], children }: BoardFixtureProps) {
  return (
    <BoardProvider sandbox={{ data, notice: "" }}>
      <Setup actions={setup} />
      <div className="board container-sm" style={kitColours(data.colour)}>
        {children}
      </div>
    </BoardProvider>
  );
}
