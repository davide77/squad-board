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
  /** The second footer list: every format page, so each one is a link away from every page. */
  formats: "Formats",
  privacy: "Privacy and safety",
  terms: "Terms",
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
  /**
   * Who the maker is on the touchline. Confirmed by Davide on 20 October 2026: coached his son's team from
   * under 9s at Cheam Sports FC, now manages the under 15s at Ayat; his dad played. On 3 November 2026:
   * holds coaching badges and safeguarding training. No year count, so it never goes stale. Never name the
   * child, and never publish a postal address.
   */
  bio: "A grassroots coach who took one team from under 9s at Cheam Sports FC and now manages the under 15s at Ayat. Holds coaching badges and safeguarding training. Grew up in football, learning the game from a dad who played it.",
  role: "Grassroots football manager",
} as const;

/** The board's events, in words, for the privacy page. Keep in step with ANALYTICS_EVENTS in config.ts. */
const EVENTS_COUNTED =
  "On the board we also count a few moments: a board started or opened again, the first use of the board each week, the match clock started, half time and full time, a call-up, result or picture sent, and the founding coach card shown, joined or closed. With them go the age group, how it went out (WhatsApp, a copy or shared) and roughly how long since the last visit, such as \"7 to 13 days\" or \"1 week\". To tell that gap, the time and week of your last visit are kept in this browser and never leave it. No names, no team details and nothing else from your board are sent.";

export const PRIVACY = {
  title: "Privacy and safety",
  description:
    "How Gafferboard looks after your squad: it stays in the browser on your device and is never sent to us. No adverts, and an account only if you want one.",
  /** Takes the date from PAGE_UPDATED.privacy in seo.ts, so the page and the sitemap agree. */
  updated: (date: string) => `Last updated ${date}`,
  intro:
    "Gafferboard keeps no database of squads. Your squad lives in the browser on your device, and nothing about your players is sent to us. Signing in is optional, and only tells us your email address.",
  sections: [
    {
      heading: "What is stored, and where",
      body: [
        "The board keeps your team name, fixture, players' names, shirt numbers, positions, injuries, saved line-ups and substitutions. All of it is saved in this browser on this device.",
        "The messages to the parents and the line-up picture are made on your device too. They only go where you send them.",
        "Send the squad, under Customise your club, makes a link with the board inside it so you can open it on your phone. The squad sits in the part of the link after the #, which browsers never send to a website, so it goes only where you send the link.",
      ],
    },
    {
      heading: "What we do not collect",
      body: [
        "You do not need an account. No email address, unless you choose to sign in, join the club waitlist or become a founding coach. No advertising and no trackers that follow you to other sites. The only cookie is the one that keeps you signed in, and only if you sign in. The fonts are served from gafferboard.com, so the page does not call out to anyone else.",
        "Like any website, our host, Vercel, sees what every browser sends when a page loads, such as your IP address, and keeps it briefly in its logs for security. What is on your board is never part of that.",
      ],
    },
    {
      heading: "What we count",
      body: [
        "We count visits, so we know how many coaches use Gafferboard. Vercel Web Analytics records which page was opened, the site you came from, your country and the kind of device and browser. It sets no cookie and does not know who you are: a visitor is a code that resets every day.",
        "Vercel Speed Insights measures how fast each page loads on your device, such as how long the main picture takes to appear and whether anything jumps as it loads. With it go the page, your country and the kind of device and browser. It sets no cookie either.",
        // Only said while the board's events are switched on, so the page never claims more than is counted.
        ...(ANALYTICS_CONFIG.events ? [EVENTS_COUNTED] : []),
        "Nothing on your board is part of it. Not the team, not a player, not the message you send.",
      ],
    },
    {
      heading: "Signing in",
      body: [
        "Signing in is optional. You give your email address and we email you a link through Brevo, the service we send email with. The link works for 15 minutes.",
        "Tap it, press Sign in, and this browser keeps one cookie that says which email address is signed in, for up to six months. It is needed to keep you signed in, so it needs no banner. It holds nothing else, and it is signed so it cannot be changed.",
        "We keep no account database. So that each link works only once, and signing out really signs you out, we keep two small notes with Upstash, the service we store them with: that a link was used, for 15 minutes, and when you last signed out, for six months. Neither holds your email address, only a scrambled code made from it.",
        "Your squad is not sent anywhere when you sign in: it stays on this device. Sign out on the account page and the cookie is deleted, and you are signed out on every device that used your address.",
      ],
    },
    {
      heading: "The club waitlist",
      body: [
        "If you leave your email address for the club waitlist, in the footer or under Customise your club on the board, we keep that address and when you left it. It is stored with Brevo, the service we send email with, and only we can see it.",
        "We use it for one thing: to tell you when Gafferboard for clubs is ready. It is never shared or sold. To be taken off the list, get in touch and we delete it.",
      ],
    },
    {
      heading: "Founding coaches",
      body: [
        "Coaches who used Gafferboard in its first weeks see a thank-you card on their board, once. If you leave your email address there, we keep that address and when you left it, with Brevo, on a separate list only we can see.",
        "We use it to offer you a founding price when the season pass comes and to show you new things first. It is never shared or sold. Every email has a link to leave the list, or get in touch and we delete it.",
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
        "Anyone who can open this browser on your device can see the board. Lock your phone with a passcode. On a shared or club computer, use Start again under Customise your club when you have finished.",
        "A squad file holds every name on the board. Keep it somewhere private, and do not post it in a group chat.",
      ],
    },
    {
      heading: "Who looks after your data",
      body: [
        `Gafferboard is made and run by ${MAKER.name}, who decides what is kept and why. That makes ${MAKER.name} responsible for the email addresses held for sign-in, the club waitlist and founding coaches.`,
        "Nothing on your board is held by us, so there is nothing of it to hand over or delete on our side.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        `Under UK data protection law you can ask for a copy of what we hold about you, ask us to correct it, or ask us to delete it. Email ${MAKER.email} and we answer within a month.`,
        "If you are not happy with the answer, you can complain to the Information Commissioner's Office at ico.org.uk.",
      ],
    },
    {
      heading: "Deleting your data",
      body: [
        "Delete a player and they are gone from the board. Start again, under Customise your club, clears the whole board. Clearing this site's data in your browser settings does the same.",
        "Squad files you exported are yours to delete. We never had a copy.",
      ],
    },
  ] satisfies readonly PageSection[],
  contactHeading: "Questions",
  contact: `Gafferboard is made by ${MAKER.name}. Email`,
} as const;

/** The terms of use. Straight voice throughout: these are the rules of using the site. */
export const TERMS = {
  title: "Terms of use",
  description:
    "The terms for using Gafferboard: a free board for grassroots coaches. Your squad stays yours and on your device, so keep a copy. Governed by English law.",
  /** Takes the date from PAGE_UPDATED.terms in seo.ts, so the page and the sitemap agree. */
  updated: (date: string) => `Last updated ${date}`,
  intro: "These terms cover using Gafferboard at gafferboard.com. Using the site means you accept them. They are short, and written to be read.",
  sections: [
    {
      heading: "Who we are",
      body: [`Gafferboard is made and run by ${MAKER.name}. Get in touch at ${MAKER.email}.`],
    },
    {
      heading: "What Gafferboard is",
      body: [
        "A free web app for grassroots football coaches: the squad, call-ups, formation, bench and substitutions on one screen. The board lives in the browser on your device.",
        "We may change, add or remove features, and we may stop the service. Where we can, we say so on the site first.",
      ],
    },
    {
      heading: "Your squad is your responsibility",
      body: [
        "What you put on the board is yours. You are responsible for having permission to record players' names and details, and for who you send the call-up, the result and the line-up picture to.",
        "Most squads are children. Follow your club's safeguarding policy, and use first names or initials where you can.",
      ],
    },
    {
      heading: "Keep a copy",
      body: [
        "The board is stored in this browser only. Clearing the site's data, losing your phone or a browser fault can lose it, and we cannot get it back, because we never had it.",
        "Export a squad file under Customise your club to keep a copy, and keep the file somewhere private.",
      ],
    },
    {
      heading: "Fair use",
      body: [
        "Do not use Gafferboard to break the law, to harass anyone, or to try to break, overload or get round the site's security.",
      ],
    },
    {
      heading: "No guarantees",
      body: [
        "Gafferboard is provided as it is. We work to keep it running and correct, but we do not promise it will always be available or free of errors.",
        "The formats and FA rules on the site are a guide. Your league or county FA can set its own, so check with them.",
        "As far as the law allows, we are not liable for any loss from using Gafferboard. Nothing in these terms limits any liability that the law does not allow us to limit.",
      ],
    },
    {
      heading: "Paid extras",
      body: [
        "Gafferboard is free. If a paid season pass comes, its price and terms will be shown before anyone pays.",
      ],
    },
    {
      heading: "Privacy",
      body: ["How we handle email addresses, and what we count, is on the privacy and safety page."],
    },
    {
      heading: "Changes to these terms",
      body: ["We may update these terms. The date at the top says when they last changed."],
    },
    {
      heading: "The law",
      body: ["These terms are governed by the law of England and Wales, and the courts of England and Wales deal with any dispute."],
    },
  ] satisfies readonly PageSection[],
} as const;

export const CREDITS = {
  title: "Credits",
  description: `Gafferboard is designed and built by ${MAKER.name}, a grassroots football coach who manages the under 15s at Ayat.`,
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
