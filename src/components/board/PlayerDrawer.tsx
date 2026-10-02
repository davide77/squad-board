"use client";

import { useCallback, useId, useRef, useState, type FocusEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BOARD_CONFIG } from "@/constants/config";
import { DRAWER, GLYPHS, NO_NUMBER, SQUAD } from "@/constants/content/board";
import { POSITIONS, SIDED_CODES } from "@/constants/football";
import { MOTION } from "@/constants/motion";
import { firstName } from "@/lib/board/names";
import { byId, phaseOf, positionCodes } from "@/lib/board/queries";
import type { Availability, Player } from "@/lib/board/types";
import { useEscapeKey, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { Button } from "../Button";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { ConfirmBox } from "./ConfirmBox";

const LABEL = "is-block has-font-headline text-xs tracking-caps uppercase is-dim has-mb-1";
const HEADING = "has-font-headline has-font-bold text-lg";

/** This week, as the drawer shows it: one of the four. */
function availability(p: Player): Availability {
  return p.inj ? "inj" : p.una ? "una" : p.trn ? "trn" : "available";
}

interface DrawerBodyProps {
  readonly p: Player;
  readonly titleId: string;
  readonly close: () => void;
}

function DrawerBody({ p, titleId, close }: DrawerBodyProps) {
  const { state, act } = useBoard();
  const { data } = state;
  const numId = useId();
  const nameId = useId();
  const labelId = useId();
  const [confirming, setConfirming] = useState(false);
  // Missing training is a competitive side's reason to leave someone out, so younger sides do not see it.
  const competitive = phaseOf(data) === "competitive";
  const statuses = DRAWER.statuses.filter((s) => s.key !== "trn" || competitive || p.trn);
  const week = availability(p);
  const clash = p.num ? data.players.filter((x) => x.id !== p.id && x.num === p.num) : [];
  const sided = p.pos.some((k) => SIDED_CODES[k]);

  // Saved on blur, so a half typed or empty name never reaches the board.
  function commitName(e: FocusEvent<HTMLInputElement>) {
    if (e.currentTarget.value.trim()) act({ type: "setName", id: p.id, value: e.currentTarget.value });
    else e.currentTarget.value = p.name;
  }

  return (
    <>
      <div className="is-flex is-align-center is-justify-between has-gap-3">
        <h2 id={titleId} className="text-3xl is-truncate">
          {p.name.trim() || DRAWER.newPlayer}
        </h2>
        <button type="button" className="drawer__close is-flex is-align-center is-justify-center text-2xl has-radius-field" aria-label={DRAWER.close} onClick={close}>
          {GLYPHS.close}
        </button>
      </div>

      <div className="drawer__ident is-grid has-gap-3">
        <div>
          <label htmlFor={numId} className={LABEL}>
            {SQUAD.numberLabel}
          </label>
          <input
            id={numId}
            className={cx("field is-w-full has-font-headline has-font-bold text-2xl text-center is-tabular has-radius-field has-py-3", clash.length > 0 && "field--clash")}
            value={p.num}
            placeholder={NO_NUMBER}
            inputMode="numeric"
            autoComplete="off"
            maxLength={BOARD_CONFIG.shirtNumberMaxLength}
            aria-describedby={clash.length ? `${numId}-clash` : undefined}
            onChange={(e) => act({ type: "setNumber", id: p.id, value: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor={nameId} className={LABEL}>
            {SQUAD.nameLabel}
          </label>
          <input
            key={p.name}
            id={nameId}
            className="field is-w-full text-lg has-radius-field has-py-3 has-px-3"
            defaultValue={p.name}
            autoComplete="off"
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </div>
      </div>
      {clash.length > 0 && (
        <p id={`${numId}-clash`} className="text-base is-out">
          {DRAWER.numberClash(p.num, clash.map((x) => x.name).join(", "))}
        </p>
      )}

      <section className="is-flex is-flex-column has-gap-3">
        <div>
          <h3 className={HEADING}>{DRAWER.positionsHeading}</h3>
          <p className="text-base is-dim">{DRAWER.positionsHint}</p>
        </div>
        <div className="drawer__positions is-grid has-gap-2">
          {POSITIONS.map((o) => {
            const on = p.pos.includes(o.key);
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={on}
                className="drawer-option drawer-option--position is-grid is-align-center has-gap-2 has-px-3 has-radius-field text-left"
                onClick={() => act({ type: "togglePos", pos: o.key })}
              >
                <span className="has-font-headline has-font-bold text-xl">{o.key}</span>
                <span className="text-sm leading-snug">{o.label}</span>
                {p.pos[0] === o.key && <span className="has-font-headline has-font-bold text-xs tracking-caps uppercase">{DRAWER.main}</span>}
              </button>
            );
          })}
        </div>
        {sided && (
          <div className="is-flex is-flex-column has-gap-2">
            <p id={`${labelId}-side`} className="text-base is-dim">
              {DRAWER.sideHint}
            </p>
            <div role="group" aria-labelledby={`${labelId}-side`} className="is-flex has-gap-2">
              {SQUAD.sides.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={p.side === o.key}
                  className="choice is-flex-1 has-radius-field has-font-semibold text-md"
                  onClick={() => act({ type: "setSide", side: o.key })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="text-base is-dim">
          {DRAWER.listedAs}{" "}
          <strong className="has-font-headline text-lg tracking-tag is-chalk">
            {p.pos.length ? positionCodes(p).join(" · ") : SQUAD.noPosition}
          </strong>
        </p>
        <div>
          <label htmlFor={labelId} className="is-block text-sm is-dim has-mb-1">
            {SQUAD.shirtLabelHint}
          </label>
          <input
            id={labelId}
            className="field drawer__shirt-label has-radius-field has-py-2 has-px-3"
            value={p.init}
            placeholder={SQUAD.shirtLabelPlaceholder}
            maxLength={BOARD_CONFIG.shirtLabelMaxLength}
            onChange={(e) => act({ type: "setShirtLabel", id: p.id, value: e.target.value })}
          />
        </div>
      </section>

      <section className="drawer__section is-flex is-flex-column has-gap-3 has-pt-5">
        <h3 id={`${labelId}-week`} className={HEADING}>
          {DRAWER.weekHeading}
        </h3>
        <div role="radiogroup" aria-labelledby={`${labelId}-week`} className="drawer__positions is-grid has-gap-2">
          {statuses.map((s) => (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={week === s.key}
              // Injured keeps the Out accent; the rest choose quietly, so yellow is kept for positions.
              className={cx("has-radius-field has-font-semibold text-md", s.key === "inj" ? "drawer-option drawer-option--out" : "choice")}
              onClick={() => act({ type: "setAvailability", id: p.id, status: s.key })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <div className="drawer__section drawer__foot is-flex is-flex-column has-gap-2 has-pt-5">
        <Button variant="primary" className="has-py-4 text-lg" onClick={close}>
          {DRAWER.done}
        </Button>
        {confirming ? (
          <ConfirmBox
            text={DRAWER.removeText(firstName(p.name))}
            yes={DRAWER.removeConfirm}
            keep={DRAWER.keep}
            onYes={() => act({ type: "removePlayer", id: p.id })}
            onKeep={() => setConfirming(false)}
          />
        ) : (
          <Button variant="out" className="has-py-3" onClick={() => setConfirming(true)}>
            {DRAWER.remove}
          </Button>
        )}
      </div>
    </>
  );
}

/** Edits one player: number, name, positions and side, and this week. Slides in from the right edge. */
export function PlayerDrawer() {
  const { state, act } = useBoard();
  const p = byId(state.data, state.ui.editing);
  const open = !!p;
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useCallback(() => act({ type: "editDone" }), [act]);

  useEscapeKey(open, close);
  useScrollLock(open);
  useFocusTrap(open, panelRef);

  return (
    <AnimatePresence>
      {p && (
        <motion.div
          className="drawer is-flex is-justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION.fade}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="drawer__panel is-flex is-flex-column has-gap-6 is-w-full has-p-5"
            initial={{ x: MOTION.drawerX }}
            animate={{ x: 0 }}
            exit={{ x: MOTION.drawerX }}
            transition={MOTION.sheet}
          >
            <DrawerBody key={p.id} p={p} titleId={titleId} close={close} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
