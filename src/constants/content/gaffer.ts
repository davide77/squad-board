import type { Phase } from "@/constants/football";
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
  /** After the coach picks this gaffer under Customise your club. */
  readonly hello: string;
  /** What the Gaffer says at the top of each step until something happens. */
  readonly stepPick: string;
  readonly stepMatch: string;
  readonly stepFull: string;

  // Toasts
  readonly teamPicked: string;
  readonly exampleLoaded: string;
  readonly sub: (on: string, off: string) => string;
  /** A change for an injury: the player coming off is marked injured and does not go back on the bench. */
  readonly subInjured: (on: string, off: string) => string;
  /** The final whistle: the clock stops and the board moves on to sending. */
  readonly fullTime: string;
  readonly halfTime: string;
  /** The clock: kick-off, a stop, back on, and back to before kick-off. */
  readonly kickOff: string;
  readonly clockPaused: string;
  readonly clockResumed: string;
  readonly clockCleared: string;
  /** Undo: the change that can be taken back, when nothing else was said about it, and taking it back. */
  readonly changed: string;
  readonly undone: string;
  readonly secondHalf: string;
  /** Player of the match picked, or taken off. */
  readonly potm: (n: string) => string;
  readonly potmNone: string;
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
  /** `plan` is "starting line-up", "strongest team" or "strongest XI", from the age group and format. */
  readonly planSaved: (plan: string, competitive: boolean) => string;
  readonly noPlan: (plan: string) => string;
  readonly backToPlan: (plan: string) => string;
  readonly planWithChanges: (plan: string, changes: number) => string;
  readonly ageSet: (age: string, format: string, development: boolean) => string;
  readonly formatSet: (format: string) => string;
  readonly markedTraining: (n: string) => string;
  readonly trainingCleared: (n: string) => string;
  readonly cantPickTraining: (n: string) => string;
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
  /** A squad opened from a link sent from another device. */
  readonly arrived: string;
  readonly linkBroken: string;

  // Fair time, under 11s and younger, once the clock has started
  readonly waiting: (first: string, more: number) => string;
  readonly everyonePlayed: string;

  // Empty states
  readonly benchEmpty: string;
  readonly poolEmpty: string;
  readonly subsEmpty: string;
  readonly savedEmpty: string;
  readonly nobody: string;

  // Confirmations
  readonly matchUnderway: (plan: string) => string;
}

/** Who talks on a new board when the coach has not picked: a kind word for the young ones, the hairdryer once results count. */
export const PHASE_GAFFER: Readonly<Record<Phase, VoiceKey>> = { development: "arm", competitive: "hairdryer" };

const changesWord = (n: number) => `${n} change${n === 1 ? "" : "s"}`;
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const GAFFER: Readonly<Record<VoiceKey, GafferLines>> = {
  hairdryer: {
    welcome: "Right. Squad in first.",
    hello: "Right. I'll keep it short.",
    stepPick: "Who's in? Tick them.",
    stepMatch: "Tap a player. Bring the bench on.",
    stepFull: "Score in. Then send it.",

    teamPicked: "Team's picked. Tap a position to change it.",
    exampleLoaded: "Example team. Tap a position.",
    sub: (on, off) => `${off} off. ${on} on. Good.`,
    subInjured: (on, off) => `Get well, ${off}. ${on}, you're on.`,
    fullTime: "Full time. Send the result.",
    halfTime: "Half time. Keep it short.",
    kickOff: "Clock's on. Get stuck in.",
    clockPaused: "Clock stopped.",
    clockResumed: "Back on.",
    clockCleared: "Back to before kick-off. Same team.",
    changed: "Changed.",
    undone: "Undone.",
    secondHalf: "Second half. Go again.",
    potm: (n) => `${n}. Deserved.`,
    potmNone: "Nobody this week. Fair enough.",
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
    planSaved: (plan) => `${capital(plan)} saved.`,
    noPlan: (plan) => `No ${plan} yet. Save one.`,
    backToPlan: (plan) => `${capital(plan)}. Good.`,
    planWithChanges: (plan, n) => `${capital(plan)}. ${changesWord(n)}.`,
    ageSet: (age, format, development) => (development ? `${age}. ${format}. Everyone plays.` : `${age}. ${format}. Play to win.`),
    formatSet: (format) => `${format}. Sorted.`,
    markedTraining: (n) => `${n} missed training. Not in the squad.`,
    trainingCleared: (n) => `${n}'s cleared. Tick the box.`,
    cantPickTraining: (n) => `${n} missed training. Not this week.`,
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
    arrived: "Squad's here. Good.",
    linkBroken: "Link's cut short. Send it again.",

    waiting: (first, more) => (more ? `${first} and ${more} more haven't been on.` : `${first} hasn't been on yet.`),
    everyonePlayed: "Everyone's played. Good.",

    benchEmpty: "Bench is empty. Drop players here.",
    poolEmpty: "Everyone's got a job.",
    subsEmpty: "No changes. Clock first.",
    savedEmpty: "Nothing saved. Have a plan B.",
    nobody: "That's your lot. Make it work.",

    matchUnderway: (plan) => `Match is on. Back to the ${plan} anyway?`,
  },
  arm: {
    welcome: "Welcome, Coach. Let's get your squad in.",
    hello: "Lovely. I'm in your corner.",
    stepPick: "Tick who's in this week, Coach.",
    stepMatch: "Tap a player on the pitch to make a change. I'll keep the minutes.",
    stepFull: "Put the score in, pick a star, and let the parents know.",

    teamPicked: "There's your team. Tap any position to change it.",
    exampleLoaded: "Here's an example team. Tap any position to try it.",
    sub: (on, off) => `${on}'s on. Great shift, ${off}.`,
    subInjured: (on, off) => `${off}'s done for today. ${on}, this is your moment.`,
    fullTime: "Full time. Well played, everyone. Let's tell the parents.",
    halfTime: "Half time. Water, a word, and back out.",
    kickOff: "And we're off. Enjoy it, Coach.",
    clockPaused: "Clock paused. No rush.",
    clockResumed: "Back under way.",
    clockCleared: "Back to the team you started with. A fresh start.",
    changed: "Done that for you.",
    undone: "No harm done. It's back as it was.",
    secondHalf: "Second half. Here we go again, team.",
    potm: (n) => `${n}. What a game they had.`,
    potmNone: "No award this week. That's fine too.",
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
    planSaved: (plan, competitive) =>
      competitive ? `Saved as your ${plan}. That's the one to beat.` : `Saved as your ${plan}. Everyone knows where they start.`,
    noPlan: (plan) => `No ${plan} saved yet. Set one up and save it.`,
    backToPlan: (plan) => `Back to your ${plan}.`,
    planWithChanges: (plan, n) => `Back to your ${plan}, with ${changesWord(n)} for who's missing.`,
    ageSet: (age, format, development) =>
      development ? `${age}, ${format}. Everyone gets a go.` : `${age}, ${format}. Let's go and win it.`,
    formatSet: (format) => `${format} it is. The team's been moved across.`,
    markedTraining: (n) => `${n} missed training, so not this week. Back at it next session.`,
    trainingCleared: (n) => `${n}'s back in contention. Tick the box to call them up.`,
    cantPickTraining: (n) => `${n} missed training this week. Pick someone else.`,
    loaded: (name) => `${name} loaded. Let's have a look.`,
    shapeReset: "Shape reset to 4-3-3 spacing.",
    copied: "Copied. Go on, send it.",
    copyFailed: "This browser won't let us copy. Not your fault. Try another browser.",
    pictureSaved: "Line-up picture downloaded. Ready for the parents' group.",
    pictureFailed: "This browser won't make the picture. Not your fault. Try another one.",
    exported: "Squad file downloaded. Keep it somewhere safe.",
    imported: "Squad file loaded. Everyone's here.",
    unreadable: "That file wouldn't open. Try another one.",
    notASquad: "That's not a squad file. Happens to the best of us. Look for the one ending in -board.json.",
    arrived: "Your squad's arrived. Everyone made the trip.",
    linkBroken: "That link didn't come through in one piece. Send it again from the other device.",

    waiting: (first, more) =>
      more ? `${first} and ${more} more are still waiting for a go.` : `${first}'s still waiting for a go.`,
    everyonePlayed: "Everyone's had a go. Proud of that.",

    benchEmpty: "Nobody on the bench yet. Drop players here to name your subs.",
    poolEmpty: "Everyone called up has a job. Nobody left out.",
    subsEmpty: "No changes yet. Start the clock, and we'll note the minute of every one.",
    savedEmpty: "Nothing saved yet. A plan B never hurt anybody.",
    nobody: "That's everyone who's fit. You'll make it work.",

    matchUnderway: (plan) => `There's a match on, Coach. Back to the ${plan} anyway?`,
  },
};
