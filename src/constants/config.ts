// Numeric config for the board.

// Kept from before the rename to Gafferboard: changing it would lose every saved board.
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
  /** Players read from a pasted squad list. Anything past this is ignored. */
  pasteMaxPlayers: 40,
  /** Rows shown in the squad box on the start screen. */
  pasteRows: 9,
  /** Names listed in the no-position warning. Past this it gives a count instead. */
  noPositionNamesMax: 3,
} as const;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

// The cards at the top of the board that help keep it safe. One shows at a time.
export const KEEP_CONFIG = {
  /** The home screen card waits this long after the team is made, so it shows on a later visit. */
  homeAfterMs: 10 * MINUTE_MS,
  /** The backup card shows once the last squad file is older than this. */
  backupEveryMs: 28 * DAY_MS,
  /** Remembers, on this device only, that the coach closed the home screen card. */
  homeDismissedKey: "gafferboard:home-card-closed",
} as const;

// The line-up picture shared from the team sheet panel. Portrait 4:5, the shape
// WhatsApp and Instagram show without cropping.
export const PICTURE_CONFIG = {
  width: 1080,
  height: 1350,
  fileSuffix: "-line-up.png",
  type: "image/png",
  /** Pitch lines are the kit colour at this opacity, like --line on the board. */
  lineAlpha: 0.24,
  /** Bench names wrap onto at most this many lines. */
  benchLines: 2,
  /** Substitutions listed on the picture, most recent last. */
  subsShown: 5,
} as const;

// The toast fades in, holds and fades out over this time. The SCSS animation
// in components/_toast.scss uses the same duration: keep them in sync.
export const TOAST_MS = 1800;

// The demo board on the landing page. Minutes jump forward with each change so
// the substitutions on the example team sheet read like a real second half.
export const LANDING_CONFIG = {
  /** The first change comes this long after half-time. */
  halfTimeMinute: 46,
  minutesPerChange: 6,
  /** Each change after the first comes a little later again. */
  extraMinutesPerSub: 3,
  fullTimeMinute: 90,
  /** How long the Copy button reads "Copied". Same length as the board's toast. */
  copiedMs: TOAST_MS,
} as const;
