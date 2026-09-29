import type { PositionKey } from "@/constants/football";

// Every string on the landing page, plus the example team the demo board plays with.
// Players are never gendered. The team and players are made up.

export type VoiceKey = "hairdryer" | "arm";

export interface Voice {
  readonly key: VoiceKey;
  readonly name: string;
  readonly desc: string;
}

// The two ways the Gaffer talks, from brand.md.
export const VOICES: readonly Voice[] = [
  { key: "hairdryer", name: "Hairdryer", desc: "Few words. Means them." },
  { key: "arm", name: "Arm round", desc: "Always in your corner" },
];

/** The warm Gaffer from brand.md. */
export const DEFAULT_VOICE: VoiceKey = "arm";

/** Something that just happened on the demo board. `a` and `b` are player names or a shape. */
export type DemoEvent =
  | { readonly t: "idle" | "empty" | "copied" }
  | { readonly t: "select" | "shape"; readonly a: string }
  | { readonly t: "sub" | "injury"; readonly a: string; readonly b: string };

interface One {
  readonly a: string;
}
interface Two {
  readonly a: string;
  readonly b: string;
}

interface Say {
  readonly idle: () => string;
  readonly select: (e: One) => string;
  readonly sub: (e: Two) => string;
  readonly injury: (e: Two) => string;
  readonly shape: (e: One) => string;
  readonly empty: () => string;
  readonly copied: () => string;
}

/** What the Gaffer says in the hero as the demo board changes. */
export const SAY: Readonly<Record<VoiceKey, Say>> = {
  hairdryer: {
    idle: () => "Right. Tap a player.",
    select: (e) => `${e.a}. And?`,
    sub: (e) => `${e.a} off. ${e.b} on. Good.`,
    injury: (e) => `Get well, ${e.a}. ${e.b}, you're on.`,
    shape: (e) => `${e.a}. Fine. Make it work.`,
    empty: () => "Bench is empty. That's your lot.",
    copied: () => "Copied. Send it.",
  },
  arm: {
    idle: () => "Big game Saturday? Tap a player, let's have a look.",
    select: (e) => `${e.a}. What are we thinking?`,
    sub: (e) => `${e.b}'s on. Great shift, ${e.a}.`,
    injury: (e) => `${e.a}'s done for today. ${e.b}, this is your moment.`,
    shape: (e) => `${e.a}. Love a bit of ambition.`,
    empty: () => "Everyone's had a go. Proud of that.",
    copied: () => "Copied. The parents will be glad you did.",
  },
};

export interface VoiceCopy {
  readonly sub: string;
  readonly cta: string;
  readonly note: string;
  readonly weekH: string;
  readonly steps: readonly [string, string, string, string];
  readonly sheetH: string;
  readonly privH: string;
  readonly endH: string;
}

/** Headings and calls to action that change with the voice. */
export const COPY: Readonly<Record<VoiceKey, VoiceCopy>> = {
  hairdryer: {
    sub: "Squad. Call-ups. Shape. Bench. Subs. One screen, on your phone.",
    cta: "Get picking",
    note: "No account. Nothing to install.",
    weekH: "Four taps. Every Saturday.",
    steps: ["Squad in", "Who's here?", "Pick a shape", "Make changes"],
    sheetH: "Send the team sheet",
    privH: "Your team. Nobody else's.",
    endH: "Kick-off's at half ten. Be there.",
  },
  arm: {
    sub: "Your squad, who's made it, the shape, the bench and every sub, all on one screen. You've got this.",
    cta: "Let's get started",
    note: "No account needed. Take your time.",
    weekH: "Matchday, one step at a time",
    steps: ["Bring the squad in", "See who's made it", "Find your shape", "Give everyone a go"],
    sheetH: "Let the parents know",
    privH: "Your team, safe with you",
    endH: "Kick-off's at half ten. You'll be brilliant.",
  },
};

export const LANDING_META = {
  title: "Gafferboard - line-ups and team sheets for grassroots football",
  description:
    "A matchday board for grassroots coaches: the squad, who is called up, the shape, the bench and every substitution, on one screen. No account, nothing to install.",
  boardTitle: "Board",
} as const;

export const NAV = {
  label: "Sections",
  home: "Gafferboard home",
  links: [
    { href: "#week", label: "Matchday" },
    { href: "#sheet", label: "Team sheet" },
    { href: "#private", label: "Private" },
  ],
} as const;

export const HERO = {
  /** The page's h1. Says plainly what Gafferboard is, in the words coaches search with. */
  heading: "Line-ups and team sheets for grassroots football",
  kicker: "The gaffer says",
  voiceLabel: "Who's your gaffer?",
  voiceNote: "Your gaffer comes with you to the board. Team sheets and anything about your data always stay plain.",
} as const;

export const DEMO = {
  crest: "AJ",
  fixture: "Ashford Juniors v Northgate",
  detail: "Under 14s · home",
  shapesLabel: "Shape",
  minute: (m: string) => `${m}'`,
  minuteLabel: "Match minute",
  subOff: "Sub off",
  injured: "Injured",
  cancel: "Cancel",
  bench: "Bench",
  benchEmpty: "Empty",
  hint: "Tap a player. Make a change. Listen.",
  reset: "Reset",
  disclaimer: "An example team, made up for this page.",
  playerLabel: (num: number, name: string) => `${num} ${name}`,
} as const;

export const WEEK_BODIES: readonly [string, string, string, string] = [
  "Type the names once. They're there every week after.",
  "Tick who's available. Injured players stay flagged.",
  "Tap a shape. Drag players where you want them.",
  "Bring the bench on. The clock keeps the minutes.",
];

export const SHEET_SECTION = {
  body: "This is the team sheet from the board up top, changes and all. Send it to the WhatsApp group, email it to parents, or copy it.",
  whatsapp: "WhatsApp",
  email: "Email",
  copy: "Copy",
  copied: "Copied",
  initials: "Initials only, for groups with people outside the club",
  chat: "Under 14s parents",
  mailSubject: "Team sheet: Ashford Juniors v Northgate",
  /** Lines of the plain text sheet. It goes out in the coach's name, so it never takes a voice. */
  title: "Ashford Juniors v Northgate (H)",
  shape: (s: string) => `Shape: ${s}`,
  xi: "XI: ",
  benchLine: "Bench: ",
  none: "none",
  subs: "Subs: ",
  injuredLine: "Injured: ",
  subFor: "for",
} as const;

export const SHARE_URLS = {
  whatsapp: "https://wa.me/?text=",
  mail: "mailto:?subject=",
} as const;

export const PRIVATE_ROWS: readonly { readonly title: string; readonly body: string }[] = [
  {
    title: "Stays on your device",
    body: "The board is saved in the browser on your phone. There's no account, and your squad is never sent to us.",
  },
  {
    title: "Move it with a file",
    body: "Export a squad file to move the board to another phone or laptop, or to keep a copy.",
  },
  {
    title: "Delete means deleted",
    body: "Remove a player and their details are gone. Nothing is kept anywhere else.",
  },
];

export const FOOTER = {
  domain: "gafferboard.com",
} as const;

export interface DemoPlayer {
  readonly num: number;
  readonly name: string;
  /** Used when the board loads this team as its example. The landing demo ignores it. */
  readonly pos: readonly PositionKey[];
}

export const DEMO_XI: readonly DemoPlayer[] = [
  { num: 1, name: "Alex", pos: ["GK"] },
  { num: 2, name: "Charlie", pos: ["FB"] },
  { num: 5, name: "Riley", pos: ["CB"] },
  { num: 4, name: "Jamie", pos: ["CB"] },
  { num: 3, name: "Sam", pos: ["FB"] },
  { num: 6, name: "Frankie", pos: ["CDM", "CM"] },
  { num: 8, name: "Robin", pos: ["CM", "CDM"] },
  { num: 7, name: "Remi", pos: ["W"] },
  { num: 10, name: "Ellis", pos: ["CAM", "CM"] },
  { num: 11, name: "Nico", pos: ["W"] },
  { num: 9, name: "Taylor", pos: ["ST"] },
];

export const DEMO_BENCH: readonly DemoPlayer[] = [
  { num: 12, name: "Mia", pos: ["W"] },
  { num: 14, name: "Jordan", pos: ["CM"] },
  { num: 15, name: "Sol", pos: ["CB"] },
  { num: 16, name: "Kit", pos: ["ST"] },
  { num: 17, name: "Ash", pos: ["FB"] },
  { num: 18, name: "Rowan", pos: ["GK"] },
];

/** Shapes the demo offers. Each is a key in FORMATIONS in football.ts. */
export const DEMO_SHAPES = ["4-2-3-1", "4-3-3", "3-4-3"] as const;
export type DemoShape = (typeof DEMO_SHAPES)[number];
