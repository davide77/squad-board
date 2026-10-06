// Every string about signing in and the account page. The site speaks Hairdryer (brand.md);
// labels, buttons and anything about access stay straight.

import type { IconName } from "@/constants/icons";

export const ACCOUNT = {
  title: "Sign in",
  titleSignedIn: "Your account",
  description: "Sign in to Gafferboard with a link by email. No password.",
  signedOut: {
    heading: "Sign in.",
    lede: "Email in. Link out. Tap it on this phone. No password.",
    note: "Your squad stays on this device. Signing in only tells us your email address.",
    label: "Email address",
    placeholder: "Your email",
    button: "Email me a link",
    sending: "Sending",
    sent: (email: string) => `Link sent to ${email}. Check your inbox. It works for 15 minutes.`,
    spam: "Nothing there? Check spam. Still nothing? Send it again.",
    again: "Send it again",
    invalid: "That email doesn't look right. Check it and go again.",
    failed: "That didn't send. Try again in a minute.",
  },
  link: {
    expired: "That link has run out. Send a new one.",
    invalid: "That link doesn't work. Send a new one.",
  },
  signedIn: {
    heading: "Signed in.",
    welcome: "You're in. Good.",
    as: "Signed in as",
    planLabel: "Plan",
    plan: "Free. One team.",
    planNote: "More than one team is coming for clubs. You're on this phone for six months, then it asks again.",
    board: "Open the board",
    signOut: "Sign out",
    signingOut: "Signing out",
  },
} as const;

/** The email with the link. Anything about access stays straight. */
export const SIGN_IN_EMAIL = {
  subject: "Your Gafferboard sign-in link",
  heading: "Your sign-in link",
  body: "Tap the button on the phone or computer you want to sign in on. The link works for 15 minutes.",
  button: "Sign in to Gafferboard",
  ignore: "Didn't ask for this? Ignore it. Nobody can sign in without this email.",
} as const;

/** One line of what a second team gets, with its icon. */
export interface TeamBenefit {
  readonly icon: IconName;
  readonly text: string;
}

const TEAM_BENEFITS: readonly TeamBenefit[] = [
  { icon: "squad", text: "Each team keeps its own squad, kits and line-ups." },
  { icon: "yourClub", text: "Switch teams with one tap, from the top of the board." },
  { icon: "teamSheet", text: "Call-ups and team sheets for every side, sent the same way." },
  { icon: "phone", text: "Your teams on your phone and your laptop, kept in step." },
];

/**
 * Add a team: the button beside Customise your club, the row in the club sheet, and the sheet both open.
 * One team is free for good. More than one comes with the club plan, so for now the sheet is the waitlist.
 */
export const MORE_TEAMS = {
  label: "Teams",
  button: "Add a team",
  heading: "Add a team",
  hint: "Run every side you coach from one board.",
  close: "Close",
  benefitsHeading: "What you get",
  benefits: TEAM_BENEFITS,
  free: "Your first team stays free. For good.",
  when: "Coming for the 2027-28 season. Paid once a season, not every month.",
  prompt: "Want it first?",
  cta: "Leave your email and we'll tell you the day it's ready.",
} as const;

export const FOOTER_SIGN_IN = "Sign in";
