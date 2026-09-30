import type { NameStyle } from "@/constants/content/board";
import type { VoiceKey } from "@/constants/content/landing";
import type { AgeKey, FormatKey, PositionKey, Role, Side } from "@/constants/football";

export interface Player {
  readonly id: string;
  num: string;
  name: string;
  /** Shirt label used when shirts are labelled by initials. */
  init: string;
  pos: PositionKey[];
  /** The flank they play, from "RB" or "LW" in the pasted list. Null plays either side. */
  side: Side | null;
  /** Not called up this week. Also set while injured or unavailable. */
  out: boolean;
  inj: boolean;
  una: boolean;
  /** Missed training this week. A competitive side's reason to leave someone out. */
  trn: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface Slot {
  readonly id: string;
  readonly band: number;
  readonly x: number;
  readonly y: number;
  readonly role: Role;
}

/** slot id -> player id */
export type XI = Record<string, string>;

export interface Lineup {
  formation: string;
  xi: XI;
  bench: string[];
  custom: Point[];
}

export interface NamedLineup extends Lineup {
  name: string;
}

export interface Sub {
  min: number;
  onName: string;
  offName: string;
  /** Came off injured. Shown in the coach's log only: the team sheet never says why. */
  inj: boolean;
}

export interface Clock {
  running: boolean;
  /** Milliseconds banked before the current run. */
  base: number;
  /** When the current run started. */
  since: number;
}

/** Match time per player, in milliseconds of the match clock. */
export interface Minutes {
  /** Players on the pitch now, and the clock time they came on. */
  on: Record<string, number>;
  /** Time banked from earlier spells on the pitch. */
  played: Record<string, number>;
}

/** What the parents need to get their child there. All optional, all plain text. */
/** Where the match is played. Empty until the coach says. */
export type Venue = "" | "home" | "away";

/** This week's match: the details the call-up goes out with, and the result it ends with. Cleared by New matchday. */
export interface MatchDetails {
  /** yyyy-mm-dd, from a date input. */
  date: string;
  /** HH:MM, from a time input. */
  kickoff: string;
  meet: string;
  /** Free text from before home or away was asked. Still read, so an old board keeps it. */
  kit: string;
  address: string;
  venue: Venue;
  /** Goals for and against, from the Full time step. */
  us: number;
  them: number;
  /** Player of the match, by id. Empty for nobody. */
  potm: string;
  /** Full time has been called, so the board reopens on the result. */
  ended: boolean;
  /** Which half is on, and whether it is the break between them. */
  half: 1 | 2;
  atBreak: boolean;
}

/** The text fields of the match, which the details form edits. */
export type MatchTextField = "date" | "kickoff" | "meet" | "kit" | "address";

export interface BoardData {
  team: string;
  season: string;
  fixture: string;
  match: MatchDetails;
  formation: string;
  players: Player[];
  xi: XI;
  bench: string[];
  subs: Sub[];
  lineups: NamedLineup[];
  showCover: boolean;
  custom: Point[];
  nameStyle: NameStyle;
  /** The strongest XI. */
  preset: Lineup | null;
  /** The last line-up saved with "Save line-up". */
  saved: Lineup | null;
  removed: Player[];
  colour: number;
  /** The away kit, as an index into KIT_COLOURS. The home kit is `colour`, which also colours the board. */
  awayColour: number;
  /** The club badge as a small PNG data URL. Empty when the crest shows initials. */
  badge: string;
  clock: Clock;
  /** The made-up team from "Try the example team", not the coach's own. */
  example: boolean;
  /** When this squad was first loaded on this device. 0 when not known. */
  createdAt: number;
  /** When a squad file was last exported or imported. 0 when never. */
  backedUpAt: number;
  /** Which gaffer talks on this board. */
  voice: VoiceKey;
  /** The age group, which sets the format and the phase. Null on boards made before it existed. */
  age: AgeKey | null;
  /** 3v3 to 11v11. Set by the age group, and the coach can change it. */
  format: FormatKey;
  minutes: Minutes;
  /** A small "Made with gafferboard.com" line at the foot of the copied team sheet. */
  sheetCredit: boolean;
}

export type Zone = "bench" | "pool";

export type DropTarget =
  | { readonly kind: "slot"; readonly id: string }
  | { readonly kind: "chip"; readonly id: string }
  | { readonly kind: Zone };

export interface Notice {
  readonly id: number;
  readonly text: string;
}

/** The three matchday steps the board is laid out in. */
export type BoardStep = "pick" | "match" | "full";

/** A player's week, as one choice in the player drawer. Anything but available leaves them out. */
export type Availability = "available" | "inj" | "una" | "trn";

/** What goes out from Full time: the result for the parents, or the line-up picture for the coaches. */
export type SendKind = "result" | "picture";

/** The board as it was before the last change to the team, for Undo. */
export interface UndoPoint {
  readonly id: number;
  readonly text: string;
  readonly data: BoardData;
}

export interface UiState {
  /** The last change to the team, for a few seconds, so it can be taken back. */
  undo: UndoPoint | null;
  /** Which step is showing: picking the team, the match itself, or sending to the parents. */
  step: BoardStep;
  /** On Matchday, the pitch position whose player is coming off, and whether it is for an injury. */
  offSlot: string | null;
  offInjured: boolean;
  /** What the Full time step is set to send. */
  sendKind: SendKind;
  selected: string | null;
  editing: string | null;
  pickerSlot: string | null;
  posMode: boolean;
  dropTarget: DropTarget | null;
  /** The squad row being dragged to a new place in the list. */
  draggingRow: string | null;
  notice: Notice | null;
  storageOK: boolean;
}

export interface BoardState {
  data: BoardData;
  ui: UiState;
}
