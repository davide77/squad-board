"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { KIT_COLOURS, LOGO } from "@/constants/brand";
import { CLUB } from "@/constants/content/board";
import { SITE } from "@/constants/site";
import { BenchPanel, PoolPanel } from "./Zones";
import { BoardHeader } from "./BoardHeader";
import { useBoard } from "./BoardProvider";
import { ClubPanel } from "./ClubPanel";
import { ExampleBanner } from "./ExampleBanner";
import { KeepSafe } from "./KeepSafe";
import { Picker } from "./Picker";
import { ShapePanel } from "./ShapePanel";
import { SheetPanel, SavedPanel, SubsPanel } from "./SidePanels";
import { SquadPanel } from "./SquadPanel";
import { Toast } from "./Toast";
import { useBoardDrag } from "./useBoardDrag";

/** The club colour the coach picked, read by every kit token in the SCSS. */
export function kitColours(index: number) {
  const kit = KIT_COLOURS[index] ?? KIT_COLOURS[0];
  return { "--kit": kit.kit, "--kit-ink": kit.ink, "--kit-edge": kit.edge } as CSSProperties;
}

interface BoardViewProps {
  /** Shown above the board in place of the usual banner. The example sheet puts its own bar here. */
  readonly top?: ReactNode;
}

/** A loaded board, for whichever BoardProvider it sits in. */
export function BoardView({ top }: BoardViewProps) {
  const { state } = useBoard();
  const rootRef = useRef<HTMLDivElement>(null);
  const { onPointerDown, onClickCapture } = useBoardDrag(rootRef);

  return (
    <div
      ref={rootRef}
      className="board container has-pt-4 has-pb-11"
      style={kitColours(state.data.colour)}
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
    >
      {top ?? (state.data.example ? <ExampleBanner /> : <KeepSafe />)}
      <BoardHeader />
      <div className="board__cols is-grid has-gap-5">
        <div>
          <ShapePanel />
          <BenchPanel />
          <PoolPanel />
        </div>
        <div>
          <SquadPanel />
          <SubsPanel />
          <SavedPanel />
          <SheetPanel />
        </div>
      </div>
      <ClubPanel />
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
      <Toast />
    </div>
  );
}
