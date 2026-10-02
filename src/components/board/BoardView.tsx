"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { BoardStep } from "@/lib/board/types";
import { cx } from "../cx";
import Image from "next/image";
import { VISOR_MARK } from "@/constants/brand";
import { CLUB } from "@/constants/content/board";
import { SITE } from "@/constants/site";
import { BOARD_CONFIG } from "@/constants/config";
import { kitColours } from "@/lib/board/kit";
import { useStickyTop } from "@/lib/hooks";
import { BoardHeader } from "./BoardHeader";
import { useBoard } from "./BoardProvider";
import { ClubButton } from "./ClubButton";
import { ClubSheet } from "./ClubSheet";
import { ExampleBanner } from "./ExampleBanner";
import { KeepSafe } from "./KeepSafe";
import { GafferLine } from "./GafferLine";
import { Picker } from "./Picker";
import { PlayerDrawer } from "./PlayerDrawer";
import { UndoBar } from "./UndoBar";
import { ShapePanel } from "./ShapePanel";
import { FullActions, FullKinds, FullPreview } from "./Full";
import { CallUpSheet } from "./CallUpSheet";
import { NewMatchday, PickBar } from "./PickActions";
import { BenchTray, ChangeBar, MatchBench, MatchClockCard, MatchLog } from "./Matchday";
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
 * right what comes next. A phone stacks them with the centre first. Pick the team has no right
 * column: its way on is the bar along the foot, and the call-up is a sheet.
 */
const STEP_COLUMNS: Readonly<Record<BoardStep, StepColumns>> = {
  pick: {
    left: <SquadPanel />,
    // Only the pitch, so it fits the screen and stays pinned. The bench and the rest of the squad are
    // groups in the squad list, which take a player dragged off the pitch.
    centre: <ShapePanel />,
  },
  match: {
    left: <MatchBench />,
    centre: (
      <>
        <MatchClockCard />
        <Pitch />
        <ChangeBar />
        <BenchTray />
      </>
    ),
    right: <MatchLog />,
  },
  full: {
    left: <FullKinds />,
    centre: <FullPreview />,
    right: (
      <>
        <FullActions />
        <NewMatchday />
      </>
    ),
  },
};

/** A loaded board, for whichever BoardProvider it sits in. */
export function BoardView({ top }: BoardViewProps) {
  const { state, sandbox } = useBoard();
  const rootRef = useRef<HTMLDivElement>(null);
  const { onPointerDown, onClickCapture } = useBoardDrag(rootRef);
  const { step } = state.ui;
  const columns = STEP_COLUMNS[step];
  // The pitch column pins while the lists beside it scroll with the page, clear of the bar along the foot.
  const centreRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  useStickyTop(centreRef, barRef, BOARD_CONFIG.stickyGapPx, step);

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
        className={cx("board-step", `board-step--${step}`, !columns.left && "board-step--no-left", !columns.right && "board-step--no-right")}
      >
        {columns.left && <div className="board-step__left">{columns.left}</div>}
        <div ref={centreRef} className="board-step__centre">
          {/* On Pick the team the Gaffer speaks from the bar along the foot, beside the buttons. */}
          {step !== "pick" && <GafferLine />}
          {columns.centre}
        </div>
        {columns.right && <div className="board-step__right">{columns.right}</div>}
      </div>
      {/* Pinned along the foot while the coach picks: where the team stands, and the two ways on. */}
      {step === "pick" && <PickBar ref={barRef} />}
      <footer className="board__foot is-flex is-flex-wrap is-align-center is-justify-between has-gap-3 has-mt-7 has-pt-4 text-sm is-dim">
        <span className="is-inline-flex is-align-center has-gap-2 is-chalk text-md has-font-headline has-font-bold tracking-number">
          <Image src={VISOR_MARK.src} alt="" width={VISOR_MARK.footerSize} height={VISOR_MARK.footerSize} />
          <span translate="no">{SITE.name}</span>
        </span>
        <span>{state.ui.storageOK ? CLUB.stored : CLUB.noStorage}</span>
      </footer>
      {!sandbox && <ClubButton />}
      <Picker />
      <ClubSheet />
      <CallUpSheet />
      <PlayerDrawer />
      <UndoBar />
      <Toast />
    </div>
  );
}
