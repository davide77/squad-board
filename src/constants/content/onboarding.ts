import type { AgeKey, Phase } from "@/constants/football";
import type { VoiceKey } from "./landing";

// The first-run carousel: the Gaffer meets the coach. One question, then four slides in
// the Gaffer's voice for that age. Very soft up to under 11s, rough from under 12s.
// The Gaffer only ever talks to the coach, and talks about players, never to them.

export type Tone = "soft" | "rough";

/** Development football gets the soft Gaffer, competitive football the rough one. */
export const TONE_FOR_PHASE: Readonly<Record<Phase, Tone>> = { development: "soft", competitive: "rough" };

/** The landing page's copy is written in the two voices; each tone speaks in one. */
export const VOICE_FOR_TONE: Readonly<Record<Tone, VoiceKey>> = { soft: "arm", rough: "hairdryer" };

export const ONBOARDING = {
  label: "Meet the Gaffer",
  question: "Before we start, Coach. Who are we looking after?",
  questionHint: "One tap sets the format and how I talk to you. You can change it later under Customise your club.",
  ageGroupLabel: "Age group",
  /** Before an age is picked there is no tone yet, so the skip link is plain. */
  skip: "Skip the tour",
  next: "Next",
  back: "Back",
  step: (n: number, total: number) => `Step ${n} of ${total}`,
  videoLabel: "The Gaffer with a team this age",
} as const;

export interface ToneSlides {
  /** Slide 2: a first-person caption that ties the video to the voice. */
  readonly meetHeading: string;
  readonly meetCaption: string;
  readonly squadHeading: string;
  readonly squadBody: string;
  readonly sideHeading: string;
  readonly sideBody: string;
  readonly matchHeading: string;
  readonly matchBody: string;
  /** What the Gaffer says in the bubble on the matchday slide. */
  readonly matchLine: string;
  readonly finish: string;
  readonly skip: string;
}

export const TONE_SLIDES: Readonly<Record<Tone, ToneSlides>> = {
  soft: {
    meetHeading: "Hello, Coach. Lovely to meet you.",
    meetCaption: "That's me with a team your age. Down at their level, lots of laughs. I'll be with you every Saturday.",
    squadHeading: "Let's meet your players.",
    squadBody: "Copy the names straight from the parents' group. Numbers and positions are optional at this age.",
    sideHeading: "Everyone finds a spot.",
    sideBody: "Tap anyone to swap them over. There are no wrong answers here.",
    matchHeading: "Everyone gets a go. I'll keep count.",
    matchBody: "Start the clock and every minute is counted, so game time stays fair. Then send the result to the parents.",
    matchLine: "Isa's still waiting for a go. Shall we?",
    finish: "Let's do it",
    skip: "Skip the tour. We'll be fine.",
  },
  rough: {
    meetHeading: "Right. You'll get the same treatment.",
    meetCaption: "That's me on matchday. Results count now, and so do your decisions.",
    squadHeading: "Squad in. Then we talk.",
    squadBody: "Paste the names. Put the positions in too, or I'm guessing.",
    sideHeading: "Pick your strongest side.",
    sideBody: "Save it once, come back to it every week. I'll question it. You'll pick it anyway.",
    matchHeading: "Missed training. Noted.",
    matchBody: "Injured, unavailable, missed training. Every sub logged to the minute, and the sheet goes to the players' group.",
    matchLine: "Three changes at half-time? Your call.",
    finish: "Get on with it",
    skip: "Skip it. The board's ready.",
  },
};

/**
 * The clip or still behind slide 2 for each tone. Generated to match the film's Gaffer.
 * A slide without a video shows its poster, and so does every slide under reduced motion.
 */
export interface OnboardingMedia {
  readonly poster: string;
  /** WebM first (smaller), MP4 for browsers without it. */
  readonly video?: { readonly webm: string; readonly mp4: string };
}

/** Slide 2 shows the Gaffer with a team close to the coach's own age. */
export type MediaBand = "little" | "learners" | "competitors" | "seniors";

export const MEDIA_BAND: Readonly<Record<AgeKey, MediaBand>> = {
  U7: "little",
  U8: "little",
  U9: "learners",
  U10: "learners",
  U11: "learners",
  U12: "competitors",
  U13: "competitors",
  U14: "competitors",
  U15: "competitors",
  U16: "competitors",
  U17: "seniors",
  U18: "seniors",
  Open: "seniors",
};

const clip = (name: string): OnboardingMedia => ({
  poster: `/onboarding/${name}.jpg`,
  video: { webm: `/onboarding/${name}.webm`, mp4: `/onboarding/${name}.mp4` },
});

export const ONBOARDING_MEDIA: Readonly<Record<MediaBand, OnboardingMedia>> = {
  little: clip("gaffer-little"),
  learners: clip("gaffer-learners"),
  competitors: clip("gaffer-competitors"),
  // The changing room film will show him with an adult side once it is cleared of
  // third-party logos. Until then adults see the same rough team talk.
  seniors: clip("gaffer-competitors"),
};

/** Remembers on this device that the coach has met the Gaffer, so the tour plays once. */
export const ONBOARDING_SEEN_KEY = "gafferboard:met-the-gaffer";

/* ---------- the homepage question ---------- */

/**
 * The homepage asks once, in six groups rather than thirteen ages. Each group plays one
 * format in one phase, so the page can adapt exactly. `age` is the group's first age,
 * handed to the start screen, where the coach can pick the exact one.
 */
export interface HomeAgeGroup {
  readonly label: string;
  readonly age: AgeKey;
}

export const HOME_AGE_GROUPS: readonly HomeAgeGroup[] = [
  // The shorthand coaches use, which also fits three to a row on a phone.
  { label: "U7", age: "U7" },
  { label: "U8 and U9", age: "U8" },
  { label: "U10 and U11", age: "U10" },
  { label: "U12 and U13", age: "U12" },
  { label: "U14 to U18", age: "U14" },
  { label: "Adults", age: "Open" },
];

/** The Gaffer's face beside the question, so it is clearly him asking. */
export const GAFFER_FACE = { src: "/onboarding/gaffer-face.jpg", size: 48, alt: "The Gaffer" } as const;

export const HOME_QUESTION = {
  heading: "Who are you coaching?",
  hint: "Tap one. The Gaffer, the board and the format change to suit.",
  /** The start button once an age is picked. */
  start: (format: string) => `Start my ${format} board`,
  howHeading: "How it works",
  howLabel: "How Gafferboard works",
  previous: "Previous",
  next: "Next",
  slide: (n: number, total: number) => `${n} of ${total}`,
} as const;

/** Remembers the homepage answer on this device, so the start screen opens on it. */
export const AGE_PREF_KEY = "gafferboard:age";

/** The hero's headline and the words over the Gaffer's clip, before and after the question. */
export const HOME_HERO = {
  headline: {
    none: "Pick the team on the touchline.",
    soft: "You pick the team, Coach. We'll hold the clipboard.",
    rough: "Your team. Your call.",
  },
  caption: {
    none: "That's me. Tell me who you're coaching and I'll show you round.",
    soft: TONE_SLIDES.soft.meetCaption,
    rough: TONE_SLIDES.rough.meetCaption,
  },
} as const;

/** The "have a go" section, where the demo board moved from the hero. */
export const HOME_DEMO = {
  heading: { none: "Have a go.", soft: "Have a go. Tap a player.", rough: "Your turn. Tap a player." },
} as const;

/** Over the how-it-works cards: three of them, so the old four-step headings would not fit. */
export const HOME_HOW = {
  heading: { none: "Matchday, three steps.", soft: "Matchday, one step at a time.", rough: "Three steps. Every Saturday." },
} as const;
