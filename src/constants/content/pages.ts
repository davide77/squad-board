// Every string on the small pages around the board: privacy, credits and the 404.
// Anything about data keeps it straight, whichever voice the coach picked (brand.md).
import { ANALYTICS_CONFIG } from "@/constants/config";

export interface PageSection {
  readonly heading: string;
  readonly body: readonly string[];
}

export const PAGE_SHELL = {
  home: "Gafferboard home",
} as const;

/** The club waitlist line in the footer. The site speaks Hairdryer; the field and button stay straight. */
export const WAITLIST = {
  prompt: "Running a club?",
  cta: "Join the waitlist.",
  label: "Email address for the club waitlist",
  placeholder: "Your email",
  button: "Join",
  sending: "Joining",
  joined: "Noted. We'll be in touch when clubs are ready.",
  invalid: "That email doesn't look right. Check it and go again.",
  failed: "That didn't go through. Try again in a minute.",
} as const;

export const FOOTER_LINKS = {
  label: "About Gafferboard",
  privacy: "Privacy and safety",
  credits: "Credits",
  contact: "Contact",
  madeBy: "Made by",
  at: "at",
} as const;

export const MAKER = {
  name: "Davide Domenghini",
  /** The studio Gafferboard is made under. */
  studio: "Origin Social",
  site: "originsocialclub.com",
  url: "https://originsocialclub.com",
  /** The Gafferboard mailbox, set up on SiteGround on 2026-09-30. */
  email: "davide@gafferboard.com",
  /** Who the maker is on the touchline. Confirmed by Davide: the team is Ayat U15, coaching for more than seven years. */
  bio: "A grassroots football manager for more than seven years, now running Ayat U15.",
  role: "Grassroots football manager",
} as const;

/** The board's events, in words, for the privacy page. Keep in step with ANALYTICS_EVENTS in config.ts. */
const EVENTS_COUNTED =
  "On the board we also count a few moments: a board started or opened again, the first use of the board each week, the match clock started, half time and full time, and a call-up, result or picture sent. With them go the age group, how it went out (WhatsApp, a copy or shared) and roughly how long since the last visit, such as \"7 to 13 days\" or \"1 week\". To tell that gap, the time and week of your last visit are kept in this browser and never leave it. No names, no team details and nothing else from your board are sent.";

export const PRIVACY = {
  title: "Privacy and safety",
  description:
    "How Gafferboard looks after your squad: no accounts, no cookies, no advertising. The board stays in the browser on your device.",
  updated: "Last updated 30 September 2026",
  intro:
    "Gafferboard has no accounts and no database. Your squad lives in the browser on your device, and nothing about your players is sent to us.",
  sections: [
    {
      heading: "What is stored, and where",
      body: [
        "The board keeps your team name, fixture, players' names, shirt numbers, positions, injuries, saved line-ups and substitutions. All of it is saved in this browser on this device.",
        "The messages to the parents and the line-up picture are made on your device too. They only go where you send them.",
      ],
    },
    {
      heading: "What we do not collect",
      body: [
        "No account and no sign-up. No email address, unless you choose to join the club waitlist. No cookies, no advertising and no trackers that follow you to other sites. The fonts are served from gafferboard.com, so the page does not call out to anyone else.",
        "Like any website, our host, Vercel, sees what every browser sends when a page loads, such as your IP address, and keeps it briefly in its logs for security. What is on your board is never part of that.",
      ],
    },
    {
      heading: "What we count",
      body: [
        "We count visits, so we know how many coaches use Gafferboard. Vercel Web Analytics records which page was opened, the site you came from, your country and the kind of device and browser. It sets no cookie and does not know who you are: a visitor is a code that resets every day.",
        // Only said while the board's events are switched on, so the page never claims more than is counted.
        ...(ANALYTICS_CONFIG.events ? [EVENTS_COUNTED] : []),
        "Nothing on your board is part of it. Not the team, not a player, not the message you send.",
      ],
    },
    {
      heading: "The club waitlist",
      body: [
        "If you run a club and leave your email address in the footer, we keep that address, when you left it and the page you were on. It is stored in a database run by Supabase, and only we can read it.",
        "We use it for one thing: to tell you when Gafferboard for clubs is ready. It is never shared or sold. To be taken off the list, get in touch and we delete it.",
      ],
    },
    {
      heading: "Most squads are children",
      body: [
        "Treat the board like any team list. Use first names or initials where you can. The Shape panel can show players by initials, and the line-up picture follows it.",
        "Send the call-up and the result only to people who should see them, such as the team's parents group. The line-up picture is for the coaches.",
      ],
    },
    {
      heading: "Keep your device safe",
      body: [
        "Anyone who can open this browser on your device can see the board. Lock your phone with a passcode. On a shared or club computer, use Start again under Your club when you have finished.",
        "A squad file holds every name on the board. Keep it somewhere private, and do not post it in a group chat.",
      ],
    },
    {
      heading: "Deleting your data",
      body: [
        "Delete a player and they are gone from the board. Start again, under Your club, clears the whole board. Clearing this site's data in your browser settings does the same.",
        "Squad files you exported are yours to delete. We never had a copy.",
      ],
    },
  ] satisfies readonly PageSection[],
  contactHeading: "Questions",
  contact: `Gafferboard is made by ${MAKER.name}. Email`,
} as const;

export const CREDITS = {
  title: "Credits",
  description: `Gafferboard is designed and built by ${MAKER.name}, a grassroots football manager who runs Ayat U15.`,
  heading: "Credits",
  makerLabel: "Designed and built by",
  makerLink: `Visit ${MAKER.site}`,
  builtHeading: "Built with",
  built: [
    { name: "Next.js and React", note: "The app" },
    { name: "Framer Motion", note: "The movement" },
    { name: "Saira Condensed and Barlow", note: "The type, under the SIL Open Font Licence" },
    { name: "Vercel", note: "Hosting" },
  ],
  thanks: "Made for every coach who has picked a team in the rain.",
} as const;

export const NOT_FOUND = {
  title: "Page not found",
  heading: "Wrong pitch",
  body: "Happens to us all. The board is this way.",
  cta: "Back to the board",
} as const;
