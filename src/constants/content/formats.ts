// The format pages: one page for each format coaches search for by name, "5-a-side formations"
// up to "11-a-side formations". Each opens the board on it. 3-a-side has no page: it has no
// positions to pick, so there is nothing to say about shapes.
import type { FormatKey } from "@/constants/football";

export interface FormatPage {
  /** The address, such as "7-a-side". */
  readonly slug: string;
  readonly format: FormatKey;
  readonly title: string;
  readonly description: string;
  readonly heading: string;
  readonly intro: readonly string[];
  readonly cta: string;
  /** The questions coaches ask about this format, each answered on its own so search and AI answers can quote it. */
  readonly questions: readonly FormatQuestion[];
  /** One line on what each shape on the board is for, keyed by the shape as FORMATS names it. */
  readonly shapeNotes: Readonly<Record<string, string>>;
  /**
   * The FA's rules for the format, only where they are confirmed in an FA document for 2026-27.
   * 9-a-side and 11-a-side have none yet: their 2026-27 figures were only seen in the FA's proposed rules.
   */
  readonly rules?: readonly FormatRule[];
}

export interface FormatRule {
  readonly label: string;
  readonly value: string;
}

/**
 * Where the rules come from. Checked on 3 November 2026 against The FA's Mini-Soccer and Youth Futsal
 * Handbook for 2026-27 and the FutureFit announcement.
 */
export const FA_SOURCES = {
  handbook: "The FA Mini-Soccer and Youth Futsal Handbook 2026-27",
  formats: { name: "England Football: game formats by age", url: "https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/What-is-a-format-in-football" },
  futureFit: {
    name: "FutureFit: the changes to youth football",
    url: "https://www.englandfootball.com/articles/2025/Feb/21/Future-Fit-grassroots-youth-football-england-update-20252102",
  },
} as const;

/** Rules shared by both mini-soccer formats, word for word the same on 5-a-side and 7-a-side. */
const MINI_SOCCER_RULES: readonly FormatRule[] = [
  { label: "Subs", value: "Rolling. On and off at any time with the referee's say-so, and a player who came off can go back on." },
  { label: "Goal kicks", value: "Retreat line. The other side drops back to halfway until the ball is played." },
  { label: "Restarts", value: "No offside. No throw-ins: pass or dribble it in. No deliberate heading." },
  { label: "Results", value: "No leagues. Up to three trophy events a season." },
  { label: "Playing time", value: "Equal where possible. The FA's best practice is at least half of every game for every player." },
];

export interface FormatQuestion {
  readonly q: string;
  readonly a: readonly string[];
}

export const FORMAT_PAGES: readonly FormatPage[] = [
  {
    slug: "5-a-side",
    format: "5v5",
    title: "5-a-side formations and line-ups",
    description:
      "A free 5-a-side board for grassroots coaches: pick a shape, tick who's in, keep fair minutes and send call-ups to parents. Under 8s and 9s. No account.",
    heading: "5-a-side formations. Everyone plays.",
    intro: [
      "Five a side is the FA format for under 8s and under 9s from the 2026-27 season: a keeper and four outfield players on a small pitch.",
      "Pick a shape, tick who's in, and the board keeps every player's minutes, so everyone gets a fair go.",
    ],
    cta: "Open the board in 5-a-side",
    questions: [
      {
        q: "What is the best 5-a-side formation?",
        a: [
          "At this age the shape matters less than the touches. Everyone attacks. Everyone defends.",
          "1-2-1 is the diamond, and where most coaches start. One at the back, two wide, one up top. Every player has a team-mate either side.",
          "2-2 is two and two. Easy to explain, easy to hold. 2-1-1 keeps two back for a side that's leaking goals.",
          "Swap them round every half. The keeper too.",
        ],
      },
      {
        q: "What changed at 5-a-side this season?",
        a: [
          "From 2026-27 the FA moved the formats down an age. Under 8s and under 9s play 5-a-side. Under 7s start on 3-a-side, with no keepers.",
          "Under 9s used to play 7-a-side, so plenty of squads are new to five. Pick the age group and the board sets the format. Your league plays something different? Change it.",
        ],
      },
    ],
    shapeNotes: {
      "1-2-1": "The diamond. One back, two wide, one up top. The balanced start.",
      "2-2": "Two at the back, two up top. Simple to hold.",
      "2-1-1": "Two at the back, one in the middle, one up top. Safer at the back.",
    },
    rules: [
      { label: "Ages", value: "Under 8s and under 9s, from 2026-27." },
      { label: "Goals and ball", value: "12 x 6 ft goals. Size 3 ball." },
      { label: "Match length", value: "Up to 40 minutes, two halves of 20. No more than 60 minutes in a day." },
      { label: "Squad", value: "Five on the pitch, ten or fewer on matchday." },
      ...MINI_SOCCER_RULES,
    ],
  },
  {
    slug: "7-a-side",
    format: "7v7",
    title: "7-a-side formations and line-ups",
    description:
      "A free 7-a-side board for grassroots coaches: pick a shape, tick who's in, keep fair minutes and send call-ups to parents. Under 10s and 11s. No account.",
    heading: "7-a-side formations. Pick the team.",
    intro: [
      "Seven a side is the FA format for under 10s and under 11s: a keeper and six outfield players on a small pitch.",
      "Pick a shape, tick who's in, and the board keeps every player's minutes, so everyone gets a fair go.",
    ],
    cta: "Open the board in 7-a-side",
    questions: [
      {
        q: "What is the best 7-a-side formation?",
        a: [
          "2-3-1 is where most coaches start. But there's no best shape, only the one that suits the players you've got.",
          "Two at the back, three across the middle, one up top. It's balanced, and everyone gets on the ball.",
          "Leaking goals? Go 3-2-1 and put three at the back. Got two who score? 3-1-2 plays them together up top. 2-1-2-1 is a diamond, for a side that likes to pass through the middle.",
          "This is development football, so move players around. A defender who plays up top for a half learns something.",
        ],
      },
      {
        q: "How do I keep minutes fair at 7-a-side?",
        a: [
          "Everyone plays at this age. That's the point of development football.",
          "Tick who's in, put the rest on the bench, and log each sub as it happens. The board records the minute. Minutes played shows every player's total, so you know who needs the second half.",
          "Then send the call-up to the parents' group from the same screen.",
        ],
      },
      {
        q: "Moving up from 5-a-side to 7-a-side?",
        a: [
          "Two more players, a bigger pitch, and the shape starts to matter.",
          "Start in 2-3-1. It's the 1-2-1 diamond with one more at the back and one more in the middle, so nobody has to learn a new job.",
          "Under 10s and under 11s is still development football. Everyone plays. Move them around.",
          "Under 9s used to play 7-a-side. From 2026-27 they stay on 5-a-side, and under 11s stay on 7-a-side instead of moving to nine.",
        ],
      },
    ],
    shapeNotes: {
      "2-3-1": "Two at the back, three across the middle, one up top. The balanced start.",
      "3-2-1": "Three at the back. Safer when you're leaking goals.",
      "2-1-2-1": "A diamond. One sits, two get forward, one up top.",
      "3-1-2": "Three at the back, one in the middle, two up top. For a side that scores.",
    },
    rules: [
      { label: "Ages", value: "Under 10s and under 11s." },
      { label: "Goals and ball", value: "12 x 6 ft goals. Size 3 ball." },
      { label: "Match length", value: "Up to 50 minutes, two halves of 25. No more than 90 minutes in a day." },
      { label: "Squad", value: "Seven on the pitch, fourteen or fewer on matchday." },
      ...MINI_SOCCER_RULES,
    ],
  },
  {
    slug: "9-a-side",
    format: "9v9",
    title: "9-a-side formations and line-ups",
    description:
      "A free 9-a-side board for grassroots coaches: five shapes, the bench, every sub to the minute and the result for parents. Under 12s and 13s. No account.",
    heading: "9-a-side formations. Results count now.",
    intro: [
      "Nine a side is the FA format for under 12s and under 13s, where results and league tables begin.",
      "Pick from five shapes, set your strongest side, and log every change to the minute on matchday.",
    ],
    cta: "Open the board in 9-a-side",
    questions: [
      {
        q: "What is the best 9-a-side formation?",
        a: [
          "3-2-3 is the common start. Three at the back, two in midfield, three up top. Plenty of width, plenty of runners.",
          "Losing the middle of the park? 3-4-1 puts four across it. Need to stay in games? 4-3-1 gives you a back four. 3-3-2 is the even one, three and three behind a front two. 2-3-2-1 is for a side that keeps the ball.",
          "Pick the shape for the players you've got and the side you're playing. Results count now, so it matters.",
        ],
      },
      {
        q: "What changes at 9-a-side?",
        a: [
          "Under 12s and under 13s is where results count and league tables start. Coaches play to win.",
          "Positions start to mean something, and the parents want to know who's starting.",
          "The board keeps your strongest side saved, logs every change to the minute, and sends the result to the parents at full time.",
        ],
      },
      {
        q: "Who plays 9-a-side from 2026-27?",
        a: [
          "Under 12s and under 13s. That's the FA's FutureFit change.",
          "Under 11s used to play nine. They now stay on 7-a-side a season longer. Under 13s used to go up to eleven. They now get another season of nine.",
        ],
      },
      {
        q: "Moving up from 7-a-side to 9-a-side?",
        a: [
          "Two more players, and the first season results count.",
          "3-3-2 is the easy step. It's a 2-3-1 with one more at the back and a second striker, so the shape your squad knows is still there.",
          "Give it a few weeks before you try 3-2-3. The wide players in a 3-2-3 cover a lot of grass.",
        ],
      },
    ],
    shapeNotes: {
      "3-2-3": "Three back, two in the middle, three up front. Width and goals.",
      "2-3-2-1": "Two at the back, three across midfield, two behind a striker.",
      "3-3-2": "Three at the back, three in midfield, two up top. Balanced.",
      "3-4-1": "Four across the middle. Win the midfield.",
      "4-3-1": "A back four. Hard to beat.",
    },
  },
  {
    slug: "11-a-side",
    format: "11v11",
    title: "11-a-side formations and line-ups",
    description:
      "A free 11-a-side board for grassroots coaches: fifteen shapes from 4-3-3 to 5-3-2, the bench, subs to the minute and the call-up. Under 14s to adults.",
    heading: "11-a-side formations. The full game.",
    intro: [
      "Eleven a side is the full game, from under 14s up to adults.",
      "Fifteen shapes to pick from, or drag the markers into your own. Bench cover, subs to the minute, and the call-up in one tap.",
    ],
    cta: "Open the board in 11-a-side",
    questions: [
      {
        q: "What is the best 11-a-side formation for youth football?",
        a: [
          "4-4-2 and 4-3-3 are where most youth sides start. 4-4-2 is two banks of four and two up top, easy to learn. 4-3-3 puts three in midfield and two wingers high.",
          "4-2-3-1 gives you two holding midfielders, safer against a better side. Got three good centre-backs? 3-5-2 or 3-4-3 frees the wing-backs. Holding a lead late on? 5-4-1.",
          "Fifteen shapes are on the board. If none fits, drag the markers into your own, and the board works out each player's role from where they stand.",
        ],
      },
      {
        q: "How do I manage subs at 11-a-side?",
        a: [
          "Name the eleven, fill the bench, and make each sub on the board as it happens.",
          "The board logs the minute of every change and keeps each player's minutes played. Mark an injury and that player won't go back on the bench.",
          "The call-up goes to the parents before the game, the result after it, and a line-up picture to the other coaches.",
        ],
      },
      {
        q: "Moving up from 9-a-side to 11-a-side?",
        a: [
          "From 2026-27, under 14s is the first season of 11-a-side. Two more players, a bigger pitch, and a back four for most sides.",
          "Played 3-2-3? Go 4-3-3. One more at the back, one more in midfield, the same front three.",
          "Played 3-3-2? Go 4-4-2. One more at the back, one more in midfield, the same front two.",
        ],
      },
    ],
    shapeNotes: {
      "4-3-3": "A back four, three in midfield, two wingers and a striker.",
      "4-2-3-1": "Two holding midfielders behind three and a lone striker.",
      "4-4-2": "Two banks of four and two up top. The classic.",
      "4-1-4-1": "One sits in front of the back four. Compact.",
      "4-4-1-1": "A 4-4-2 with one striker dropped off the front.",
      "4-1-2-1-2": "A narrow diamond behind two strikers.",
      "4-3-1-2": "Three in midfield, a number 10, two up top.",
      "4-2-4-0": "No striker. Four runners up front.",
      "3-4-1-2": "Three at the back, wing-backs, a 10 behind two strikers.",
      "3-2-4-1": "Three at the back, two holding, four behind a striker.",
      "3-4-3": "Three at the back, wing-backs, three up top.",
      "3-4-2-1": "Three at the back, two 10s behind a striker.",
      "3-5-2": "Wing-backs and a midfield three behind two strikers.",
      "5-4-1": "Five at the back, four in midfield. For holding a lead.",
      "5-3-2": "Five at the back, two up top on the break.",
    },
  },
];

/** Labels on every format page. */
export const FORMAT_PAGE = {
  shapesHeading: "Shapes on the board",
  agesHeading: "Who plays it",
  ages: (labels: readonly string[]) => labels.join(", "),
  /** Under "Who plays it", to the page with every age group. */
  agesMore: "Every age group and its format",
  others: "Other formats",
  /** The shape's own heading, so "2-3-1 formation" has a heading to match. */
  shapeHeading: (shape: string) => `${shape} formation`,
  /** Read out for the drawing of a shape: the keeper, then each line from the back. */
  diagramLabel: (shape: string) => `The ${shape} formation on a pitch: a keeper, then ${shape.split("-").join(", ")} from the back.`,
  rulesHeading: (label: string) => `The FA rules for ${label}`,
  rulesSource: `From ${FA_SOURCES.handbook}. Leagues can play a smaller format. Check yours.`,
  /** The FA pages linked under the rules, as further reading. */
  rulesLinks: "Read more from the FA",
  /** Who wrote the page, beside the date. Links to the credits page. */
  byline: "· By",
  updated: (date: string) => `Last updated ${date}`,
  /** The first step of the breadcrumb in the structured data. */
  home: "Home",
} as const;
