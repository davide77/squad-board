import type { Phase, PositionKey } from "@/constants/football";

// Every string on the landing page, plus the example team the demo board plays with.
// Players are never gendered. The team and players are made up.

export type VoiceKey = "hairdryer" | "arm";

export interface Voice {
  readonly key: VoiceKey;
  readonly name: string;
  /** The kind of coach, said in that coach's own voice. */
  readonly desc: string;
  /** A line this gaffer would say, so the difference is heard before it is picked. */
  readonly sample: string;
}

// The two ways the Gaffer talks, from brand.md.
export const VOICES: readonly Voice[] = [
  { key: "hairdryer", name: "Hairdryer", desc: "Few words. Means them.", sample: "\u201cSaved. Good.\u201d" },
  {
    key: "arm",
    name: "Pat on the back",
    desc: "Believes in you before you do.",
    sample: "\u201cLine-up saved. Lovely stuff.\u201d",
  },
];

/** The voice a new board starts in, before onboarding sets it from the age group. */
export const DEFAULT_VOICE: VoiceKey = "hairdryer";

/** The website always speaks Hairdryer (brand.md). Only the coach's own board can change voice. */
export const LANDING_VOICE: VoiceKey = "hairdryer";

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
    idle: () => "Go on. Make a change.",
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
  readonly note: string;
  readonly weekH: string;
  readonly steps: readonly [string, string, string, string];
  readonly filmH: string;
  readonly sheetH: string;
  readonly privH: string;
  readonly endH: string;
}

/** Headings and calls to action on the home page. The website always speaks Hairdryer (brand.md). */
export const LANDING_COPY: VoiceCopy = {
  sub: "Squad. Call-ups. Shape. Bench. Subs. One screen, on your phone.",
  note: "Free for your team. No account. Nothing to install.",
  weekH: "Four taps. Every Saturday.",
  steps: ["Squad in", "Who's here?", "Pick a shape", "Make changes"],
  filmH: "Chalk. Magnets. Chaos.",
  sheetH: "Send the team sheet",
  privH: "Your team. Nobody else's.",
  endH: "Matchday's coming. Pick your team.",
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
  // Plain nouns, one per section below the hero. The hero is how it works, so it needs no link.
  links: [
    { href: "#try", label: "Demo" },
    { href: "#sheet", label: "Team sheet" },
    { href: "#private", label: "Privacy" },
  ],
  /** The coach's own teams, in the rail at the top left or at the header's far end. They stand in for the button above. */
  team: {
    label: "Your team",
    many: "Your teams",
    fallback: "your team",
    aria: (team: string) => `Open ${team} on the board`,
  },
} as const;

/**
 * The way to the board, in the header, the hero and the closing band. One set of words everywhere:
 * the same as the start screen's own button, the format once an age is picked, and plain for a coach coming back.
 */
export const BOARD_CTA = {
  fresh: "Pick my team",
  back: "Open the board",
} as const;

export const DEMO = {
  crest: "AJ",
  fixture: "Ashford Juniors v Northgate",
  detail: "Under 14s · home",
  shapesLabel: "Shape",
  minute: (m: string) => `${m}'`,
  /** Read out in place of the minute on the clock, which shows as 12'. */
  minuteSpoken: (m: number) => `Match minute ${m}`,
  subOff: "Sub off",
  injured: "Injured",
  cancel: "Cancel",
  bench: "Bench",
  benchEmpty: "Empty",
  reset: "Reset",
  disclaimer: "An example team, made up for this page.",
  playerLabel: (num: number, name: string) => `${num} ${name}`,
} as const;

/** The film in the first chapter of the hero. A short silent loop plays until the visitor asks for the film with sound. */
export const FILM = {
  label: "Gafferboard film. A coach gives up on chalk and magnets, picks the team on a phone and sends the players out to play.",
  captionsLabel: "English",
  captionsLang: "en-GB",
} as const;

/**
 * Every clip has a phone copy beside it, "-sm" before the extension: 480 wide instead of 720,
 * about a third of the weight, and no different at the size a phone shows it.
 */
export const phoneCopy = (path: string): string => path.replace(/(\.\w+)$/, "-sm$1");

/** The film files in public/film. Vertical 9:16, cut from the Runway renders. */
export const FILM_MEDIA = {
  teaser: { mp4: "/film/gafferboard-teaser.mp4", webm: "/film/gafferboard-teaser.webm" },
  film: "/film/gafferboard-film.mp4",
  poster: "/film/gafferboard-film-poster.jpg",
  captions: "/film/gafferboard-film.vtt",
  width: 720,
  height: 1280,
} as const;

export interface StoryChapter {
  readonly key: "gaffer" | "age" | "squad" | "shape" | "match" | "share";
  readonly tab: string;
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  /** The chapter's clip, in public/story. */
  readonly media: { readonly webm: string; readonly mp4: string; readonly poster: string };
}

/** The hero carousel: one matchday in six chapters, each with its own vertical clip. */
export const STORY: readonly StoryChapter[] = [
  {
    key: "gaffer",
    tab: "The Gaffer",
    kicker: "The Gaffer",
    // Says what it is first. On a phone this is all a coach sees before deciding to scroll.
    title: "Pick the team on the touchline.",
    body: "A matchday board for grassroots coaches. Squad, shape, bench, subs and the team sheet, on your phone. I tell you what's next.",
    media: { webm: "/film/gafferboard-teaser.webm", mp4: "/film/gafferboard-teaser.mp4", poster: "/film/gafferboard-film-poster.jpg" },
  },
  {
    key: "age",
    tab: "Age group",
    kicker: "Age group",
    title: "How old are they?",
    body: "Pick the age group. I set the format and the shapes. Under 11s, everyone gets a go. From under 12s, it's about results.",
    media: { webm: "/story/gafferboard-story-age.webm", mp4: "/story/gafferboard-story-age.mp4", poster: "/story/gafferboard-story-age.jpg" },
  },
  {
    key: "squad",
    tab: "Squad",
    kicker: "Squad",
    title: "Squad in. Then we talk.",
    body: "Paste the names from the parents' group. Numbers and positions if you've got them. Type them once, they're there every week.",
    media: {
      webm: "/story/gafferboard-story-squad.webm",
      mp4: "/story/gafferboard-story-squad.mp4",
      poster: "/story/gafferboard-story-squad.jpg",
    },
  },
  {
    key: "shape",
    tab: "Formation",
    kicker: "Formation",
    title: "Pick your strongest side.",
    body: "Tap a shape. Drag players where you want them. Save it. I'll question it. You'll pick it anyway.",
    media: {
      webm: "/story/gafferboard-story-shape.webm",
      mp4: "/story/gafferboard-story-shape.mp4",
      poster: "/story/gafferboard-story-shape.jpg",
    },
  },
  {
    key: "match",
    tab: "Matchday",
    kicker: "Matchday",
    title: "Clock on. Make your changes.",
    body: "Tap a player, bring the bench on. Every sub logged to the minute. Injured players stay flagged for next week.",
    media: {
      webm: "/story/gafferboard-story-match-2.webm",
      mp4: "/story/gafferboard-story-match-2.mp4",
      poster: "/story/gafferboard-story-match-2.jpg",
    },
  },
  {
    key: "share",
    tab: "Parents",
    kicker: "Parents",
    title: "Send it to the parents.",
    body: "The team sheet goes to the WhatsApp group or by email. Initials only if the group goes beyond the club. It goes out plain, in your name.",
    media: {
      webm: "/story/gafferboard-story-share.webm",
      mp4: "/story/gafferboard-story-share.mp4",
      poster: "/story/gafferboard-story-share.jpg",
    },
  },
];

export const STORY_UI = {
  /** The page's one h1, fixed while the chapters turn. The positioning line, then what it is in the words coaches search with. */
  heading: "Pick the team on the touchline. Line-ups and team sheets for grassroots football.",
  label: "How Gafferboard works",
  chapters: "Chapters",
  count: (n: number, total: number) => `${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
  pause: "Pause",
  /** A toggle, so the name stays the same and aria-pressed says whether it is paused. */
  pauseLabel: "Pause the story",
  playFilm: "Play the film · 38s",
  ageLabel: "Age group",
  ageLine: (label: string, phase: Phase) =>
    phase === "development" ? `${label}. Everyone gets a go. I'll keep an eye on minutes.` : `${label}. Results count now. So do your decisions.`,
} as const;

export const TRY_SECTION = {
  kicker: "Your turn",
  heading: "Enough talk. Tap a player.",
  body: "A made-up team on a real board. Sub someone off, mark an injury, change the shape. I'll have something to say.",
} as const;

export const WEEK_BODIES: readonly [string, string, string, string] = [
  "Type the names once. They're there every week after.",
  "Tick who's available. Injured players stay flagged.",
  "Tap a shape. Drag players where you want them.",
  "Bring the bench on. The clock keeps the minutes.",
];

export const SHEET_SECTION = {
  body: "This is the team sheet from the board above, changes and all. Send it to the WhatsApp group, email it to parents, or copy it.",
  whatsapp: "WhatsApp",
  /** Read out after the WhatsApp link, which opens in a new tab. */
  newTab: "(opens in a new tab)",
  email: "Email",
  copy: "Copy",
  copied: "Copied",
  /** Read out when the copy lands. The button's own label change is not announced. */
  copiedSpoken: "Team sheet copied",
  copyFailed: "This browser won't copy. Select the sheet and copy it yourself.",
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

/** Under the rows, so the section and the footer's privacy page end in the same place. */
export const PRIVATE_MORE = "Read the privacy and safety page";

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
