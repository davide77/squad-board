"use client";

import { useEffect, useEffectEvent, useRef, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { NO_NUMBER } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { CUSTOM_BOUNDS, CUSTOM_FORMATION } from "@/constants/football";
import { byId } from "@/lib/board/queries";
import type { DropTarget } from "@/lib/board/types";
import { useBoard } from "./BoardProvider";

type Session =
  | { kind: "player"; pid: string; pointerId: number; x0: number; y0: number; moved: boolean; ghost: HTMLElement | null }
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
  const edgeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const swallowClick = useRef(false);

  function stopEdgeScroll() {
    if (edgeTimer.current) clearInterval(edgeTimer.current);
    edgeTimer.current = null;
  }

  // Keeps the page moving when a name is dragged to the top or bottom of the screen.
  function edgeScroll(y: number) {
    stopEdgeScroll();
    const zone = BOARD_CONFIG.edgeScrollZonePx;
    const step = y < zone ? -1 : y > window.innerHeight - zone ? 1 : 0;
    if (!step) return;
    edgeTimer.current = setInterval(
      () => window.scrollBy(0, step * BOARD_CONFIG.edgeScrollStepPx),
      BOARD_CONFIG.edgeScrollIntervalMs,
    );
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
      const before = rows.find((r) => {
        const b = r.getBoundingClientRect();
        return e.clientY < b.top + b.height / 2;
      });
      const others = state.data.players.filter((p) => p.id !== s.id);
      const to = before ? others.findIndex((p) => p.id === before.dataset.pid) : others.length;
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
    s.ghost?.style.setProperty("--ghost-x", `${e.clientX}px`);
    s.ghost?.style.setProperty("--ghost-y", `${e.clientY}px`);
    act({ type: "dragOver", target: targetFrom(document.elementFromPoint(e.clientX, e.clientY)) });
  });

  const onUp = useEffectEvent((e: PointerEvent) => {
    const s = session.current;
    if (!s || e.pointerId !== s.pointerId) return;
    session.current = null;
    stopEdgeScroll();
    if (s.kind === "row") act({ type: "rowDrag", id: null });
    if (s.kind !== "player" || !s.moved) return;

    s.ghost?.remove();
    // The click that follows a drag is not a tap.
    swallowClick.current = true;
    setTimeout(() => (swallowClick.current = false), 0);
    const target = targetFrom(document.elementFromPoint(e.clientX, e.clientY));
    act(target ? { type: "drop", pid: s.pid, target } : { type: "dragOver", target: null });
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
      session.current = {
        kind: "player",
        pid: holder.dataset.player,
        pointerId: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
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
