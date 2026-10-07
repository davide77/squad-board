// Every duration, distance and easing the board uses, in seconds for framer-motion.

export const MOTION = {
  /** Standard ease-out. Fast to start, settles rather than stops. */
  ease: [0.22, 0.61, 0.36, 1] as const,
  /** The backdrop behind a sheet or drawer fading in and out. */
  fade: { duration: 0.18 },
  /**
   * Sheets and drawers come in from their edge and leave by the same one. A spring with no bounce rather
   * than a timed curve: it starts from wherever the sheet is, at the speed the coach's finger left it.
   */
  sheet: { type: "spring", bounce: 0, duration: 0.35 },
  /** All the way off the edge, so a sheet pulled half off leaves the way it was going. */
  sheetOff: "100%",
  /** How far a sheet gives when pulled the wrong way, against the edge it is fixed to. */
  sheetResist: 0.06,
  /** Let go short of closing, a sheet springs back home, critically damped so it does not wobble. */
  sheetReturn: { bounceStiffness: 500, bounceDamping: 45 },
  /** A throw closes a sheet when it would carry the sheet past this share of its own size. */
  sheetDismiss: 0.33,
  /**
   * How quickly a thrown sheet would slow down, per millisecond: Apple's scroll deceleration. With the
   * throw's speed it says where the sheet would come to rest, which decides whether it closes.
   */
  deceleration: 0.998,
  /** A popover under a toolbar button on a wider screen: it grows from the button, quickly. */
  pop: { duration: 0.15, ease: [0.22, 0.61, 0.36, 1] as const },
  popScale: 0.96,
  /** The toast and the undo bar. The toast holds for TOAST_MS in config.ts, the undo bar for UNDO_MS. */
  toast: { duration: 0.18 },
  toastY: 8,
  /** A player dragged off the pitch or bench is lifted slightly. Mirrored as $ghost-scale in _chip.scss. */
  ghostScale: 1.06,
  /** The dragged player flying into their new place on release, starting at the finger's speed. */
  ghostLand: { type: "spring", bounce: 0, duration: 0.3 },
  /** Rows in the squad list sliding out of the way of a row being dragged. */
  reorder: { type: "spring", bounce: 0, duration: 0.25 },
  /** The homepage story. The words slide in the way the story is going, one line after another. */
  story: { duration: 0.42, ease: [0.22, 0.61, 0.36, 1] as const },
  storyOut: { duration: 0.18 },
  storyX: 28,
  storyStagger: 0.06,
  /** The clips cross-fade, and the new one settles from a slight push in. */
  storyMedia: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] as const },
  storyMediaScale: 1.06,
  /** Anything that must change without being seen to change. */
  instant: { duration: 0 },
} as const;
