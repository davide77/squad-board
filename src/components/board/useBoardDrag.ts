"use client";

import { useEffect, useEffectEvent, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { animate } from "framer-motion";
import { NO_NUMBER } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { CUSTOM_BOUNDS, CUSTOM_FORMATION } from "@/constants/football";
import { MOTION } from "@/constants/motion";
import { byId } from "@/lib/board/queries";
import type { DropTarget } from "@/lib/board/types";
import { prefersReducedMotion } from "@/lib/hooks";
import { velocityOf } from "@/lib/motion";
import { useBoard } from "./BoardProvider";

interface Sample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

interface PlayerSession {
  kind: "player";
  pid: string;
  pointerId: number;
  x0: number;
  y0: number;
  /** Where the press landed from the centre of what was pressed, so the dragged copy stays under that point. */
  grabX: number;
  grabY: number;
  /** The dragged copy's centre, now. */
  x: number;
  y: number;
  /** The last few pointer positions, for the finger's speed on release. */
  trail: Sample[];
  moved: boolean;
  ghost: HTMLElement | null;
}

type Session =
  | PlayerSession
  | { kind: "marker"; index: number; pointerId: number }
  | { kind: "row"; id: string; pointerId: number; list: HTMLElement };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function targetFrom(el: Element | null): DropTarget | null {
  const slot = el?.closest<HTMLElement>("[data-slot]");
  if (slot?.dataset.slot) return { kind: "slot", id: slot.dataset.slot };
  const chip = el?.closest<HTMLElement>("[data-chip]");
  if (chip?.dataset.chip) return { kind: "chip", id: chip.dataset.chip };
  const zone = el?.closest<HTMLElement>("[data-zone]")?.dataset.zone;
  if (zone === "bench" || zone === "pool") return { kind: zone };
  return null;
}

/**
 * Pointer dragging for the board: players between the pitch, bench and squad,
 * markers in a custom shape, and the squad list order. A press that never
 * travels is left alone, so the click that follows does the tap.
 */
export function useBoardDrag(rootRef: RefObject<HTMLElement | null>) {
  const { state, act } = useBoard();
  const session = useRef<Session | null>(null);
  const edgeFrame = useRef<number | null>(null);
  const edgeY = useRef(0);
  const swallowClick = useRef(false);

  function stopEdgeScroll() {
    if (edgeFrame.current !== null) cancelAnimationFrame(edgeFrame.current);
    edgeFrame.current = null;
  }

  // Keeps the page moving when a name is dragged to the top or bottom of the screen: once a frame, faster
  // the nearer the finger is to the edge, so the coach steers the speed by how far in they hold it.
  function edgeScroll(y: number) {
    edgeY.current = y;
    if (edgeFrame.current !== null) return;
    // Inside the example sheet the sheet scrolls, not the page.
    const scroller = rootRef.current?.closest<HTMLElement>("[data-scroller]") ?? window;
    const tick = () => {
      const zone = BOARD_CONFIG.edgeScrollZonePx;
      const at = edgeY.current;
      const into = at < zone ? at - zone : at > window.innerHeight - zone ? at - (window.innerHeight - zone) : 0;
      if (!into) {
        edgeFrame.current = null;
        return;
      }
      scroller.scrollBy(0, clamp(into / zone, -1, 1) * BOARD_CONFIG.edgeScrollStepPx);
      edgeFrame.current = requestAnimationFrame(tick);
    };
    edgeFrame.current = requestAnimationFrame(tick);
  }

  function placeGhost(ghost: HTMLElement, x: number, y: number) {
    ghost.style.setProperty("--ghost-x", `${x}px`);
    ghost.style.setProperty("--ghost-y", `${y}px`);
  }

  /**
   * On release the dragged copy flies into the player's place, wherever the drop put them: the new slot, the
   * bench, or back where they started if the drop missed. It sets off at the finger's speed, so letting go
   * has no seam, and the real marker shows again as it lands.
   */
  function land(s: PlayerSession) {
    const ghost = s.ghost;
    if (!ghost) return;
    if (prefersReducedMotion()) return ghost.remove();
    const speed = velocityOf(s.trail);
    // A frame on, the board has drawn the drop.
    requestAnimationFrame(() => {
      const home = rootRef.current?.querySelector<HTMLElement>(`[data-player="${CSS.escape(s.pid)}"]`);
      const box = home?.getBoundingClientRect();
      if (!home || !box?.width) return ghost.remove();
      home.dataset.landing = "";
      ghost.classList.add("chip--landing");
      let settled = 0;
      const settle = () => {
        if (++settled < 2) return;
        ghost.remove();
        delete home.dataset.landing;
      };
      // Across and down on their own springs, so a throw that was mostly sideways stays mostly sideways.
      let x = s.x;
      let y = s.y;
      animate(s.x, box.left + box.width / 2, {
        ...MOTION.ghostLand,
        velocity: speed.x,
        onUpdate: (v) => placeGhost(ghost, (x = v), y),
        onComplete: settle,
      });
      animate(s.y, box.top + box.height / 2, {
        ...MOTION.ghostLand,
        velocity: speed.y,
        onUpdate: (v) => placeGhost(ghost, x, (y = v)),
        onComplete: settle,
      });
    });
  }

  function makeGhost(pid: string): HTMLElement | null {
    const p = byId(state.data, pid);
    const root = rootRef.current;
    if (!p || !root) return null;
    const ghost = document.createElement("div");
    ghost.className = "chip chip--ghost is-flex is-align-center has-gap-2 has-radius-field";
    ghost.setAttribute("aria-hidden", "true");
    const numEl = document.createElement("span");
    numEl.className = "chip__num has-font-headline has-font-bold text-lg is-tabular";
    numEl.textContent = p.num || NO_NUMBER;
    const nameEl = document.createElement("span");
    nameEl.className = "chip__name text-base is-truncate";
    nameEl.textContent = p.name;
    ghost.append(numEl, nameEl);
    root.append(ghost);
    return ghost;
  }

  const onMove = useEffectEvent((e: PointerEvent) => {
    const s = session.current;
    if (!s || e.pointerId !== s.pointerId) return;

    if (s.kind === "row") {
      e.preventDefault();
      edgeScroll(e.clientY);
      const rows = [...s.list.querySelectorAll<HTMLElement>("[data-pid]")].filter((r) => r.dataset.pid !== s.id);
      // Measured where each row is settling, not where its slide has got to, so a row on the move
      // cannot swap the order straight back.
      const before = rows.find((r) => {
        const b = r.getBoundingClientRect();
        const sliding = new DOMMatrixReadOnly(getComputedStyle(r).transform).m42;
        return e.clientY < b.top - sliding + b.height / 2;
      });
      const others = state.data.players.filter((p) => p.id !== s.id);
      // The list is one group of the squad. Past its last row, the row goes just after that one.
      const last = rows.at(-1)?.dataset.pid;
      const to = before
        ? others.findIndex((p) => p.id === before.dataset.pid)
        : last
          ? others.findIndex((p) => p.id === last) + 1
          : -1;
      if (to > -1) act({ type: "reorder", id: s.id, to });
      return;
    }

    if (s.kind === "marker") {
      const pitch = rootRef.current?.querySelector("[data-pitch]")?.getBoundingClientRect();
      if (!pitch?.width || !pitch.height) return;
      e.preventDefault();
      const b = CUSTOM_BOUNDS;
      act({
        type: "moveCustom",
        index: s.index,
        point: {
          x: clamp(((e.clientX - pitch.left) / pitch.width) * 100, b.minX, b.maxX),
          y: clamp(100 - ((e.clientY - pitch.top) / pitch.height) * 100, b.minY, b.maxY),
        },
      });
      return;
    }

    const travelled = Math.hypot(e.clientX - s.x0, e.clientY - s.y0);
    if (!s.moved && travelled < BOARD_CONFIG.dragThresholdPx) return;
    if (!s.moved) {
      s.moved = true;
      s.ghost = makeGhost(s.pid);
    }
    e.preventDefault();
    s.x = e.clientX - s.grabX;
    s.y = e.clientY - s.grabY;
    s.trail.push({ x: s.x, y: s.y, t: e.timeStamp });
    while (s.trail.length > 2 && e.timeStamp - s.trail[0].t > BOARD_CONFIG.velocityWindowMs) s.trail.shift();
    if (s.ghost) placeGhost(s.ghost, s.x, s.y);
    act({ type: "dragOver", target: targetFrom(document.elementFromPoint(e.clientX, e.clientY)) });
  });

  const onUp = useEffectEvent((e: PointerEvent) => {
    const s = session.current;
    if (!s || e.pointerId !== s.pointerId) return;
    session.current = null;
    stopEdgeScroll();
    if (s.kind === "row") act({ type: "rowDrag", id: null });
    if (s.kind !== "player" || !s.moved) return;

    // The click that follows a drag is not a tap.
    swallowClick.current = true;
    setTimeout(() => (swallowClick.current = false), 0);
    const target = targetFrom(document.elementFromPoint(e.clientX, e.clientY));
    act(target ? { type: "drop", pid: s.pid, target } : { type: "dragOver", target: null });
    land(s);
  });

  const onCancel = useEffectEvent(() => {
    const s = session.current;
    session.current = null;
    stopEdgeScroll();
    if (s?.kind === "player") s.ghost?.remove();
    act({ type: "dragOver", target: null });
    act({ type: "rowDrag", id: null });
  });

  useEffect(() => {
    const move = (e: PointerEvent) => onMove(e);
    const up = (e: PointerEvent) => onUp(e);
    const cancel = () => onCancel();
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      stopEdgeScroll();
    };
  }, []);

  function onPointerDown(e: ReactPointerEvent) {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    const t = e.target;

    const grip = t.closest<HTMLElement>("[data-grip]");
    const list = grip?.closest<HTMLElement>("[data-roster]");
    if (grip?.dataset.grip && list) {
      e.preventDefault();
      // An open editor sits between the rows, so it closes as the drag starts.
      act({ type: "rowDrag", id: grip.dataset.grip });
      session.current = { kind: "row", id: grip.dataset.grip, pointerId: e.pointerId, list };
      return;
    }

    const slot = t.closest<HTMLElement>("[data-slot]");
    if (state.ui.posMode && state.data.formation === CUSTOM_FORMATION && slot?.dataset.slot) {
      const index = Number(slot.dataset.slot.split("#")[1]);
      session.current = { kind: "marker", index, pointerId: e.pointerId };
      return;
    }

    const holder = t.closest<HTMLElement>("[data-player]");
    if (holder?.dataset.player) {
      const box = holder.getBoundingClientRect();
      const grabX = e.clientX - (box.left + box.width / 2);
      const grabY = e.clientY - (box.top + box.height / 2);
      session.current = {
        kind: "player",
        pid: holder.dataset.player,
        pointerId: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        grabX,
        grabY,
        x: e.clientX - grabX,
        y: e.clientY - grabY,
        trail: [],
        moved: false,
        ghost: null,
      };
    }
  }

  function onClickCapture(e: { stopPropagation: () => void; preventDefault: () => void }) {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    e.stopPropagation();
    e.preventDefault();
  }

  return { onPointerDown, onClickCapture };
}
