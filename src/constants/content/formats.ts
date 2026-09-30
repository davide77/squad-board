// The format pages: one page for each of the three formats coaches search for by name,
// "7-a-side formations", "9-a-side formations" and "11-a-side formations". Each opens the board on it.
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
}

export const FORMAT_PAGES: readonly FormatPage[] = [
  {
    slug: "7-a-side",
    format: "7v7",
    title: "7-a-side formations and line-ups",
    description:
      "A free 7-a-side board for grassroots coaches: pick a shape, tick who's in, keep fair minutes and send the call-up to the parents. Under 10s and under 11s. No account.",
    heading: "7-a-side. Pick the team.",
    intro: [
      "Seven a side is the FA format for under 10s and under 11s: a keeper and six outfield players on a small pitch.",
      "Pick a shape, tick who's in, and the board keeps every player's minutes, so everyone gets a fair go.",
    ],
    cta: "Open the board in 7-a-side",
  },
  {
    slug: "9-a-side",
    format: "9v9",
    title: "9-a-side formations and line-ups",
    description:
      "A free 9-a-side board for grassroots coaches: five shapes, the bench, every sub to the minute and the result for the parents. Under 12s and under 13s. No account.",
    heading: "9-a-side. Results count now.",
    intro: [
      "Nine a side is the FA format for under 12s and under 13s, where results and league tables begin.",
      "Pick from five shapes, set your strongest side, and log every change to the minute on matchday.",
    ],
    cta: "Open the board in 9-a-side",
  },
  {
    slug: "11-a-side",
    format: "11v11",
    title: "11-a-side formations and line-ups",
    description:
      "A free 11-a-side board for grassroots coaches: fifteen shapes from 4-3-3 to 5-3-2, the bench, subs to the minute and the call-up for the parents. Under 14s to adults.",
    heading: "11-a-side. The full game.",
    intro: [
      "Eleven a side is the full game, from under 14s up to adults.",
      "Fifteen shapes to pick from, or drag the markers into your own. Bench cover, subs to the minute, and the call-up in one tap.",
    ],
    cta: "Open the board in 11-a-side",
  },
];

/** Labels on every format page. */
export const FORMAT_PAGE = {
  shapesHeading: "Shapes on the board",
  agesHeading: "Who plays it",
  ages: (labels: readonly string[]) => labels.join(", "),
  others: "Other formats",
} as const;
