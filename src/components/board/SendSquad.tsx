"use client";

import { useCallback, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ANALYTICS_EVENTS, BADGE_CONFIG, SENT_HOW, type SentHow } from "@/constants/config";
import { HANDOFF } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import { MOTION } from "@/constants/motion";
import { trackSend } from "@/lib/analytics";
import { travelBadge } from "@/lib/board/badge";
import { badgeLink, canHandOff, qrPath, squadLink } from "@/lib/board/handoff";
import { useEscapeKey, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { Button } from "../Button";
import { cx } from "../cx";
import { useBoard } from "./BoardProvider";
import { ControlRow } from "./Panel";
import { useSheetDrag } from "./useSheetDrag";
import { Icon } from "../Icon";

/** The link as a QR code, dark on chalk, because that is what a camera reads. */
function SquadCode({ link, label = HANDOFF.codeLabel }: { readonly link: string; readonly label?: string }) {
  const { size, path } = qrPath(link);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      className="handoff__code is-w-full bg-chalk is-black has-radius-sm"
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}

/** The three addresses the sheet hands out. */
interface SquadLinks {
  /** In the QR code: the squad only, so the code stays coarse enough to scan off a laptop. */
  readonly code: string;
  /** Copied or shared: the squad and, when it fits, the badge. */
  readonly shared: string;
  /** The badge QR code, or null when the board has no badge or it is too big for a code. */
  readonly badge: string | null;
  /** The board has a badge that the shared link could not carry. */
  readonly badgeTooBig: boolean;
}

/**
 * The links, made when the coach asks for them, from the board as it is then. Null while they are being
 * made, and never made in a browser that cannot squeeze the squad small enough.
 */
function useSquadLink() {
  const { state } = useBoard();
  const [links, setLinks] = useState<SquadLinks | null>(null);
  const make = async () => {
    if (!canHandOff()) return;
    const { data } = state;
    const origin = window.location.origin;
    const now = Date.now();
    const { linkMaxChars, codeMaxChars } = BADGE_CONFIG.travel;
    const [forLink, forCode] = await Promise.all([
      travelBadge(data.badge, linkMaxChars),
      travelBadge(data.badge, codeMaxChars),
    ]);
    const has = Boolean(data.badge);
    const [code, shared] = await Promise.all([
      squadLink(data, now, origin, { badgeBehind: has }),
      squadLink(data, now, origin, { badge: forLink, badgeBehind: has }),
    ]);
    setLinks({ code, shared, badge: forCode ? badgeLink(data.team, forCode, origin) : null, badgeTooBig: has && !forLink });
  };
  const clear = useCallback(() => setLinks(null), []);
  return { links, make, clear };
}

/** What happens to the badge, after the privacy line. */
function badgeNote(links: SquadLinks): string {
  if (links.badgeTooBig) return HANDOFF.badgeTooBig;
  return links.badge ? HANDOFF.badgeInLink : HANDOFF.badgeLinkOnly;
}

/** The badge's own QR code, folded away until the squad is open on the phone and asks for it. */
function BadgeCode({ link }: { readonly link: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="is-flex is-flex-column has-gap-3">
      <div>
        <Button size="tiny" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {open ? HANDOFF.badgeCodeClose : HANDOFF.badgeCodeOpen}
        </Button>
      </div>
      {open && (
        <div id={id} className="is-flex is-flex-column has-gap-3">
          <SquadCode link={link} label={HANDOFF.badgeCodeLabel} />
          <p className="text-md is-chalk has-font-semibold">{HANDOFF.badgeCodeHint}</p>
        </div>
      )}
    </div>
  );
}

/** The QR code, and the link to copy or share for the way back from the phone. */
function SquadLinkPanel({ links }: { readonly links: SquadLinks | null }) {
  const { state, act } = useBoard();
  const { data } = state;
  const say = GAFFER[data.voice];
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  function sent(how: SentHow) {
    trackSend(ANALYTICS_EVENTS.squadSent, data, how);
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      act({ type: "notify", text: say.copied });
      sent(SENT_HOW.copy);
    } catch {
      act({ type: "notify", text: say.copyFailed });
    }
  }

  async function share(url: string) {
    try {
      await navigator.share({ title: HANDOFF.shareTitle, url });
      sent(SENT_HOW.shared);
    } catch {
      // closed without sharing
    }
  }

  if (!canHandOff()) return <p className="text-base is-dim">{HANDOFF.unsupported}</p>;
  if (!links) {
    return (
      <p className="text-base is-dim" role="status">
        {HANDOFF.making}
      </p>
    );
  }
  return (
    <div className="is-flex is-flex-column has-gap-3">
      <SquadCode link={links.code} />
      <p className="text-md is-chalk has-font-semibold">{HANDOFF.scan}</p>
      <div className="is-flex is-flex-wrap has-gap-2">
        <Button size="tiny" icon="copy" onClick={() => void copy(links.shared)}>
          {HANDOFF.copy}
        </Button>
        {canShare && (
          <Button size="tiny" onClick={() => void share(links.shared)}>
            {HANDOFF.share}
          </Button>
        )}
      </div>
      <p className="text-sm is-dim">
        {HANDOFF.privacy}
        {data.badge && ` ${badgeNote(links)}`}
      </p>
      {links.badge && <BadgeCode link={links.badge} />}
    </div>
  );
}

/** Under Customise your club: the row that opens the code in place. The way in on a phone. */
export function SendSquad() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const { links, make, clear } = useSquadLink();

  function toggle() {
    setOpen(!open);
    if (open) clear();
    else void make();
  }

  return (
    <>
      <ControlRow label={HANDOFF.label}>
        <Button size="tiny" aria-expanded={open} aria-controls={panelId} onClick={toggle}>
          {open ? HANDOFF.close : HANDOFF.open}
        </Button>
      </ControlRow>
      {open && (
        <div id={panelId} className="has-mt-2 has-mb-3">
          <SquadLinkPanel links={links} />
        </div>
      )}
    </>
  );
}

/**
 * Beside Customise your club at the far end of the header, on a laptop or tablet: one tap to the code. The coach who
 * plans the week at a desk and runs the match on a phone should not have to go looking for it.
 */
export function SendToPhone({ className }: { readonly className?: string }) {
  const { state } = useBoard();
  const [open, setOpen] = useState(false);
  const { links, make, clear } = useSquadLink();
  const titleId = useId();
  const close = useCallback(() => {
    setOpen(false);
    clear();
  }, [clear]);
  const panelRef = useRef<HTMLDivElement>(null);
  const sheet = useSheetDrag("right", close, panelRef);

  useEscapeKey(open, close);
  useScrollLock(open);
  useFocusTrap(open, panelRef);

  // The made-up example team has nothing worth sending.
  if (state.data.example) return null;

  return (
    <>
      <button
        type="button"
        className={cx("club-pill club-pill--plain is-inline-flex is-align-center has-radius-pill text-base has-font-semibold", className)}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true);
          void make();
        }}
      >
        {HANDOFF.toPhone}
      </button>
      {/* Onto the page itself: the header it sits in blurs what is behind it, which would box a fixed sheet into the bar. */}
      {createPortal(
        <AnimatePresence>
          {open && (
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
                {...sheet.motion}
                onPointerDown={sheet.swipe}
              >
                <div className="is-flex is-align-center is-justify-between has-gap-3">
                  <h2 id={titleId} className="text-3xl">
                    {HANDOFF.sheetTitle}
                  </h2>
                  <button
                    type="button"
                    className="drawer__close is-flex is-align-center is-justify-center has-radius-field"
                    aria-label={HANDOFF.close}
                    onClick={close}
                  >
                    <Icon name="close" />
                  </button>
                </div>
                <SquadLinkPanel links={links} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
