// Every duration, distance and easing the board uses, in seconds for framer-motion.

export const MOTION = {
  /** Standard ease-out. Fast to start, settles rather than stops. */
  ease: [0.22, 0.61, 0.36, 1] as const,
  /** The picker backdrop fading in and out. */
  fade: { duration: 0.18 },
  /** The picker rising from the bottom edge on a phone. */
  sheet: { duration: 0.24, ease: [0.22, 0.61, 0.36, 1] as const },
  sheetY: 32,
  /** The player drawer sliding in from the right edge, on the same curve as the sheet. */
  drawerX: 48,
  /** The toast. It holds for TOAST_MS in config.ts. */
  toast: { duration: 0.18 },
  toastY: 8,
  /** A player dragged off the pitch or bench is lifted slightly. */
  ghostScale: 1.06,
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
