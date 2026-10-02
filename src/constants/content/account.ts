// Every string about signing in and the account page. The site speaks Hairdryer (brand.md);
// labels, buttons and anything about access stay straight.

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

/** "Add another team" on the board, under Customise your club. One team is free; more is the club waitlist for now. */
export const MORE_TEAMS = {
  label: "Teams",
  button: "Add another team",
  close: "Close",
  line: "One team's free. More than one is coming for clubs.",
  prompt: "Want it first?",
  cta: "Leave your email.",
} as const;

export const FOOTER_SIGN_IN = "Sign in";
