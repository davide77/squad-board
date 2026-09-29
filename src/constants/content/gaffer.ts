import type { VoiceKey } from "./landing";

// What the Gaffer says on the board, in the way the coach picked (brand.md, "The
// Gaffer, two ways"). Loud where it is seen once (first run, empty states), half
// volume on toasts, where the consequence is always said plainly. Buttons, labels,
// the team sheet and anything about deleting data stay straight and live in board.ts.
// Players are never gendered, nobody is the punchline, and "Coach" comes up at most
// once per screen.

export interface GafferLines {
  /** Above the squad box on the start screen. */
  readonly welcome: string;
  /** After the coach picks this gaffer under Your club. */
  readonly hello: string;

  // Toasts
  readonly teamPicked: string;
  readonly exampleLoaded: string;
  readonly sub: (on: string, off: string) => string;
  readonly cantPickInjured: (n: string) => string;
  readonly cantPickUnavailable: (n: string) => string;
  readonly cantPickNotCalledUp: (n: string) => string;
  readonly markedInjured: (n: string) => string;
  readonly fitAgain: (n: string) => string;
  readonly markedUnavailable: (n: string) => string;
  readonly availableAgain: (n: string) => string;
  readonly calledUp: (n: string) => string;
  readonly notCalledUp: (n: string) => string;
  readonly removed: (n: string) => string;
  readonly restored: (n: string) => string;
  readonly newMatchday: string;
  readonly sorted: string;
  readonly everyoneCalledUp: string;
  readonly callUpsCleared: string;
  readonly lineupSaved: string;
  readonly strongestSaved: string;
  readonly noStrongest: string;
  readonly backToStrongest: string;
  readonly strongestWithChanges: (changes: number) => string;
  readonly loaded: (name: string) => string;
  readonly shapeReset: string;
  readonly copied: string;
  readonly copyFailed: string;
  readonly pictureSaved: string;
  readonly pictureFailed: string;
  readonly exported: string;
  readonly imported: string;
  readonly unreadable: string;
  readonly notASquad: string;

  // Empty states
  readonly benchEmpty: string;
  readonly poolEmpty: string;
  readonly subsEmpty: string;
  readonly savedEmpty: string;
  readonly nobody: string;

  // Confirmations
  readonly matchUnderway: string;
}

const changesWord = (n: number) => `${n} change${n === 1 ? "" : "s"}`;

export const GAFFER: Readonly<Record<VoiceKey, GafferLines>> = {
  hairdryer: {
    welcome: "Right. Squad in first.",
    hello: "Right. I'll keep it short.",

    teamPicked: "Team's picked. Tap a position to change it.",
    exampleLoaded: "Example team. Tap a position.",
    sub: (on, off) => `${off} off. ${on} on. Good.`,
    cantPickInjured: (n) => `${n}'s injured. Pick someone else.`,
    cantPickUnavailable: (n) => `${n}'s not available. Pick someone else.`,
    cantPickNotCalledUp: (n) => `${n}'s not called up. Tick them first.`,
    markedInjured: (n) => `${n}'s injured. Get well, ${n}.`,
    fitAgain: (n) => `${n}'s fit. Tick the box.`,
    markedUnavailable: (n) => `${n}'s out this week.`,
    availableAgain: (n) => `${n}'s available. Tick the box.`,
    calledUp: (n) => `${n}'s in.`,
    notCalledUp: (n) => `${n}'s not called up.`,
    removed: (n) => `${n} removed. They're under Rest of squad.`,
    restored: (n) => `${n}'s back. Not called up yet.`,
    newMatchday: "New matchday. Who's in?",
    sorted: "Sorted by number.",
    everyoneCalledUp: "Everyone's in.",
    callUpsCleared: "Call-ups cleared. Who's in?",
    lineupSaved: "Saved. Good.",
    strongestSaved: "Strongest XI saved.",
    noStrongest: "No strongest XI yet. Save one.",
    backToStrongest: "Strongest XI. Good.",
    strongestWithChanges: (n) => `Strongest XI. ${changesWord(n)}.`,
    loaded: (name) => `${name} loaded.`,
    shapeReset: "Shape reset.",
    copied: "Copied. Send it.",
    copyFailed: "This browser won't copy. Not you. Try another.",
    pictureSaved: "Picture saved. Send it.",
    pictureFailed: "No picture in this browser. Not you. Try another.",
    exported: "Squad file saved. Keep it safe.",
    imported: "Squad loaded. Good.",
    unreadable: "Can't read that file. Try another.",
    notASquad: "Wrong file. You want the one ending in -board.json.",

    benchEmpty: "Bench is empty. Drop players here.",
    poolEmpty: "Everyone's got a job.",
    subsEmpty: "No changes. Clock first.",
    savedEmpty: "Nothing saved. Have a plan B.",
    nobody: "That's your lot. Make it work.",

    matchUnderway: "Match is on. Back to the strongest XI anyway?",
  },
  arm: {
    welcome: "Welcome, Coach. Let's get your squad in.",
    hello: "Lovely. I'm in your corner.",

    teamPicked: "There's your team. Tap any position to change it.",
    exampleLoaded: "Here's an example team. Tap any position to try it.",
    sub: (on, off) => `${on}'s on. Great shift, ${off}.`,
    cantPickInjured: (n) => `${n}'s injured, so not today. Pick someone else.`,
    cantPickUnavailable: (n) => `${n} can't make it this week. Pick someone else.`,
    cantPickNotCalledUp: (n) => `${n} isn't called up yet. Tick them in the squad first.`,
    markedInjured: (n) => `${n} marked injured. Get well soon, ${n}.`,
    fitAgain: (n) => `${n}'s fit again. Great news. Tick the box to call them up.`,
    markedUnavailable: (n) => `${n} marked unavailable. See them next week.`,
    availableAgain: (n) => `${n}'s available again. Tick the box to call them up.`,
    calledUp: (n) => `${n}'s in. Good to have them.`,
    notCalledUp: (n) => `${n}'s not called up this week.`,
    removed: (n) => `${n} removed. You'll find them under Rest of squad.`,
    restored: (n) => `${n}'s back in the squad. Tick them when they're in.`,
    newMatchday: "New matchday, Coach. Fresh start. Tick who's in.",
    sorted: "Sorted by shirt number. Neat as a new kit.",
    everyoneCalledUp: "Everyone who's fit is called up.",
    callUpsCleared: "Call-ups cleared. Tick who's in this week.",
    lineupSaved: "Line-up saved. Lovely stuff.",
    strongestSaved: "Saved as your strongest XI. That's the one to beat.",
    noStrongest: "No strongest XI saved yet. Pick your best side and save it.",
    backToStrongest: "Back to your strongest XI.",
    strongestWithChanges: (n) => `Back to your strongest XI, with ${changesWord(n)} for who's missing.`,
    loaded: (name) => `${name} loaded. Let's have a look.`,
    shapeReset: "Shape reset to 4-3-3 spacing.",
    copied: "Team sheet copied. Go on, send it.",
    copyFailed: "This browser won't let us copy. Not your fault. Try another browser.",
    pictureSaved: "Line-up picture downloaded. Ready for the parents' group.",
    pictureFailed: "This browser won't make the picture. Not your fault. Try another one.",
    exported: "Squad file downloaded. Keep it somewhere safe.",
    imported: "Squad file loaded. Everyone's here.",
    unreadable: "That file wouldn't open. Try another one.",
    notASquad: "That's not a squad file. Happens to the best of us. Look for the one ending in -board.json.",

    benchEmpty: "Nobody on the bench yet. Drop players here to name your subs.",
    poolEmpty: "Everyone called up has a job. Nobody left out.",
    subsEmpty: "No changes yet. Start the clock, and we'll note the minute of every one.",
    savedEmpty: "Nothing saved yet. A plan B never hurt anybody.",
    nobody: "That's everyone who's fit. You'll make it work.",

    matchUnderway: "There's a match on, Coach. Back to the strongest XI anyway?",
  },
};
