"use client";

import { useCallback, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GLYPHS, NO_NUMBER, PICKER } from "@/constants/content/board";
import { MOTION } from "@/constants/motion";
import { useEscapeKey, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { firstName } from "@/lib/board/names";
import { blocked, byId, freeAt, onBench, slotById, slotOf } from "@/lib/board/queries";
import type { Player } from "@/lib/board/types";
import { Button } from "../Button";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";

interface OptionProps {
  readonly player: Player;
  readonly disabled?: boolean;
}

function Option({ player: p, disabled = false }: OptionProps) {
  const { state, act } = useBoard();
  const badge = disabled ? null : onBench(state.data, p.id) ? PICKER.badgeBench : slotOf(state.data, p.id) ? PICKER.badgeOn : null;
  return (
    <button
      type="button"
      className="picker-option is-flex is-align-center has-gap-3 is-w-full text-left has-py-2 has-px-1 has-radius-sm"
      disabled={disabled}
      onClick={() => act({ type: "pickerPick", pid: p.id })}
    >
      <span className="picker-option__num has-font-headline has-font-bold text-lg text-center is-dim is-tabular">
        {p.num || NO_NUMBER}
      </span>
      <span className="is-flex-1 is-min-w-0 is-truncate">{p.name}</span>
      <span className="has-font-headline text-xs tracking-tag is-dimmer">{p.pos.join(" ")}</span>
      {badge && (
        <span className="picker-option__badge has-font-headline text-xs tracking-heading is-kit has-radius-pill has-px-2">
          {badge}
        </span>
      )}
    </button>
  );
}

interface GroupProps {
  readonly title: string;
  readonly players: readonly Player[];
  readonly disabled?: boolean;
}

function Group({ title, players, disabled }: GroupProps) {
  if (!players.length) return null;
  return (
    <div role="group" aria-label={title}>
      <div className="picker-group has-font-headline text-sm tracking-group is-kit has-pt-3 has-pb-1">{title}</div>
      {players.map((p) => (
        <Option key={p.id} player={p} disabled={disabled} />
      ))}
    </div>
  );
}

function PickerBody({ slotId, titleId }: { readonly slotId: string; readonly titleId: string }) {
  const { state, act } = useBoard();
  const { data } = state;
  const slot = slotById(data, slotId);
  if (!slot) return null;
  const current = byId(data, data.xi[slotId]);
  const except = current?.id ?? null;

  const groups = [
    { title: PICKER.suited(slot.role), players: freeAt(data, slot.role, 2, except) },
    { title: PICKER.canCover(slot.role), players: freeAt(data, slot.role, 1, except) },
    { title: PICKER.outOfPosition, players: freeAt(data, slot.role, 0, except) },
    { title: PICKER.elsewhere, players: data.players.filter((p) => p.id !== except && slotOf(data, p.id)) },
  ];
  const greyed = [
    { title: PICKER.notCalledUp, players: data.players.filter((p) => p.out && !blocked(p)) },
    { title: PICKER.injured, players: data.players.filter((p) => p.inj) },
    { title: PICKER.unavailable, players: data.players.filter((p) => p.una) },
  ];
  const nobody = [...groups, ...greyed].every((g) => !g.players.length);

  return (
    <>
      <div className="is-flex is-align-start has-gap-3 has-mb-3">
        <div className="is-flex-1">
          <h3 id={titleId} className="text-2xl">
            {PICKER.title(slot.role, current?.name ?? null)}
          </h3>
          <p className="text-sm is-dim has-mt-1">
            {current ? PICKER.subFilled(firstName(current.name)) : PICKER.subEmpty}
          </p>
        </div>
        <button type="button" className="picker__close text-2xl is-dim" aria-label={PICKER.close} onClick={() => act({ type: "closePicker" })}>
          {GLYPHS.close}
        </button>
      </div>
      <div className="picker__list">
        {groups.map((g) => (
          <Group key={g.title} title={g.title} players={g.players} />
        ))}
        {greyed.map((g) => (
          <Group key={g.title} title={g.title} players={g.players} disabled />
        ))}
        {nobody && <p className="text-base is-dimmer has-py-2">{PICKER.nobody}</p>}
      </div>
      <div className="picker__actions is-flex is-flex-wrap has-gap-2 has-pt-3 has-mt-1">
        {current ? (
          <>
            <Button onClick={() => act({ type: "pickerOff", to: "bench" })}>{PICKER.toBench}</Button>
            <Button variant="quiet" onClick={() => act({ type: "pickerOff", to: "pool" })}>
              {PICKER.toPool}
            </Button>
          </>
        ) : (
          <Button variant="quiet" onClick={() => act({ type: "closePicker" })}>
            {PICKER.close}
          </Button>
        )}
      </div>
    </>
  );
}

/** Who can play in a position: a bottom sheet on a phone, a dialog on a wider screen. */
export function Picker() {
  const { state, act } = useBoard();
  const slotId = state.ui.pickerSlot;
  const open = !!slotId;
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const close = useCallback(() => act({ type: "closePicker" }), [act]);

  useEscapeKey(open, close);
  useScrollLock(open);
  useFocusTrap(open, cardRef);

  return (
    <AnimatePresence>
      {slotId && (
        <motion.div
          className="picker is-flex is-justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={MOTION.fade}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cx("picker__card is-flex is-flex-column is-w-full bg-board-2 has-pt-4 has-px-4")}
            initial={{ y: MOTION.sheetY }}
            animate={{ y: 0 }}
            exit={{ y: MOTION.sheetY }}
            transition={MOTION.sheet}
          >
            <PickerBody slotId={slotId} titleId={titleId} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
