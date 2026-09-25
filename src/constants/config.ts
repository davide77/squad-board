// Numeric config for the board.

export const STORAGE_KEY = "squad-board:v1";

export const BOARD_CONFIG = {
  /** Wait after the last change before writing to localStorage. */
  saveDebounceMs: 350,
  /** Pointer travel before a press becomes a drag. */
  dragThresholdPx: 8,
  /** Distance from the viewport edge that starts auto-scroll while reordering. */
  edgeScrollZonePx: 90,
  edgeScrollStepPx: 12,
  edgeScrollIntervalMs: 16,
  clockTickMs: 1000,
  /** Saved line-ups kept, newest first. */
  maxSavedLineups: 8,
  /** Cover names shown under a shirt and on the team sheet. */
  coverNamesShown: 2,
  shirtNumberMaxLength: 2,
  shirtLabelMaxLength: 10,
  /** Shows the getting-started card until the squad is bigger than this. */
  startCardUntil: 2,
} as const;

// The toast fades in, holds and fades out over this time. The SCSS animation
// in components/_toast.scss uses the same duration: keep them in sync.
export const TOAST_MS = 1800;
