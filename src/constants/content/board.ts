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
  /** An unnamed board, straight off the start screen, asks for its name here. */
  teamPlaceholder: "Name your team",
  clockLabel: "Match clock",
  start: "Start",
  pause: "Pause",
  resume: "Resume",
  reset: "Reset",
} as const;

export const SHAPE = {
  heading: "Shape",
  xiCount: (n: number, size: number) => `${n} of ${size} on`,
  formationLabel: "Formation",
  movePositions: "Move positions",
  doneMoving: "Done moving",
  resetShape: "Reset shape",
  hint: "Tap a position to see who can play there and swap them in. Drag works too.",
  moveHint: "Drag the markers anywhere on the pitch. Each one takes its role from where it sits.",
  teamLabel: "Team",
  saveLineup: "Save line-up",
  lineupSaved: "Line-up saved",
  setPlan: (plan: string) => `Set as ${plan}`,
  backToPlan: (plan: string) => `Back to ${plan}`,
  copySheet: "Copy team sheet",
  newMatchday: "New matchday",
  clearPitch: "Clear the pitch",
  shirtsLabel: "Shirts",
  hideCover: "Hide bench cover",
  showCover: "Show bench cover",
  slotEmpty: (role: string) => `${role}, empty`,
  /** Starts with what the slot shows, number then name, so voice control matches it. */
  slotFilled: (num: number | string, name: string, role: string) => `${num} ${name}, ${role}`,
} as const;

export const ZONES = {
  bench: "Bench",
  pool: "Rest of squad",
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
    trn: "Missed training",
  },
  reorder: (name: string) => `Reorder ${name}. Drag, or use the up and down arrow keys.`,
  calledUp: (name: string) => `${name} called up`,
  shirtFor: (name: string) => `Shirt number for ${name}`,
  edit: "Edit",
  editLabel: (name: string) => `Edit ${name}`,
  numberLabel: "No.",
  nameLabel: "Name",
  positionsLabel: "Positions this player can cover",
  sideLabel: "Which side",
  sides: [
    { key: "L", label: "Left" },
    { key: null, label: "Either" },
    { key: "R", label: "Right" },
  ],
  shirtLabelHint: "Shirt label, used when shirts are labelled by initials",
  shirtLabelPlaceholder: "Shirt label",
  markInjured: "Mark injured",
  markFit: "Mark fit again",
  markUnavailable: "Mark unavailable",
  markAvailable: "Mark available",
  markTraining: "Missed training",
  /** Match time so far, after the positions, once the clock has started. */
  minutes: (m: number) => `${m} min`,
  clearTraining: "Was at training",
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
  /** Replaces the list of names when most of a fresh squad has no positions yet. */
  noPositionCount: (n: number) => `${n} players have no position yet. Add them under Edit and the bench cover fills in.`,
} as const;

/** The first screen on an empty board. */
export const START = {
  heading: "Create your team",
  intro:
    "Pick the age group and paste your squad, one player per line. Shirt numbers and positions are optional. Name the team and add a badge on the board.",
  ageLabel: "Age group",
  agePrompt: "Choose an age group",
  ageOption: (label: string, format: string) => `${label} \u00b7 ${format}`,
  ageHint: "Sets the format, and whether everyone gets equal time. You can change both later.",
  countNeedsAge: "Choose an age group first.",
  squadLabel: "Your squad",
  squadPlaceholder: "1 Alex GK\n2 Charlie\n3 Sam\n4 Jamie\n5 Riley\n...",
  squadHint: "Copy it straight from WhatsApp, your notes or a spreadsheet.",
  countNone: "Add at least one player.",
  count: (n: number, starting: number) =>
    n <= starting
      ? `${n} ${n === 1 ? "player" : "players"}, all starting.`
      : `${n} players. ${starting} start, ${n - starting} on the bench.`,
  countCapped: (max: number) => `Only the first ${max} are used.`,
  submit: "Pick my team",
  lookHeading: "Just having a look?",
  example: "Try the example team",
  importHint: "Moving from another phone? Import the squad file you exported.",
  privacy: "No account, no sign-up. Your squad stays on this device.",
} as const;

/** The cards at the top of the board that help keep it safe. */
export const KEEP = {
  homeTitle: "Keep your board safe",
  homeBody: "Add Gafferboard to your home screen. It opens like an app, and your phone won't tidy the board away.",
  homeIos: "Tap Share, then Add to Home Screen.",
  homeOther: "Open your browser menu, then Add to Home screen.",
  homeInstall: "Add to home screen",
  backupTitle: "Keep a copy",
  /** The first backup card, the first time the board opens after a match. */
  backupAfterMatchTitle: "Match done. Keep a copy?",
  backupNever: "You haven't saved a squad file yet. Keep one somewhere safe in case this phone is lost or reset.",
  backupOld: "Your last squad file is a few weeks old. Save a fresh one to keep it up to date.",
  later: "Not now",
} as const;

/** The made-up team a coach can try the board with. The players come from the landing demo. */
export const EXAMPLE = {
  team: "Ashford Juniors",
  /** Eleven players in the example, so an 11-a-side age group. */
  age: "U14",
  fixture: "v Northgate, league",
  /** Times and kit for the example's squad message. No address: a made-up team has no ground. */
  match: { kickoff: "10:30", meet: "09:45", kit: "Pink kit" },
  note: "This is an example team. Play with it as much as you like.",
  ownTeam: "Start my own team",
  /** The example plays in its own colour, so it never looks like the coach's board. A name from KIT_COLOURS. */
  kit: "Pink",
  /** The sheet the example opens in, over the start screen. */
  sheetTag: "Example team",
  sheetNote: "Made up, so tap, drag and sub as much as you like. Close it and your own team is right where you left it.",
  close: "Close example",
} as const;

export const SUBS = {
  heading: "Substitutions",
  for: "for",
} as const;

export const SAVED = {
  heading: "Saved line-ups",
  nameLabel: "Name this line-up",
  namePlaceholder: "e.g. Plan A, press high",
  save: "Save plan",
  load: "Load",
  delete: (name: string) => `Delete ${name}`,
  defaultName: (formation: string) => `${formation} line-up`,
} as const;

export const SHEET = {
  heading: "Team sheet",
  hint: "Copies the team with bench cover, the bench and any substitutions, ready to paste into a message.",
  /** The last line of the copied sheet, when the coach leaves it on. How other coaches find Gafferboard. */
  credit: "Made with gafferboard.com",
  creditLabel: "End with \u201cMade with gafferboard.com\u201d",
  copy: "Copy team sheet",
  whatsapp: "Send team sheet on WhatsApp",
  sharePicture: "Share line-up picture",
  pictureHint: "A picture of the pitch for the parents' group. Names show the way your shirts are labelled.",
  pictureFooter: "gafferboard.com",
  /** Between the fixture, the day and the kick-off on the line-up picture. */
  pictureJoin: " \u00b7 ",
  fallbackTitle: "Team sheet",
  bench: "Bench",
  subs: "Substitutions",
} as const;

/** The call-up for the parents' group. It goes out in the coach's name, so it stays straight. */
export const MESSAGE = {
  heading: "This week's match",
  hint: "All optional. What you fill in goes at the top of the squad message and the team sheet. It clears when you start a new matchday.",
  squadHint: "The call-up for the parents' group. Only the players you called up are named.",
  opponentLabel: "Opponent",
  opponentPlaceholder: "e.g. v City Select, friendly",
  dateLabel: "Date",
  kickoffLabel: "Kick-off",
  meetLabel: "Meet",
  kitLabel: "Kit",
  kitPlaceholder: "e.g. Blue kit",
  addressLabel: "Address",
  addressPlaceholder: "Ground name, street, postcode",
  addressHint: "Parents get a Google Maps link with it.",
  mapCheck: "Check it on the map",
  whatsapp: "Send squad on WhatsApp",
  copy: "Copy squad message",
  preview: "See the message",
  /** Lines of the message itself. */
  kickoff: "Kick-off: ",
  meet: "Meet: ",
  address: "Address: ",
  map: "Map: ",
  squad: "Matchday squad:",
  nobody: "Squad to follow.",
  confirm: "Please confirm availability.",
} as const;

export const CLUB = {
  heading: "Your club",
  gaffer: "Gaffer",
  ageLabel: "Age group",
  formatLabel: "Format",
  ageNotSet: "Not set",
  colourLabel: "Colour",
  badgeLabel: "Badge",
  badgeAdd: "Add badge",
  badgeChange: "Change",
  badgeRemove: "Remove",
  badgeInput: "Club badge image",
  badgeUnreadable: "That image didn't load. Try a PNG, JPG or SVG.",
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
  noPosition: "No position set",
  missedTraining: "Missed training",
  elsewhere: "Already on the pitch, swap positions",
  notCalledUp: "Not called up",
  injured: "Injured",
  unavailable: "Unavailable",
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
} as const;

// Toasts, empty states and the match-under-way check are said by the Gaffer: see gaffer.ts.
