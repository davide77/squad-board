// Every string on the small pages around the board: privacy, credits and the 404.
// Anything about data keeps it straight, whichever voice the coach picked (brand.md).

export interface PageSection {
  readonly heading: string;
  readonly body: readonly string[];
}

export const PAGE_SHELL = {
  home: "Gafferboard home",
} as const;

export const FOOTER_LINKS = {
  label: "About Gafferboard",
  privacy: "Privacy and safety",
  credits: "Credits",
  madeBy: "Made by",
  at: "at",
} as const;

export const MAKER = {
  name: "Davide Domenghini",
  /** The studio Gafferboard is made under. */
  studio: "Origin Social",
  site: "originsocialclub.com",
  url: "https://originsocialclub.com",
  /** Who the maker is on the touchline. Confirmed by Davide: the team is Ayat U15. */
  bio: "A grassroots football manager for many years, now running Ayat U15.",
  role: "Grassroots football manager",
} as const;

export const PRIVACY = {
  title: "Privacy and safety",
  description:
    "How Gafferboard looks after your squad: no accounts, no cookies, no tracking. The board stays in the browser on your device.",
  updated: "Last updated 28 September 2026",
  intro:
    "Gafferboard has no accounts and no database. Your squad lives in the browser on your device, and nothing about your players is sent to us.",
  sections: [
    {
      heading: "What is stored, and where",
      body: [
        "The board keeps your team name, fixture, players' names, shirt numbers, positions, injuries, saved line-ups and substitutions. All of it is saved in this browser on this device.",
        "The team sheet and the line-up picture are made on your device too. They only go where you send them.",
      ],
    },
    {
      heading: "What we do not collect",
      body: [
        "No account, no sign-up and no email address. No cookies, no analytics and no advertising trackers. The fonts are served from gafferboard.com, so the page does not call out to anyone else.",
        "Like any website, our host, Vercel, sees what every browser sends when a page loads, such as your IP address, and keeps it briefly in its logs for security. What is on your board is never part of that.",
      ],
    },
    {
      heading: "Most squads are children",
      body: [
        "Treat the board like any team list. Use first names or initials where you can. The Shape panel can show players by initials, and the line-up picture follows it.",
        "Share the team sheet and the picture only with people who should see them, such as the team's parents group.",
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
  contact: `Gafferboard is made by ${MAKER.name}. Get in touch through`,
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
