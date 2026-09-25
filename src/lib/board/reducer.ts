import { NAME_STYLES, TOASTS } from "@/constants/content/board";
import { BOARD_CONFIG } from "@/constants/config";
import { CUSTOM_FORMATION, DEFAULT_FORMATION, type PositionKey } from "@/constants/football";
import { firstName } from "./names";
import {
  bestFree,
  blocked,
  byId,
  canonical,
  captureLineup,
  elapsed,
  isShape,
  onBench,
  slotOf,
  slots,
  slotsFor,
  started,
} from "./queries";
import { emptyData, loadStored } from "./storage";
import type { BoardData, BoardState, DropTarget, Lineup, Player, Point, UiState } from "./types";

export type Action =
  | { type: "load"; data: BoardData; notice?: string }
  | { type: "notify"; text: string }
  | { type: "storageFailed" }
  | { type: "setTeam"; value: string }
  | { type: "setFixture"; value: string }
  | { type: "clockToggle" }
  | { type: "clockReset" }
  | { type: "setFormation"; name: string }
  | { type: "togglePosMode" }
  | { type: "resetCustom" }
  | { type: "moveCustom"; index: number; point: Point }
  | { type: "drop"; pid: string; target: DropTarget }
  | { type: "dragOver"; target: DropTarget | null }
  | { type: "tapPlayer"; pid: string }
  | { type: "tapSlot"; slotId: string }
  | { type: "tapZone"; zone: "bench" | "pool" }
  | { type: "closePicker" }
  | { type: "pickerPick"; pid: string }
  | { type: "pickerOff"; to: "bench" | "pool" }
  | { type: "toggleEdit"; id: string }
  | { type: "editDone" }
  | { type: "togglePos"; pos: PositionKey }
  | { type: "toggleInjured"; id: string }
  | { type: "toggleUnavailable"; id: string }
  | { type: "setCalledUp"; id: string; called: boolean }
  | { type: "removePlayer"; id: string }
  | { type: "restorePlayer"; id: string }
  | { type: "deletePlayer"; id: string }
  | { type: "setNumber"; id: string; value: string }
  | { type: "setShirtLabel"; id: string; value: string }
  | { type: "addPlayer"; id: string; num: string; name: string }
  | { type: "reorder"; id: string; to: number }
  | { type: "rowDrag"; id: string | null }
  | { type: "sortByNumber" }
  | { type: "toggleCallUps" }
  | { type: "newMatchday" }
  | { type: "setColour"; index: number }
  | { type: "saveLineup" }
  | { type: "setStrongest" }
  | { type: "backToStrongest" }
  | { type: "saveNamed"; name: string }
  | { type: "loadNamed"; index: number }
  | { type: "deleteNamed"; index: number }
  | { type: "cycleNameStyle" }
  | { type: "toggleCover" }
  | { type: "clearPitch" };

/** Every action is stamped with the time it happened, so the reducer stays pure. */
export type StampedAction = Action & { readonly now: number };

const INITIAL_UI: UiState = {
  selected: null,
  editing: null,
  pickerSlot: null,
  posMode: false,
  dropTarget: null,
  draggingRow: null,
  notice: null,
  storageOK: true,
};

/* ---------- opening the board ---------- */

function applyLineup(d: BoardData, l: Lineup, fillGaps = true): number {
  d.custom = structuredClone(l.custom);
  d.formation =
    l.formation === CUSTOM_FORMATION ? (d.custom.length ? CUSTOM_FORMATION : d.formation) : isShape(l.formation) ? l.formation : d.formation;
  d.xi = {};
  for (const [k, pid] of Object.entries(l.xi)) {
    const p = byId(d, pid);
    if (p && !p.out) d.xi[k] = pid;
  }
  d.bench = l.bench.filter((id) => {
    const p = byId(d, id);
    return p && !p.out && !slotOf(d, id);
  });
  // Anyone in the saved XI who is now out leaves a gap. Fill it with the best cover
  // rather than starting a player short.
  let changes = 0;
  if (!fillGaps) return changes;
  for (const sl of slots(d)) {
    if (d.xi[sl.id]) continue;
    const replacement = bestFree(d, sl.role);
    if (!replacement) continue;
    d.bench = d.bench.filter((id) => id !== replacement.id);
    d.xi[sl.id] = replacement.id;
    changes++;
  }
  return changes;
}

function opened(d: BoardData): BoardData {
  // A match already under way is left exactly as it was. Otherwise the board opens on
  // the last line-up saved, and falls back to the strongest XI if none was.
  if (!d.clock.base && !d.subs.length) {
    const start = d.saved ?? d.preset;
    if (start) applyLineup(d, start);
  }
  return d;
}

export function initBoard(): BoardState {
  const stored = loadStored();
  return { data: stored ? opened(stored) : emptyData(), ui: INITIAL_UI };
}

/* ---------- moves ---------- */

function detach(d: BoardData, pid: string) {
  const s = slotOf(d, pid);
  if (s) delete d.xi[s];
  d.bench = d.bench.filter((id) => id !== pid);
}

function logSub(d: BoardData, onId: string, offId: string, now: number) {
  if (!started(d)) return;
  const on = byId(d, onId);
  const off = byId(d, offId);
  if (!on || !off) return;
  d.subs.push({ min: Math.floor(elapsed(d, now) / 60000) + 1, onName: on.name, offName: off.name });
}

/** Why a player cannot be picked, or null when they can. */
function refusal(p: Player | null): string | null {
  if (!p) return null;
  const n = firstName(p.name);
  if (p.inj) return TOASTS.injured(n);
  if (p.una) return TOASTS.unavailable(n);
  if (p.out) return TOASTS.notCalledUp(n);
  return null;
}

type Note = (text: string) => void;

function toSlot(d: BoardData, pid: string, slotId: string, now: number, note: Note) {
  const why = refusal(byId(d, pid));
  if (why) return note(why);
  const occupant = d.xi[slotId] ?? null;
  if (occupant === pid) return;
  const fromSlot = slotOf(d, pid);
  if (occupant && fromSlot) {
    d.xi[fromSlot] = occupant;
  } else if (occupant) {
    if (onBench(d, pid)) logSub(d, pid, occupant, now);
    detach(d, pid);
    d.bench.unshift(occupant);
  } else {
    detach(d, pid);
  }
  d.xi[slotId] = pid;
}

function toBench(d: BoardData, pid: string, note: Note) {
  const why = refusal(byId(d, pid));
  if (why) return note(why);
  if (onBench(d, pid)) return;
  detach(d, pid);
  d.bench.push(pid);
}

/** Returns false when the drop changes nothing. */
function drop(d: BoardData, pid: string, target: DropTarget, now: number, note: Note): boolean {
  if (target.kind === "slot") toSlot(d, pid, target.id, now, note);
  else if (target.kind === "bench") toBench(d, pid, note);
  else if (target.kind === "pool") detach(d, pid);
  else if (target.kind === "chip") {
    const other = target.id;
    if (other === pid) return false;
    const a = slotOf(d, pid);
    const b = slotOf(d, other);
    if (a && !b) {
      const why = refusal(byId(d, other));
      if (why) {
        note(why);
        return true;
      }
      if (onBench(d, other)) logSub(d, other, pid, now);
      detach(d, other);
      detach(d, pid);
      d.xi[a] = other;
      d.bench.push(pid);
    } else if (!a && b) toSlot(d, pid, b, now, note);
    else if (onBench(d, other)) toBench(d, pid, note);
    else return false;
  }
  return true;
}

function setFormation(d: BoardData, ui: UiState, name: string) {
  if (!isShape(name) || name === d.formation) return;
  if (name === CUSTOM_FORMATION) {
    // start the custom shape as a copy of whatever is on the board now
    d.custom = slots(d).map(({ x, y }) => ({ x, y }));
  } else {
    ui.posMode = false;
  }
  const seated = canonical(slots(d))
    .map((s) => d.xi[s.id])
    .filter((pid): pid is string => !!pid);
  d.formation = name;
  d.xi = {};
  const next = canonical(slots(d));
  seated.forEach((pid, i) => {
    if (i < next.length) d.xi[next[i].id] = pid;
    else if (!onBench(d, pid)) d.bench.push(pid);
  });
}

function numberOrder(a: Player, b: Player): number {
  const an = parseInt(a.num, 10);
  const bn = parseInt(b.num, 10);
  if (isNaN(an) && isNaN(bn)) return a.name.localeCompare(b.name);
  if (isNaN(an)) return 1;
  if (isNaN(bn)) return -1;
  return an - bn;
}

/* ---------- reducer ---------- */

export function boardReducer(state: BoardState, action: StampedAction): BoardState {
  // Pointer tracking fires on every move, so it skips the full copy below.
  if (action.type === "dragOver") {
    const same = JSON.stringify(state.ui.dropTarget) === JSON.stringify(action.target);
    return same ? state : { ...state, ui: { ...state.ui, dropTarget: action.target } };
  }

  const next = structuredClone(state);
  const d = next.data;
  const ui = next.ui;
  const { now } = action;
  const note: Note = (text) => {
    ui.notice = { id: (state.ui.notice?.id ?? 0) + 1, text };
  };
  const player = (id: string) => byId(d, id);
  const closePicker = () => {
    ui.pickerSlot = null;
  };

  switch (action.type) {
    case "load":
      next.data = opened(structuredClone(action.data));
      next.ui = { ...INITIAL_UI, storageOK: ui.storageOK, notice: ui.notice };
      if (action.notice) {
        next.ui.notice = { id: (state.ui.notice?.id ?? 0) + 1, text: action.notice };
      }
      return next;

    case "notify":
      note(action.text);
      return next;

    case "storageFailed":
      if (!state.ui.storageOK) return state;
      ui.storageOK = false;
      return next;

    case "setTeam":
      d.team = action.value;
      return next;

    case "setFixture":
      d.fixture = action.value;
      return next;

    case "clockToggle":
      if (d.clock.running) d.clock = { running: false, base: elapsed(d, now), since: 0 };
      else d.clock = { ...d.clock, running: true, since: now };
      return next;

    case "clockReset":
      d.clock = { running: false, base: 0, since: 0 };
      return next;

    case "setFormation":
      setFormation(d, ui, action.name);
      ui.selected = null;
      closePicker();
      return next;

    case "togglePosMode":
      ui.posMode = !ui.posMode;
      ui.selected = null;
      closePicker();
      return next;

    case "resetCustom":
      d.custom = slotsFor(DEFAULT_FORMATION, []).map(({ x, y }) => ({ x, y }));
      note(TOASTS.shapeReset);
      return next;

    case "moveCustom":
      if (d.formation !== CUSTOM_FORMATION || !d.custom[action.index]) return state;
      d.custom[action.index] = action.point;
      return next;

    case "drop":
      ui.dropTarget = null;
      if (!drop(d, action.pid, action.target, now, note)) return { ...state, ui: { ...state.ui, dropTarget: null } };
      ui.selected = null;
      return next;

    case "tapPlayer":
      if (ui.selected && ui.selected !== action.pid) {
        if (!drop(d, ui.selected, { kind: "chip", id: action.pid }, now, note)) return state;
        ui.selected = null;
      } else {
        ui.selected = ui.selected === action.pid ? null : action.pid;
      }
      return next;

    case "tapSlot": {
      if (ui.posMode) return state;
      if (!ui.selected) {
        ui.pickerSlot = action.slotId;
        return next;
      }
      if (ui.selected === d.xi[action.slotId]) {
        ui.selected = null;
        return next;
      }
      drop(d, ui.selected, { kind: "slot", id: action.slotId }, now, note);
      ui.selected = null;
      return next;
    }

    case "tapZone":
      if (!ui.selected) return state;
      drop(d, ui.selected, { kind: action.zone }, now, note);
      ui.selected = null;
      return next;

    case "closePicker":
      if (!state.ui.pickerSlot) return state;
      closePicker();
      return next;

    case "pickerPick": {
      const sid = ui.pickerSlot;
      closePicker();
      if (sid) drop(d, action.pid, { kind: "slot", id: sid }, now, note);
      ui.selected = null;
      return next;
    }

    case "pickerOff": {
      const cur = ui.pickerSlot ? d.xi[ui.pickerSlot] : null;
      closePicker();
      if (cur) {
        if (action.to === "bench") toBench(d, cur, note);
        else detach(d, cur);
      }
      return next;
    }

    case "toggleEdit":
      ui.editing = ui.editing === action.id ? null : action.id;
      return next;

    case "editDone":
      ui.editing = null;
      return next;

    case "togglePos": {
      const p = ui.editing ? player(ui.editing) : null;
      if (!p) return state;
      p.pos = p.pos.includes(action.pos) ? p.pos.filter((k) => k !== action.pos) : [...p.pos, action.pos];
      return next;
    }

    case "toggleInjured": {
      const p = player(action.id);
      if (!p) return state;
      p.inj = !p.inj;
      // one reason at a time
      if (p.inj) {
        p.una = false;
        p.out = true;
        detach(d, p.id);
      }
      note(p.inj ? TOASTS.markedInjured(firstName(p.name)) : TOASTS.fitAgain(firstName(p.name)));
      return next;
    }

    case "toggleUnavailable": {
      const p = player(action.id);
      if (!p) return state;
      p.una = !p.una;
      if (p.una) {
        p.inj = false;
        p.out = true;
        detach(d, p.id);
      }
      note(p.una ? TOASTS.markedUnavailable(firstName(p.name)) : TOASTS.availableAgain(firstName(p.name)));
      return next;
    }

    case "setCalledUp": {
      const p = player(action.id);
      if (!p || blocked(p)) return state;
      p.out = !action.called;
      // leaves their position empty, for the coach to fill
      if (p.out) detach(d, p.id);
      note(p.out ? TOASTS.notCalledUp(firstName(p.name)) : TOASTS.calledUp(firstName(p.name)));
      return next;
    }

    case "removePlayer": {
      const p = player(action.id);
      if (!p) return state;
      detach(d, p.id);
      d.players = d.players.filter((x) => x.id !== p.id);
      // kept, so the coach can see who was taken out
      d.removed.unshift(p);
      if (ui.selected === p.id) ui.selected = null;
      if (ui.editing === p.id) ui.editing = null;
      note(TOASTS.removed(firstName(p.name)));
      return next;
    }

    case "restorePlayer": {
      const p = d.removed.find((x) => x.id === action.id);
      if (!p) return state;
      d.removed = d.removed.filter((x) => x.id !== p.id);
      // back in the squad, not called up yet
      p.out = true;
      d.players.push(p);
      note(TOASTS.restored(firstName(p.name)));
      return next;
    }

    case "deletePlayer":
      d.removed = d.removed.filter((x) => x.id !== action.id);
      return next;

    case "setNumber": {
      const p = player(action.id);
      if (!p) return state;
      p.num = action.value.replace(/[^0-9]/g, "").slice(0, BOARD_CONFIG.shirtNumberMaxLength);
      return next;
    }

    case "setShirtLabel": {
      const p = player(action.id);
      if (!p) return state;
      p.init = action.value.trim().toUpperCase().slice(0, BOARD_CONFIG.shirtLabelMaxLength);
      return next;
    }

    case "addPlayer": {
      const name = action.name.trim();
      if (!name) return state;
      d.players.push({
        id: action.id,
        num: action.num.replace(/[^0-9]/g, "").slice(0, BOARD_CONFIG.shirtNumberMaxLength),
        name,
        init: "",
        pos: [],
        out: false,
        inj: false,
        una: false,
      });
      ui.editing = action.id;
      return next;
    }

    case "reorder": {
      const from = d.players.findIndex((p) => p.id === action.id);
      if (from < 0 || from === action.to) return state;
      const [p] = d.players.splice(from, 1);
      d.players.splice(Math.max(0, Math.min(action.to, d.players.length)), 0, p);
      return next;
    }

    case "rowDrag":
      if (state.ui.draggingRow === action.id) return state;
      return { ...state, ui: { ...state.ui, draggingRow: action.id, editing: action.id ? null : state.ui.editing } };

    case "sortByNumber":
      d.players.sort(numberOrder);
      note(TOASTS.sorted);
      return next;

    case "toggleCallUps": {
      const anyOut = d.players.some((p) => p.out && !blocked(p));
      for (const p of d.players) {
        // injured or unavailable players stay out either way
        if (blocked(p)) continue;
        if (anyOut) p.out = false;
        else {
          p.out = true;
          detach(d, p.id);
        }
      }
      note(anyOut ? TOASTS.everyoneCalledUp : TOASTS.callUpsCleared);
      return next;
    }

    // Starts the week clean: nobody called up, clock and subs cleared.
    // Injuries and unavailability carry over, since they are not weekly decisions.
    case "newMatchday":
      for (const p of d.players) {
        p.out = true;
        detach(d, p.id);
      }
      d.subs = [];
      d.clock = { running: false, base: 0, since: 0 };
      ui.selected = null;
      closePicker();
      note(TOASTS.newMatchday);
      return next;

    case "setColour":
      d.colour = action.index;
      return next;

    case "saveLineup":
      d.saved = captureLineup(d);
      note(TOASTS.lineupSaved);
      return next;

    case "setStrongest":
      d.preset = captureLineup(d);
      d.saved = captureLineup(d);
      note(TOASTS.strongestSaved);
      return next;

    case "backToStrongest": {
      if (!d.preset) {
        note(TOASTS.noStrongest);
        return next;
      }
      const changes = applyLineup(d, d.preset);
      ui.selected = null;
      closePicker();
      note(changes ? TOASTS.strongestWithChanges(changes) : TOASTS.backToStrongest);
      return next;
    }

    case "saveNamed":
      d.lineups.unshift({ ...captureLineup(d), name: action.name });
      d.lineups = d.lineups.slice(0, BOARD_CONFIG.maxSavedLineups);
      note(TOASTS.lineupSaved);
      return next;

    case "loadNamed": {
      const l = d.lineups[action.index];
      if (!l) return state;
      // A named plan loads as it was saved. Gaps are left for the coach to fill.
      applyLineup(d, l, false);
      ui.selected = null;
      closePicker();
      note(TOASTS.loaded(l.name));
      return next;
    }

    case "deleteNamed":
      d.lineups.splice(action.index, 1);
      return next;

    case "cycleNameStyle": {
      const i = NAME_STYLES.findIndex((o) => o.key === d.nameStyle);
      d.nameStyle = NAME_STYLES[(i + 1) % NAME_STYLES.length].key;
      return next;
    }

    case "toggleCover":
      d.showCover = !d.showCover;
      return next;

    case "clearPitch":
      d.xi = {};
      ui.selected = null;
      closePicker();
      return next;
  }
}
