import type { NameStyle } from "@/constants/content/board";
import type { PositionKey, Role } from "@/constants/football";

export interface Player {
  readonly id: string;
  num: string;
  name: string;
  /** Shirt label used when shirts are labelled by initials. */
  init: string;
  pos: PositionKey[];
  /** Not called up this week. Also set while injured or unavailable. */
  out: boolean;
  inj: boolean;
  una: boolean;
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
}

export interface Clock {
  running: boolean;
  /** Milliseconds banked before the current run. */
  base: number;
  /** When the current run started. */
  since: number;
}

export interface BoardData {
  team: string;
  season: string;
  fixture: string;
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
  clock: Clock;
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

export interface UiState {
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
