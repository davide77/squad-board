// Numeric config for the board.

// Kept from before the rename to Gafferboard: changing it would lose every saved board.
export const STORAGE_KEY = "squad-board:v1";

// The gaffer picked on the landing page, so a new board starts with the same one.
export const VOICE_STORAGE_KEY = "gafferboard:voice";

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
  /** Minutes played are shown in whole minutes, so they need checking far less often. */
  minutesTickMs: 15000,
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

// The club badge a coach can add. It is shrunk to a small square PNG in the browser,
// so it fits in localStorage and in the squad file next to everything else.
export const BADGE_CONFIG = {
  accept: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml",
  /** Width and height of the stored badge. Sharp on the header crest and the shared picture. */
  size: 192,
  type: "image/png",
  /** A stored badge longer than this is not one we made, so it is dropped on read. */
  maxChars: 300_000,
  /** The board header crest, in CSS pixels. Mirrors .crest in components/_board.scss. */
  crestPx: 46,
} as const;

// The squad message for the parents' group.
export const MESSAGE_CONFIG = {
  /** A Google Maps search for the address. Opens the Maps app on a phone, and WhatsApp previews it. */
  mapUrl: "https://www.google.com/maps/search/?api=1&query=",
  whatsappUrl: "https://wa.me/?text=",
  dateLocale: "en-GB",
  addressRows: 2,
} as const;

/** "Sunday 4 October", the way a coach writes it. */
export const MESSAGE_DATE_FORMAT: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

// The cards at the top of the board that help keep it safe. One shows at a time.
export const KEEP_CONFIG = {
  /** The home screen card waits this long after the team is made, so it shows on a later visit. */
  homeAfterMs: 10 * MINUTE_MS,
  /** The backup card shows once the last squad file is older than this. */
  backupEveryMs: 28 * DAY_MS,
  /** This much on the match clock means a real match was played, so the first backup card need not wait. */
  matchPlayedMs: 20 * MINUTE_MS,
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

// A longer line stays up long enough to read: this much per character, up to the cap.
export const TOAST_MS_PER_CHAR = 55;
export const TOAST_MAX_MS = 5000;

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

// When the hero's clips may start downloading. The page itself comes first, so on a weak
// touchline signal the words and buttons never wait behind a video.
export const VIDEO_CONFIG = {
  /** Wait this long after the page has loaded before a clip starts to download. */
  afterLoadMs: 1500,
  /** Connections too slow for video at all. The poster stays. Reported by Chrome and Android only. */
  slowConnections: ["slow-2g", "2g"],
  /** Screens that get the phone copy of each clip. Below the md breakpoint (900px, see _breakpoints.scss). */
  phoneQuery: "(max-width: 899.98px)",
} as const;

// The Gaffer's clip in the homepage hero: the full width on a phone, half the page
// beside the headline from the md breakpoint (900px, see _breakpoints.scss).
export const ONBOARDING_CONFIG = {
  mediaSizes: "(max-width: 900px) 100vw, 50vw",
} as const;

// Each chapter of the homepage story stays up this long before the next one. The
// tab's progress bar reads it as --story-ms, and the next chapter comes when it fills.
export const STORY_DURATION_MS = 9000;

// Visitor counts, through Vercel Web Analytics: no cookies, and the script is served from gafferboard.com.
// Page views work on every Vercel plan. Custom events (a board started, a sheet sent) need Pro,
// which the team is on. Set `events` to false to stop them, and the privacy page follows.
export const ANALYTICS_CONFIG = {
  events: true,
} as const;

/** Every custom event the board sends, and the one property each may carry. Never a name from the board. */
export const ANALYTICS_EVENTS = {
  boardStarted: "Board started",
  sheetSent: "Sheet sent",
  /** The match clock started from zero: a real match, not a look round. */
  clockStarted: "Clock started",
  /** A saved board opened again, with the days since it was last open. A coach coming back. */
  boardReopened: "Board reopened",
} as const;

/**
 * When the board was last opened, kept on this device only, so a return can be counted without
 * knowing who anyone is. Only the band below is ever sent, never the time. Only written while events are on.
 */
export const LAST_OPENED_KEY = "gafferboard:last-opened";

/**
 * The gap a "Board reopened" reports, first band that fits. `underDays` is exclusive.
 * 7 to 13 days is the coach back for the next match; that is the number to run it by.
 */
export const REOPEN_GAPS = [
  { underDays: 1, label: "same day" },
  { underDays: 7, label: "1 to 6 days" },
  { underDays: 14, label: "7 to 13 days" },
  { underDays: Infinity, label: "14 days or more" },
] as const;

/** The age on a "Clock started" from a board made before age groups existed. */
export const AGE_NOT_SET = "Not set";

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** What went out to the parents, and how. Two properties, the most Vercel Pro keeps per event. */
export const SENT_WHAT = { sheet: "Team sheet", message: "Squad message" } as const;
export const SENT_HOW = { whatsapp: "WhatsApp", copy: "Copied", picture: "Picture" } as const;
export type SentWhat = (typeof SENT_WHAT)[keyof typeof SENT_WHAT];
