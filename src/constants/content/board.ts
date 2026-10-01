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

export const UNDO = {
  button: "Undo",
} as const;

/** The Gaffer's line at the top of each step. */
export const GAFFER_LINE = {
  kicker: "The Gaffer",
} as const;

/** The three matchday steps along the top of the board. Numbered, so the order reads at a glance. */
export const STEPS = {
  label: "Matchday steps",
  items: [
    { key: "pick", n: "1", label: "Pick the team", short: "Pick" },
    { key: "match", n: "2", label: "Matchday", short: "Match" },
    { key: "full", n: "3", label: "Full time", short: "Full time" },
  ],
  /** The ways on from Pick the team. */
  startMatch: "Start the match",
  backToMatch: "Back to the match",
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
  hideCover: "Hide bench cover",
  showCover: "Show bench cover",
  slotEmpty: (role: string) => `${role}, empty`,
  /** Starts with what the slot shows, number then name, so voice control matches it. */
  slotFilled: (num: number | string, name: string, role: string) => `${num} ${name}, ${role}`,
} as const;

/** The right-hand column of Pick the team: the strongest side, kick-off, and starting over. */
export const PICK = {
  /** "Strongest XI", from planName, which knows the age group. */
  strongestHeading: (plan: string) => plan.charAt(0).toUpperCase() + plan.slice(1),
  planSame: (plan: string, shape: string) => `This is your ${plan}, in ${shape}.`,
  planChanged: (plan: string) => `Changed from your ${plan}.`,
  planNone: (plan: string) => `No ${plan} saved yet. Pick it, then save it here.`,
  saveStrongest: "Save as strongest",
  backToStrongest: "Back to strongest",
  startOver: "Start over",
  newMatchday: "New matchday",
  clearPitch: "Clear the pitch",
  newMatchdayText:
    "Clears the call-ups, the clock, the subs, the score and this week's match details. The squad, injuries and your strongest side stay.",
  clearPitchText: "Takes everyone off the pitch. The squad stays.",
  newMatchdayConfirm: "Start a new matchday",
  clearPitchConfirm: "Clear the pitch",
  keep: "Keep it",
  backConfirm: "Go back to it",
} as const;

export const ZONES = {
  bench: "Bench",
  pool: "Rest of squad",
  removed: "Removed from the squad",
  bringBack: "Bring back",
  restore: (name: string) => `Bring ${name} back`,
  deleteForGood: (name: string) => `Delete ${name} for good`,
  deleteConfirm: "Delete for good",
  keep: "Keep them",
} as const;

export const SQUAD = {
  heading: "Squad",
  /** With a position picked on the pitch, the list sorts itself by who plays there. */
  placeHint: (role: string) => `${role} picked. Players who play there are at the top. Tap one to put them in, or press Escape.`,
  /** The list in three runs, each under a small divider: who starts, who is on the bench, and the rest. */
  groups: [
    { key: "xi", label: "Starting" },
    { key: "bench", label: "Bench" },
    { key: "rest", label: "Rest of squad" },
  ],
  playsThere: "Plays there",
  atAPush: "At a push",
  putIn: (name: string, role: string) => `Put ${name} in at ${role}`,
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
    xi: "Starting",
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
  sides: [
    { key: "L", label: "Left" },
    { key: null, label: "Either" },
    { key: "R", label: "Right" },
  ],
  shirtLabelHint: "Shirt label, used when shirts are labelled by initials",
  shirtLabelPlaceholder: "Shirt label",
  /** Match time so far, after the positions, once the clock has started. */
  minutes: (m: number) => `${m} min`,
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
  intro: "One player per line. Numbers and positions if you've got them.",
  ageLabel: "Age group",
  agePrompt: "Choose an age group",
  ageOption: (label: string, format: string) => `${label} \u00b7 ${format}`,
  /** Opens the age list again when the age came from the homepage. */
  ageChange: "Change",
  ageChangeLabel: "Change the age group",
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
  /** Under the button: what comes after. */
  afterSubmit: "Name the team and add a badge on the board.",
  lookHeading: "Just having a look?",
  example: "Try the example team",
  importHint: "Moving from another phone? Import the squad file you exported.",
  privacy: "No account needed. Your squad stays on this device.",
} as const;

/** Asked once, the first time an unnamed team's sheet is about to go out. */
export const NAME_FIRST = {
  label: "Name your team first",
  line: "Name your team first? Parents see it at the top.",
  nameIt: "Name it",
  sendAnyway: "Send anyway",
  /** Once the name is in: the sheet the coach meant to send is still waiting. */
  named: "Named. Send it.",
  send: "Send",
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
  fixture: "v Northgate",
  competition: "league",
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

/** The drawer that edits one player, from the Edit button in the squad list. */
export const DRAWER = {
  label: "Edit player",
  newPlayer: "New player",
  close: "Close",
  numberClash: (num: string, names: string) => `Shirt ${num} is also on ${names}.`,
  positionsHeading: "Positions",
  positionsHint: "Tap every position they can play. The first one you tap is their main position.",
  main: "Main",
  sideHint: "Which side for full-back and wing",
  listedAs: "Listed as",
  weekHeading: "This week",
  statuses: [
    { key: "available", label: "Available" },
    { key: "inj", label: "Injured" },
    { key: "una", label: "Unavailable" },
    { key: "trn", label: "Missed training" },
  ],
  done: "Done",
  remove: "Remove from squad",
  removeText: (first: string) => `Takes ${first} out of the squad and off the pitch. You can bring them back from the list.`,
  removeConfirm: "Remove",
  keep: "Keep them",
} as const;

/** Matchday: the clock, the bench, the change in progress, and the log. */
export const MATCH = {
  clockLabel: "Match clock",
  running: "Clock running",
  firstHalf: "First half",
  secondHalf: "Second half",
  atBreak: "Half time",
  halfTime: "Half time",
  startSecondHalf: "Second half",
  /** The bench tray docked under the pitch on a phone. */
  trayFor: (off: string) => `On for ${off}`,
  trayHint: "Bench · tap a player on the pitch first",
  trayLabel: (name: string, off: string) => `${name}, on for ${off}`,
  stopped: "Clock stopped",
  notStarted: "Not started",
  kickOff: "Kick off",
  pause: "Pause",
  resume: "Resume",
  fullTime: "Full time",
  reset: "Reset",
  resetText: "Puts the clock back to 0:00 and clears everyone's minutes. The subs stay in the log.",
  resetConfirm: "Reset the clock",
  keep: "Keep it",
  benchHeading: "Bench",
  benchHint: "Tap a player on the pitch, then bring someone on.",
  benchFor: (off: string) => `Who's coming on for ${off}?`,
  on: "On",
  onFor: (off: string) => `On for ${off}`,
  /** A called-up player who is not on the bench, still free to come on. */
  calledUp: "Called up",
  injuredHeading: "Injured",
  injured: "Injured",
  changeTitle: "Make a change",
  changeHint: "Tap the player coming off.",
  offTitle: (name: string, mins: number) => `${name} · ${mins}' played`,
  offHint: "Pick who comes on from the bench.",
  offInjuredHint: "Marked injured. They won't go back on the bench.",
  cancel: "Cancel",
  played: (mins: number) => `${mins}' played`,
  minute: (m: number) => `${m}'`,
  subOn: "on",
  subOff: "off",
  subInjured: "injured",
  minutesHeading: "Minutes played",
  noChanges: "No changes yet.",
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
  /** The last line of the copied sheet, when the coach leaves it on. How other coaches find Gafferboard. */
  credit: "Made with gafferboard.com",
  creditLabel: "End with \u201cMade with gafferboard.com\u201d",
  pictureFooter: "gafferboard.com",
  /** Between the fixture, the day and the kick-off on the line-up picture. */
  pictureJoin: " \u00b7 ",
  /** Heads a message or picture from a board with no team name yet. */
  fallbackTitle: "Matchday",
  bench: "Bench",
  subs: "Substitutions",
} as const;

/** The Full time step: the result for the parents, or the picture for the coaches. */
export const FULL = {
  kindsHeading: "What to send",
  kinds: [
    {
      key: "result",
      when: "For the parents",
      title: "The result",
      body: "The full-time score and the player of the match. Worth passing on.",
    },
    {
      key: "picture",
      when: "For the coaches",
      title: "Line-up picture",
      body: "The shape and who started. Not for the parents' group.",
    },
  ],
  resultHeading: "The result",
  fullTime: "Full time",
  us: (team: string) => team.trim() || "Us",
  them: (opponent: string) => opponent || "Them",
  minus: (side: string) => `One fewer for ${side}`,
  plus: (side: string) => `One more for ${side}`,
  potmLabel: "Player of the match",
  potmNobody: "Nobody this week",
  namesLabel: "Names",
  send: "Send the result",
  copy: "Copy",
  pictureHeading: "For the coaches",
  pictureBody: "This picture shows the shape and who started. Send it to your assistant or the club's coaches' group, not the parents.",
  share: "Share the picture",
  shareHint: "Opens your phone's share sheet. On a laptop it downloads a PNG.",
  pictureAlt: "The line-up picture, for the coaches.",
  pictureMaking: "Drawing the picture",
  /** Lines of the result message. */
  resultTitle: "Full time",
  potmLine: (name: string) => `Player of the match: ${name}`,
} as const;

/** The call-up for the parents, under Pick the team: who's in, when, where and what to wear. */
export const PARENTS = {
  heading: "Message to the parents",
  hint: "Who's in, when, where and what to wear. No shape, no bench, no injuries.",
  previewLabel: "Preview",
  namesHint: "Use initials for groups with people outside the club.",
  whatsapp: "Send on WhatsApp",
  copy: "Copy",
} as const;

/** League, cup or friendly: the kind of game, after the opponent in the message. */
export const COMPETITIONS = [
  { key: "league", label: "League" },
  { key: "cup", label: "Cup" },
  { key: "friendly", label: "Friendly" },
  { key: "tournament", label: "Tournament" },
] as const;

/** The call-up for the parents' group. It goes out in the coach's name, so it stays straight. */
export const MESSAGE = {
  heading: "This week's match",
  hint: "All optional. What you fill in heads the call-up and the result. It clears when you start a new matchday.",
  opponentLabel: "Opponent",
  opponentPlaceholder: "e.g. v City Select",
  competitionLabel: "League, cup or friendly",
  competitionNone: "Not set",
  dateLabel: "Date",
  kickoffLabel: "Kick-off",
  meetLabel: "Meet",
  venueLabel: "Home or away",
  venues: [
    { key: "home", label: "Home" },
    { key: "away", label: "Away" },
  ],
  /** "Change the kits under Your club", with Your club a link down to the panel. */
  venueHint: "Change the kits under",
  venueHintLink: "Your club",
  /** After the fixture in the message: "v Northgate (away, league)". Then the kit line under it. */
  fixtureTag: (parts: readonly string[]) => (parts.length ? ` (${parts.join(", ")})` : ""),
  /** "Home kit: black and yellow stripes, black shorts, black socks." */
  kitLine: (venue: "home" | "away", words: string) => `${venue === "home" ? "Home" : "Away"} kit: ${words}.`,
  surfaceLabel: "Surface",
  surfaces: [
    { key: "grass", label: "Grass" },
    { key: "astro", label: "Astro" },
  ],
  /** Under the kit in the message: the boots to bring. */
  surfaceLine: { grass: "Grass pitch: studs or moulds.", astro: "Astro pitch: moulds or astro boots, no metal studs." },
  addressLabel: "Address",
  addressPlaceholder: "Ground name, street, postcode",
  addressHint: "Parents get a Google Maps link with it.",
  mapCheck: "Check it on the map",
  /** Lines of the message itself. */
  kickoff: "Kick-off: ",
  meet: "Meet: ",
  address: "Address: ",
  map: "Map: ",
  squad: "Matchday squad:",
  nobody: "Squad to follow.",
  confirm: "Please confirm availability.",
} as const;

/**
 * The home and away strips, and how a parent hears them. Colours read lower case in a sentence:
 * "red shirts with white sleeves, white shorts, red socks".
 */
export const KIT = {
  sides: [
    { key: "home", label: "Home kit" },
    { key: "away", label: "Away kit" },
  ],
  edit: "Change",
  done: "Done",
  /** Labels for each part, in the order the editor shows them. */
  parts: { shirt: "Shirt", pattern: "Pattern", second: "With", shorts: "Shorts", socks: "Socks" },
  /** "Home kit, shirt: Black" for a swatch's name. */
  swatchLabel: (side: string, part: string, colour: string) => `${side}, ${part}: ${colour}`,
  /** The shirt, in the words a coach would say it. */
  shirtWords: {
    plain: (shirt: string) => `${shirt} shirts`,
    stripes: (shirt: string, second: string) => `${shirt} and ${second} stripes`,
    hoops: (shirt: string, second: string) => `${shirt} and ${second} hoops`,
    halves: (shirt: string, second: string) => `${shirt} and ${second} halves`,
    sleeves: (shirt: string, second: string) => `${shirt} shirts with ${second} sleeves`,
  },
  shortsWords: (colour: string) => `${colour} shorts`,
  socksWords: (colour: string) => `${colour} socks`,
  join: ", ",
} as const;

export const CLUB = {
  heading: "Your club",
  gaffer: "Gaffer",
  ageLabel: "Age group",
  formatLabel: "Format",
  ageNotSet: "Not set",
  colourLabel: "Club colour",
  colourHint: "Colours the board, the crest and the line-up picture. What the team wears is set below.",
  swatchLabel: (which: string, colour: string) => `${which}: ${colour}`,
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
  deleteForGood: (name: string) => `Delete ${name} for good? This cannot be undone.`,
  replaceSquad: "Replace the squad on this board with the one in the file?",
  replaceSquadYes: "Replace the squad",
  wipe: "Clear this board and start again? Everything on it is deleted. Export a file first if you want a copy.",
  keep: "Keep it",
} as const;

// Toasts, empty states and the match-under-way check are said by the Gaffer: see gaffer.ts.
