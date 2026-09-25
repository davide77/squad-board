// Every string on the board. Players are never gendered: squads can be boys, girls or mixed.

export type NameStyle = "first" | "initials" | "full" | "last";

export const NAME_STYLES: readonly { readonly key: NameStyle; readonly label: string }[] = [
  { key: "first", label: "First names" },
  { key: "initials", label: "Initials" },
  { key: "full", label: "Full names" },
  { key: "last", label: "Surnames" },
];

/** Shown where a player has no shirt number, or a position is empty on the team sheet. */
export const NO_NUMBER = "-";

/** Icon glyphs. Each control that uses one carries its own aria-label. */
export const GLYPHS = {
  close: "\u00D7",
  grip: "\u22EE\u22EE",
} as const;

export const HEADER = {
  teamLabel: "Team name",
  teamPlaceholder: "Team name",
  fixtureLabel: "Fixture",
  fixturePlaceholder: "Opponent, venue, kick-off",
  clockLabel: "Match clock",
  start: "Start",
  pause: "Pause",
  resume: "Resume",
  reset: "Reset",
} as const;

export const SHAPE = {
  heading: "Shape",
  xiCount: (n: number) => `${n} of 11 on`,
  formationLabel: "Formation",
  movePositions: "Move positions",
  doneMoving: "Done moving",
  resetShape: "Reset shape",
  hint: "Tap a position to see who can play there and swap them in. Drag works too.",
  moveHint: "Drag the markers anywhere on the pitch. Each one takes its role from where it sits.",
  teamLabel: "Team",
  saveLineup: "Save line-up",
  lineupSaved: "Line-up saved",
  setStrongest: "Set as strongest XI",
  backToStrongest: "Back to strongest XI",
  newMatchday: "New matchday",
  clearPitch: "Clear the pitch",
  shirtsLabel: "Shirts",
  hideCover: "Hide cover names",
  showCover: "Show cover names",
  slotEmpty: (role: string) => `${role}, empty`,
  slotFilled: (role: string, name: string) => `${role}: ${name}`,
} as const;

export const ZONES = {
  bench: "Bench",
  benchEmpty: "Drop players here to name them as substitutes.",
  pool: "Rest of squad",
  poolEmpty: "Everyone called up is on the pitch or on the bench.",
  poolCount: (n: number, removed: number) => (removed ? `${n} + ${removed} removed` : String(n)),
  removed: "Removed from the squad",
  restore: (name: string) => `Bring ${name} back`,
  deleteForGood: (name: string) => `Delete ${name} for good`,
} as const;

export const SQUAD = {
  heading: "Squad",
  count: (n: number) => `${n} ${n === 1 ? "player" : "players"}`,
  startTitle: "Getting started",
  startSteps: [
    "Put your club or team name at the top of the page.",
    "Add your players below, with their shirt numbers.",
    "Open Edit on each one to set the positions they play.",
    "Tick who is called up, then tap a position on the pitch to pick your team.",
  ],
  pickedCount: (picked: number, total: number, injured: number, away: number) =>
    `${picked} of ${total} called up` +
    (injured ? `, ${injured} injured` : "") +
    (away ? `, ${away} unavailable` : ""),
  callUpEveryone: "Call up everyone",
  clearCallUps: "Clear call-ups",
  sortByNumber: "Sort by number",
  hint: "Tick who is called up this week. Tap any shirt number to change it. Injured and unavailable are set under Edit.",
  empty: "No players yet. Add the squad below.",
  noPosition: "no position set",
  status: {
    xi: "On",
    bench: "Bench",
    pool: "Called up",
    out: "Not called up",
    inj: "Injured",
    una: "Unavailable",
  },
  reorder: (name: string) => `Reorder ${name}. Drag, or use the up and down arrow keys.`,
  calledUp: (name: string) => `${name} called up`,
  shirtFor: (name: string) => `Shirt number for ${name}`,
  edit: "Edit",
  editLabel: (name: string) => `Edit ${name}`,
  positionsLabel: "Positions this player can cover",
  shirtLabelHint: "Shirt label, used when shirts are labelled by initials",
  shirtLabelPlaceholder: "Shirt label",
  markInjured: "Mark injured",
  markFit: "Mark fit again",
  markUnavailable: "Mark unavailable",
  markAvailable: "Mark available",
  remove: "Remove from squad",
  done: "Done",
  addNumberLabel: "Shirt number",
  addNumberPlaceholder: "No.",
  addNameLabel: "Player name",
  addNamePlaceholder: "Player name",
  add: "Add",
  warnDupes: (nums: readonly string[]) =>
    `Shirt ${nums.join(" and ")} ${nums.length > 1 ? "are each on two players." : "is on two players."}`,
  warnNoPosition: (names: readonly string[]) =>
    `${names.join(", ")} ${names.length > 1 ? "have" : "has"} no position set.`,
} as const;

export const SUBS = {
  heading: "Substitutions",
  empty: "Start the clock, then bring a bench player on. Every change is logged with the minute.",
  for: "for",
} as const;

export const SAVED = {
  heading: "Saved line-ups",
  empty: "Save a line-up to come back to it. Useful for a plan A and a plan B.",
  nameLabel: "Name this line-up",
  namePlaceholder: "e.g. Plan A, press high",
  save: "Save XI",
  load: "Load",
  delete: (name: string) => `Delete ${name}`,
  defaultName: (formation: string) => `${formation} line-up`,
} as const;

export const SHEET = {
  heading: "Team sheet",
  hint: "Copies the XI with cover names, the bench and any substitutions, ready to paste into a message.",
  copy: "Copy team sheet",
  fallbackTitle: "Team sheet",
  bench: "Bench",
  notCalledUp: "Not called up",
  injured: "Injured",
  unavailable: "Unavailable",
  subs: "Substitutions",
} as const;

export const CLUB = {
  heading: "Your club",
  colourLabel: "Colour",
  backupLabel: "Backup",
  export: "Export squad file",
  import: "Import squad file",
  importLabel: "Squad file to import",
  wipe: "Start again",
  hint: "Everything is stored in this browser on this device. Export a file to move it to another phone or laptop, or to keep a copy before a season change.",
  stored: "Saved in this browser on this device",
  noStorage: "This browser is blocking storage, so nothing will be saved. Export your squad before you close it.",
  fileSuffix: "-board.json",
  fileFallback: "squad",
} as const;

export const PICKER = {
  title: (role: string, name: string | null) => `${role} · ${name ?? "empty"}`,
  subFilled: (first: string) => `Pick a replacement, or move ${first} off.`,
  subEmpty: "Pick who starts here.",
  suited: (role: string) => `Suited to ${role}`,
  canCover: (role: string) => `Could fill in at ${role}`,
  outOfPosition: "Out of position",
  elsewhere: "Already on the pitch, swap positions",
  notCalledUp: "Not called up",
  injured: "Injured",
  unavailable: "Unavailable",
  nobody: "Nobody else is available.",
  toBench: "Move to the bench",
  toPool: "Take out of the squad list",
  close: "Close",
  badgeBench: "Bench",
  badgeOn: "On",
} as const;

export const CONFIRM = {
  newMatchday:
    "Start a new matchday? Call-ups are cleared and you pick the squad again. Injuries and unavailability stay as they are.",
  deleteForGood: (name: string) => `Delete ${name} for good? This cannot be undone.`,
  replaceSquad: "Replace the squad on this board with the one in the file?",
  wipe: "Clear this board and start again? Everything on it is deleted. Export a file first if you want a copy.",
  matchUnderway: "A match is under way. Go back to your strongest XI anyway?",
} as const;

export const TOASTS = {
  injured: (n: string) => `${n} is injured`,
  unavailable: (n: string) => `${n} is unavailable`,
  notCalledUp: (n: string) => `${n} is not called up`,
  calledUp: (n: string) => `${n} is called up`,
  markedInjured: (n: string) => `${n} marked injured`,
  fitAgain: (n: string) => `${n} is fit, tick the box to call them up`,
  markedUnavailable: (n: string) => `${n} marked unavailable`,
  availableAgain: (n: string) => `${n} is available, tick the box to call them up`,
  removed: (n: string) => `${n} removed, find them under Rest of squad`,
  restored: (n: string) => `${n} is back in the squad, not called up`,
  newMatchday: "New matchday, tick who is called up",
  sorted: "Sorted by shirt number",
  everyoneCalledUp: "Everyone available is called up",
  callUpsCleared: "Call-ups cleared, tick who is in",
  lineupSaved: "Line-up saved",
  strongestSaved: "Saved as your strongest XI",
  noStrongest: "No strongest XI saved yet",
  strongestWithChanges: (n: number) => `Strongest XI, with ${n} change${n > 1 ? "s" : ""}`,
  backToStrongest: "Back to your strongest XI",
  loaded: (name: string) => `Loaded ${name}`,
  shapeReset: "Shape reset to 4-3-3 spacing",
  copied: "Team sheet copied",
  copyFailed: "Copy not available here",
  exported: "Squad file downloaded",
  unreadable: "That file could not be read",
  notASquad: "That does not look like a squad file",
  imported: "Squad file loaded",
} as const;
