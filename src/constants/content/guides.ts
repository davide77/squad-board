// The guides: the questions coaches search for that are bigger than one format. Each answers one
// question in full, cites the FA where a rule is involved, and opens the board at the end.
// The site speaks Hairdryer; anything that is a rule, a number or the team sheet stays straight.
import { FA_SOURCES } from "@/constants/content/formats";
import { ROUTES, boardOnFormat } from "@/constants/routes";

export interface GuideTable {
  readonly head: readonly string[];
  readonly rows: readonly (readonly string[])[];
  /** Read out before the table, and its caption. */
  readonly caption: string;
}

export interface GuideSection {
  readonly heading: string;
  readonly body: readonly string[];
  readonly table?: GuideTable;
  /** A block shown as it is sent, such as the example call-up. */
  readonly example?: readonly string[];
}

export interface GuideLink {
  readonly name: string;
  readonly url: string;
}

export interface Guide {
  /** The address, such as "fair-playing-time". */
  readonly slug: string;
  readonly title: string;
  /** Its name in the footer, short enough to sit beside the format links. */
  readonly short: string;
  readonly description: string;
  readonly heading: string;
  readonly intro: readonly string[];
  readonly cta: { readonly label: string; readonly href: string };
  readonly sections: readonly GuideSection[];
  /** Where the facts come from. Empty when the page states no rule. */
  readonly sources: readonly GuideLink[];
  /** Other pages on the site, as further reading. */
  readonly related: readonly GuideLink[];
}

const FORMATS_LINKS = {
  five: { name: "5-a-side formations", url: "/5-a-side" },
  seven: { name: "7-a-side formations", url: "/7-a-side" },
  nine: { name: "9-a-side formations", url: "/9-a-side" },
  eleven: { name: "11-a-side formations", url: "/11-a-side" },
} as const;

/** The guide slugs, so other pages can link to one by name. */
export const GUIDE_SLUGS = {
  formatsByAge: "formats-by-age",
  fairPlayingTime: "fair-playing-time",
  teamSheet: "team-sheet",
} as const;

const PRIVACY_LINK: GuideLink = { name: "Privacy and safety", url: ROUTES.privacy };

export const GUIDES: readonly Guide[] = [
  {
    slug: GUIDE_SLUGS.formatsByAge,
    title: "Youth football formats by age, 2026-27",
    short: "Formats by age",
    description:
      "Which format each age group plays from 2026-27 under the FA's FutureFit changes: 3v3 at under 7s up to 11-a-side at under 14s, and what changed.",
    heading: "Formats by age. 2026-27.",
    intro: [
      "From the 2026-27 season the FA moved the formats down an age. Under 7s play 3v3. Under 8s and under 9s play 5-a-side. Under 10s and under 11s play 7-a-side. Under 12s and under 13s play 9-a-side. Under 14s and up play 11-a-side.",
      "Smaller games, played for longer. That's the idea.",
    ],
    cta: { label: "Open the board", href: ROUTES.board },
    sections: [
      {
        heading: "Which format does each age group play?",
        body: ["The FA formats from 2026-27, and what each age group played before."],
        table: {
          caption: "FA match formats by age group, 2026-27 and before",
          head: ["Age group", "From 2026-27", "Before", "Leagues"],
          rows: [
            ["Under 7s", "3v3, no keepers", "5-a-side", "No"],
            ["Under 8s", "5-a-side", "5-a-side", "No"],
            ["Under 9s", "5-a-side", "7-a-side", "No"],
            ["Under 10s", "7-a-side", "7-a-side", "No"],
            ["Under 11s", "7-a-side", "9-a-side", "No"],
            ["Under 12s", "9-a-side", "9-a-side", "Yes"],
            ["Under 13s", "9-a-side", "11-a-side", "Yes"],
            ["Under 14s and up", "11-a-side", "11-a-side", "Yes"],
          ],
        },
      },
      {
        heading: "What changed in 2026-27?",
        body: [
          "The FA calls it FutureFit. It was announced in December 2024, with the detail in February 2025, and it starts this season.",
          "Three things. Under 7s start on 3v3, with no keepers and no subs. Every format after that is played a year longer. And 11-a-side starts at under 14s, not under 13s.",
          "Under 9s, under 11s and under 13s feel it most. They stay on the smaller format another season.",
        ],
      },
      {
        heading: "Can my team play a smaller format?",
        body: [
          "Yes. The FA formats are the most a team can play at that age, not the least. A smaller format is always allowed.",
          "Your league may set its own. Check with them.",
        ],
      },
      {
        heading: "Which age group is my team?",
        body: [
          "It goes by age on 31 August, the start of the season. A player who is 9 on 31 August plays under 10s that season.",
        ],
      },
      {
        heading: "When do results count?",
        body: [
          "Up to under 11s there are no leagues. From under 8s, teams can play in up to three trophy events a season. Everyone plays.",
          "From under 12s, results count and league tables start. Coaches play to win.",
        ],
      },
    ],
    sources: [FA_SOURCES.formats, FA_SOURCES.futureFit],
    related: [FORMATS_LINKS.five, FORMATS_LINKS.seven, FORMATS_LINKS.nine, FORMATS_LINKS.eleven],
  },
  {
    slug: GUIDE_SLUGS.fairPlayingTime,
    title: "Fair playing time in youth football",
    short: "Fair minutes",
    description:
      "How to give every player fair minutes in grassroots football: what the FA advises, a simple sum for each player's minutes, and a worked 7-a-side plan.",
    heading: "Fair minutes. Every player.",
    intro: [
      "Every coach says everyone gets a game. Then it's 1-1 with ten minutes left and the same five are on.",
      "Plan the minutes before kick-off. Log the subs as you make them. Check the totals at full time.",
    ],
    cta: { label: "Open the board in 7-a-side", href: boardOnFormat("7v7") },
    sections: [
      {
        heading: "What does the FA say about playing time?",
        body: [
          "For under 7s to under 11s, the FA's Mini-Soccer Handbook says all players should get equal playing time where possible, with at least half of every game for every player as best practice.",
          "That is advice, not a rule. There is no national rule for under 12s and up. Some county FAs and many clubs have their own policy, often equal minutes over the season. Ask yours.",
        ],
      },
      {
        heading: "How many minutes should each player get?",
        body: [
          "One sum. Match minutes, times the players on the pitch, divided by the squad.",
          "A 7-a-side game is 50 minutes. Seven on the pitch makes 350 minutes to share. Ten in the squad is 35 minutes each. Twelve in the squad is about 29.",
          "The keeper counts. Rotate them too.",
        ],
      },
      {
        heading: "A minutes plan for 7-a-side with ten players",
        body: [
          "Cut the 50 minutes into five blocks of 10. Seven players in each block makes 35 places. Ten players can't share 35 evenly, so five play four blocks and five play three.",
          "Swap the two groups next week. Over two games, everyone is level.",
        ],
        table: {
          caption: "A 7-a-side minutes plan: five blocks of 10 minutes, ten players",
          head: ["Group", "Blocks", "Minutes"],
          rows: [
            ["Five players", "4 of 5", "40"],
            ["Five players", "3 of 5", "30"],
            ["Squad total", "35 places", "350"],
          ],
        },
      },
      {
        heading: "How do I keep track on matchday?",
        body: [
          "Not on the back of a teamsheet. Start the clock, and make each sub on the board as it happens. It logs the minute.",
          "Minutes played shows every player's total as you go. You see who needs the second half before half time, not after the final whistle.",
        ],
      },
      {
        heading: "What about when results count?",
        body: [
          "From under 12s it gets harder. Your strongest side matters, and so does keeping a squad together.",
          "Set a floor and stick to it, such as half a game for anyone who trained all week. Tell the parents what it is before the season, not after a defeat.",
        ],
      },
    ],
    sources: [FA_SOURCES.formats],
    related: [FORMATS_LINKS.five, FORMATS_LINKS.seven, { name: "Youth football formats by age", url: `/${GUIDE_SLUGS.formatsByAge}` }],
  },
  {
    slug: GUIDE_SLUGS.teamSheet,
    title: "Sending the team sheet to parents",
    short: "Team sheet",
    description:
      "What to put in the call-up for the parents' WhatsApp group, what to leave out, and an example message. Kick-off, meet time, ground, kit and the squad.",
    heading: "The team sheet. Sent.",
    intro: [
      "The parents need five things. Where, when, what to wear, who's in, and whether they can make it.",
      "Everything else stays with you.",
    ],
    cta: { label: "Open the board", href: ROUTES.board },
    sections: [
      {
        heading: "What goes in the call-up?",
        body: [
          "The team and the date. The opposition, home or away, and league, cup or friendly. The kit. Studs or moulds, if the surface matters.",
          "Kick-off and meet time. The ground, with a map link. Then who's in, and a line asking parents to confirm.",
        ],
      },
      {
        heading: "What stays out?",
        body: [
          "The shape, the bench and who's injured. That's for you and the coaches.",
          "Who wasn't picked stays out too. A parent should never find out from the group chat.",
        ],
      },
      {
        heading: "An example call-up",
        body: ["This is the shape of the message the board sends. The names are made up. Bold lines show bold in WhatsApp."],
        example: [
          "*Ashford Juniors U10 - Saturday 14 November*",
          "v Northgate (home, league)",
          "Home kit: red shirts, white shorts, red socks.",
          "Grass pitch: studs or moulds.",
          "",
          "Kick-off: *10:30*",
          "Meet: *09:45*",
          "Address: Ashford Recreation Ground, Station Road",
          "Map: https://www.google.com/maps/search/?api=1&query=Ashford%20Recreation%20Ground%2C%20Station%20Road",
          "",
          "*Matchday squad:*",
          "Alex",
          "Charlie",
          "Ellis",
          "Frankie",
          "Jamie",
          "Remi",
          "Riley",
          "Sam",
          "",
          "Please confirm availability.",
        ],
      },
      {
        heading: "First names, or initials?",
        body: [
          "Most squads are children. Use first names in the team's own parents' group. Use initials if anyone outside the club is in it.",
          "The board sends names whichever way you set them. One switch.",
        ],
      },
      {
        heading: "WhatsApp, email or copy?",
        body: [
          "All three. WhatsApp opens with the message ready to send to the group. Email puts it in a new message with the subject filled in. Copy puts it on your clipboard for anything else.",
          "After the whistle, the result goes the same way.",
        ],
      },
    ],
    sources: [],
    related: [PRIVACY_LINK, { name: "Fair playing time in youth football", url: `/${GUIDE_SLUGS.fairPlayingTime}` }],
  },
];

/** Labels on every guide page. */
export const GUIDE_PAGE = {
  sourcesHeading: "Where the rules come from",
  sourcesNote: "Checked against the FA's own pages. Leagues and county FAs can add their own rules.",
  relatedHeading: "Read next",
  /** The footer list of guides. */
  footer: "Guides",
} as const;
