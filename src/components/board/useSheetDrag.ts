"use client";

import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useDragControls, type PanInfo } from "framer-motion";
import { MOTION } from "@/constants/motion";
import { project } from "@/lib/motion";

/** The edge a sheet comes in from: the foot of the screen, or the right for a drawer. */
type Edge = "bottom" | "right";

// A drawer is mostly fields. A finger on one is choosing it, not pulling the drawer.
const NOT_A_PULL = "input, textarea, select, [contenteditable='true']";

/**
 * A sheet that comes in from an edge, leaves by the same one, and can be pulled back off it. The pull follows
 * the finger, gives a little against the edge, and on release goes where the throw was heading: past a third
 * of the sheet, it closes at the finger's speed; short of that, it springs home.
 *
 * Spread `motion` on the sheet's motion.div, whose ref is `ref` (it measures the sheet). A bottom sheet starts the pull from its grabber (`grab`); a drawer
 * from anywhere a finger lands that is not a field (`swipe`). A mouse closes either from its button.
 */
export function useSheetDrag(edge: Edge, onClose: () => void, ref: RefObject<HTMLElement | null>) {
  const controls = useDragControls();
  const vertical = edge === "bottom";
  const off = vertical ? { y: MOTION.sheetOff } : { x: MOTION.sheetOff };
  const home = vertical ? { y: 0 } : { x: 0 };

  function onDragEnd(_: PointerEvent, info: PanInfo) {
    const box = ref.current?.getBoundingClientRect();
    const size = (vertical ? box?.height : box?.width) ?? 0;
    const offset = vertical ? info.offset.y : info.offset.x;
    const velocity = vertical ? info.velocity.y : info.velocity.x;
    if (offset + project(velocity) > size * MOTION.sheetDismiss) onClose();
  }

  function grab(e: ReactPointerEvent) {
    controls.start(e);
  }

  function swipe(e: ReactPointerEvent) {
    if (e.pointerType === "mouse" || (e.target instanceof Element && e.target.closest(NOT_A_PULL))) return;
    controls.start(e);
  }

  return {
    grab,
    swipe,
    motion: {
      initial: off,
      animate: home,
      exit: off,
      transition: MOTION.sheet,
      drag: vertical ? ("y" as const) : ("x" as const),
      dragControls: controls,
      dragListener: false,
      dragConstraints: vertical ? { top: 0, bottom: 0 } : { left: 0, right: 0 },
      dragElastic: vertical
        ? { top: MOTION.sheetResist, bottom: 1 }
        : { left: MOTION.sheetResist, right: 1 },
      dragTransition: MOTION.sheetReturn,
      onDragEnd,
    },
  };
}
