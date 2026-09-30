"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { BoardStep } from "@/lib/board/types";
import { cx } from "../cx";
import Image from "next/image";
import { LOGO } from "@/constants/brand";
import { CLUB } from "@/constants/content/board";
import { SITE } from "@/constants/site";
import { kitColours } from "@/lib/board/kit";
import { BenchPanel, PoolPanel } from "./Zones";
import { BoardHeader } from "./BoardHeader";
import { useBoard } from "./BoardProvider";
import { ClubPanel } from "./ClubPanel";
import { ExampleBanner } from "./ExampleBanner";
import { KeepSafe } from "./KeepSafe";
import { GafferLine } from "./GafferLine";
import { Picker } from "./Picker";
import { PlayerDrawer } from "./PlayerDrawer";
import { ShapePanel } from "./ShapePanel";
import { MatchDetailsPanel } from "./MatchDetailsPanel";
import { SavedPanel } from "./SavedPanel";
import { FullActions, FullKinds, FullPreview } from "./Full";
import { ParentsMessage } from "./ParentsMessage";
import { PickActions } from "./PickActions";
import { ChangeBar, MatchBench, MatchClockCard, MatchLog } from "./Matchday";
import { Pitch } from "./Pitch";
import { SquadPanel } from "./SquadPanel";
import { STEP_PANEL_ID, stepTabId } from "./StepTabs";
import { Toast } from "./Toast";
import { useBoardDrag } from "./useBoardDrag";

interface BoardViewProps {
  /** Shown above the board in place of the usual banner. The example sheet puts its own bar here. */
  readonly top?: ReactNode;
}

interface StepColumns {
  readonly left?: ReactNode;
  readonly centre: ReactNode;
  readonly right?: ReactNode;
}

/**
 * What each step shows, and where. Left is the list the coach works from, centre the pitch,
 * right what comes next. A phone stacks them with the centre first.
 */
const STEP_COLUMNS: Readonly<Record<BoardStep, StepColumns>> = {
  pick: {
    left: <SquadPanel />,
    centre: (
      <>
        <ShapePanel />
        <BenchPanel />
        <PoolPanel />
      </>
    ),
    right: (
      <>
        <MatchDetailsPanel />
        <ParentsMessage />
        <PickActions />
        <SavedPanel />
        <ClubPanel />
      </>
    ),
  },
  match: {
    left: <MatchBench />,
    centre: (
      <>
        <MatchClockCard />
        <Pitch />
        <ChangeBar />
      </>
    ),
    right: <MatchLog />,
  },
  full: {
    left: <FullKinds />,
    centre: <FullPreview />,
    right: <FullActions />,
  },
};

/** A loaded board, for whichever BoardProvider it sits in. */
export function BoardView({ top }: BoardViewProps) {
  const { state } = useBoard();
  const rootRef = useRef<HTMLDivElement>(null);
  const { onPointerDown, onClickCapture } = useBoardDrag(rootRef);
  const { step } = state.ui;
  const columns = STEP_COLUMNS[step];

  // A new step starts at the top, not wherever the last one was scrolled to. Skipped on the first
  // render, so opening the board never jumps.
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    rootRef.current?.scrollIntoView({ block: "start" });
  }, [step]);

  return (
    <div
      ref={rootRef}
      className="board board--steps container-lg has-pt-4"
      style={kitColours(state.data.colour)}
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
    >
      {top ?? (state.data.example ? <ExampleBanner /> : <KeepSafe />)}
      <BoardHeader />
      <div
        id={STEP_PANEL_ID}
        role="tabpanel"
        aria-labelledby={stepTabId(step)}
        className={cx("board-step", `board-step--${step}`, !columns.left && "board-step--no-left")}
      >
        {columns.left && <div className="board-step__left">{columns.left}</div>}
        <div className="board-step__centre">
          <GafferLine />
          {columns.centre}
        </div>
        {columns.right && <div className="board-step__right">{columns.right}</div>}
      </div>
      <footer className="board__foot is-flex is-flex-wrap is-align-center is-justify-between has-gap-3 has-mt-7 has-pt-4 text-sm is-dimmer">
        <Image
          src={LOGO.src}
          alt={SITE.name}
          width={Math.round((LOGO.width / LOGO.height) * LOGO.footerHeight)}
          height={LOGO.footerHeight}
        />
        <span>{state.ui.storageOK ? CLUB.stored : CLUB.noStorage}</span>
      </footer>
      <Picker />
      <PlayerDrawer />
      <Toast />
    </div>
  );
}
