"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { MotionConfig } from "framer-motion";
import { KIT_COLOURS, LOGO } from "@/constants/brand";
import { CLUB } from "@/constants/content/board";
import { SITE } from "@/constants/site";
import { BenchPanel, PoolPanel } from "./Zones";
import { BoardHeader } from "./BoardHeader";
import { BoardProvider, useBoard } from "./BoardProvider";
import { ClubPanel } from "./ClubPanel";
import { Picker } from "./Picker";
import { ShapePanel } from "./ShapePanel";
import { SheetPanel, SavedPanel, SubsPanel } from "./SidePanels";
import { SquadPanel } from "./SquadPanel";
import { Toast } from "./Toast";
import { useBoardDrag } from "./useBoardDrag";

function Board() {
  const { state } = useBoard();
  const rootRef = useRef<HTMLDivElement>(null);
  const { onPointerDown, onClickCapture } = useBoardDrag(rootRef);
  const kit = KIT_COLOURS[state.data.colour] ?? KIT_COLOURS[0];
  // The club colour the coach picked, read by every kit token in the SCSS.
  const colours = { "--kit": kit.kit, "--kit-ink": kit.ink, "--kit-edge": kit.edge } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className="board container has-pt-4 has-pb-11"
      style={colours}
      onPointerDown={onPointerDown}
      onClickCapture={onClickCapture}
    >
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

export function SquadBoard() {
  return (
    <MotionConfig reducedMotion="user">
      <BoardProvider>
        <Board />
      </BoardProvider>
    </MotionConfig>
  );
}
