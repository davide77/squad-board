import { NAME_STYLES, type NameStyle } from "@/constants/content/board";
import { GAFFER } from "@/constants/content/gaffer";
import type { VoiceKey } from "@/constants/content/landing";
import { BOARD_CONFIG } from "@/constants/config";
import {
  AGE_GROUPS,
  CUSTOM_FORMATION,
  FORMATS,
  type AgeKey,
  type FormatKey,
  type PositionKey,
  type Side,
} from "@/constants/football";
import { firstName } from "./names";
import {
  bestFree,
  blocked,
  byId,
  canonical,
  captureLineup,
  elapsed,
  fitsFormat,
  isShape,
  onBench,
  phaseOf,
  planName,
  slotOf,
  slots,
  slotsFor,
  started,
  teamSize,
} from "./queries";
import { placeStarters } from "./start";
import { emptyData, emptyMatch, loadStored } from "./storage";
import type { Availability, BoardData, BoardState, BoardStep, SendKind, DropTarget, Lineup, MatchDetails, Player, Point, UiState } from "./types";

export type Action =
  | { type: "load"; data: BoardData; notice?: string }
  | { type: "notify"; text: string }
  | { type: "storageFailed" }
  | { type: "setTeam"; value: string }
  | { type: "setBadge"; value: string }
  | { type: "setFixture"; value: string }
  | { type: "setMatch"; field: keyof MatchDetails; value: string }
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
  | { type: "setSide"; side: Side | null }
  | { type: "setVoice"; voice: VoiceKey }
  | { type: "setAge"; age: AgeKey }
  | { type: "setFormat"; format: FormatKey }
  | { type: "toggleTraining"; id: string }
  | { type: "toggleSheetCredit" }
  | { type: "toggleInjured"; id: string }
  | { type: "toggleUnavailable"; id: string }
  | { type: "setCalledUp"; id: string; called: boolean }
  | { type: "removePlayer"; id: string }
  | { type: "restorePlayer"; id: string }
  | { type: "deletePlayer"; id: string }
  | { type: "setNumber"; id: string; value: string }
  | { type: "setShirtLabel"; id: string; value: string }
  | { type: "setName"; id: string; value: string }
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
  | { type: "clearPitch" }
  | { type: "backedUp" }
  | { type: "setStep"; step: BoardStep; kind?: SendKind }
  | { type: "setSendKind"; kind: SendKind }
  | { type: "setNameStyle"; style: NameStyle }
  | { type: "setAvailability"; id: string; status: Availability }
  | { type: "selectOff"; slotId: string }
  | { type: "toggleOffInjured" }
  | { type: "bringOn"; pid: string }
  | { type: "fullTime" };

/** Every action is stamped with the time it happened, so the reducer stays pure. */
export type StampedAction = Action & { readonly now: number };

const INITIAL_UI: UiState = {
  step: "pick",
  offSlot: null,
  offInjured: false,
  sendKind: "callup",
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

/** Puts a saved line-up on the board. Returns how many gaps were filled, or -1 when it belongs to another format. */
function applyLineup(d: BoardData, l: Lineup, fillGaps = true): number {
  // An 11-a-side plan never lands on a 7-a-side board.
  if (!fitsFormat(l, d)) return -1;
  d.custom = structuredClone(l.custom);
  d.formation =
    l.formation === CUSTOM_FORMATION ? (d.custom.length ? CUSTOM_FORMATION : d.formation) : isShape(l.formation, d.format) ? l.formation : d.formation;
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
  const data = stored ? opened(stored) : emptyData();
  // A match under way when the page closed opens straight back on it. The clock itself reopens
  // paused where it was (storage.ts), so it is the time on it that says so.
  return { data, ui: { ...INITIAL_UI, step: started(data) ? "match" : "pick" } };
}

/** A board that lives in memory only, such as the example team, opening with a word from the Gaffer. */
export function initSandbox(data: BoardData, notice: string): BoardState {
  return { data: opened(structuredClone(data)), ui: { ...INITIAL_UI, notice: { id: 1, text: notice } } };
}

/* ---------- moves ---------- */

function detach(d: BoardData, pid: string) {
  const s = slotOf(d, pid);
  if (s) delete d.xi[s];
  d.bench = d.bench.filter((id) => id !== pid);
}

type Note = (text: string) => void;

/** Logs a change once the clock is running, and the Gaffer has a word about it. */
function logSub(d: BoardData, onId: string, offId: string, now: number, note: Note) {
  if (!started(d)) return;
  const on = byId(d, onId);
  const off = byId(d, offId);
  if (!on || !off) return;
  d.subs.push({ min: Math.floor(elapsed(d, now) / 60000) + 1, onName: on.name, offName: off.name, inj: false });
  note(GAFFER[d.voice].sub(firstName(on.name), firstName(off.name)));
}

/** Why a player cannot be picked, in the Gaffer's words, or null when they can. */
function refusal(d: BoardData, p: Player | null): string | null {
  if (!p) return null;
  const n = firstName(p.name);
  const say = GAFFER[d.voice];
  if (p.inj) return say.cantPickInjured(n);
  if (p.una) return say.cantPickUnavailable(n);
  if (p.trn) return say.cantPickTraining(n);
  if (p.out) return say.cantPickNotCalledUp(n);
  return null;
}

function toSlot(d: BoardData, pid: string, slotId: string, now: number, note: Note) {
  const why = refusal(d, byId(d, pid));
  if (why) return note(why);
  const occupant = d.xi[slotId] ?? null;
  if (occupant === pid) return;
  const fromSlot = slotOf(d, pid);
  if (occupant && fromSlot) {
    d.xi[fromSlot] = occupant;
  } else if (occupant) {
    if (onBench(d, pid)) logSub(d, pid, occupant, now, note);
    detach(d, pid);
    d.bench.unshift(occupant);
  } else {
    detach(d, pid);
  }
  d.xi[slotId] = pid;
}

function toBench(d: BoardData, pid: string, note: Note) {
  const why = refusal(d, byId(d, pid));
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
      const why = refusal(d, byId(d, other));
      if (why) {
        note(why);
        return true;
      }
      if (onBench(d, other)) logSub(d, other, pid, now, note);
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
  if (!isShape(name, d.format) || name === d.formation) return;
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

/**
 * Moves the board to another format. The players on the pitch stay on if there is room,
 * placed where they suit; anyone who no longer fits goes to the bench, and empty
 * places are filled from the bench. The strongest side is kept per format, so the old
 * one is replaced by what is on the board now.
 */
function setFormat(d: BoardData, ui: UiState, format: FormatKey) {
  if (format === d.format) return;
  const seated = canonical(slots(d))
    .map((s) => byId(d, d.xi[s.id]))
    .filter((p): p is Player => !!p);
  const bench = d.bench.map((id) => byId(d, id)).filter((p): p is Player => !!p);
  d.format = format;
  d.formation = FORMATS[format].shapes[0];
  d.custom = [];
  d.xi = {};
  ui.posMode = false;
  const left = placeStarters(d, [...seated, ...bench].slice(0, teamSize(d)));
  const rest = [...seated, ...bench].slice(teamSize(d));
  d.bench = [...left, ...rest].map((p) => p.id);
  d.preset = captureLineup(d);
  d.saved = captureLineup(d);
}

/* ---------- match time ---------- */

/**
 * Keeps each player's match time in step with who is on the pitch. Runs after every
 * change: anyone new on the pitch starts a spell at the current clock time, anyone
 * who came off banks theirs. Before kick-off the clock reads 0, so nothing is banked.
 */
function syncMinutes(d: BoardData, now: number) {
  const t = elapsed(d, now);
  const onPitch = new Set(Object.values(d.xi));
  for (const [pid, since] of Object.entries(d.minutes.on)) {
    if (onPitch.has(pid)) continue;
    d.minutes.played[pid] = (d.minutes.played[pid] ?? 0) + Math.max(0, t - since);
    delete d.minutes.on[pid];
  }
  for (const pid of onPitch) if (!(pid in d.minutes.on)) d.minutes.on[pid] = t;
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
  const next = reduce(state, action);
  if (next !== state && next.data !== state.data) syncMinutes(next.data, action.now);
  return next;
}

function reduce(state: BoardState, action: StampedAction): BoardState {
  // Pointer tracking fires on every move, so it skips the full copy below.
  if (action.type === "dragOver") {
    const same = JSON.stringify(state.ui.dropTarget) === JSON.stringify(action.target);
    return same ? state : { ...state, ui: { ...state.ui, dropTarget: action.target } };
  }

  const next = structuredClone(state);
  const d = next.data;
  const ui = next.ui;
  const say = GAFFER[d.voice];
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
      if (!next.data.createdAt && next.data.players.length) next.data.createdAt = now;
      next.ui = { ...INITIAL_UI, storageOK: ui.storageOK, notice: ui.notice };
      if (action.notice) {
        next.ui.notice = { id: (state.ui.notice?.id ?? 0) + 1, text: action.notice };
      }
      return next;

    case "setStep":
      // Send opens on the call-up before a match, and on the team sheet once one is under way.
      if (action.step === "send") ui.sendKind = action.kind ?? (started(d) ? "sheet" : "callup");
      ui.step = action.step;
      // A new step starts on its own line from the Gaffer, not the last word of the one before.
      ui.notice = null;
      ui.selected = null;
      ui.offSlot = null;
      ui.offInjured = false;
      closePicker();
      return next;

    case "setSendKind":
      ui.sendKind = action.kind;
      return next;

    case "setNameStyle":
      d.nameStyle = action.style;
      return next;

    // Matchday: tap the player coming off, then bring someone on for them.
    case "selectOff":
      ui.offSlot = ui.offSlot === action.slotId || !d.xi[action.slotId] ? null : action.slotId;
      ui.offInjured = false;
      return next;

    case "toggleOffInjured":
      if (!ui.offSlot) return state;
      ui.offInjured = !ui.offInjured;
      return next;

    case "bringOn": {
      const slotId = ui.offSlot;
      const offId = slotId ? d.xi[slotId] : null;
      if (!slotId || !offId) return state;
      const subsBefore = d.subs.length;
      toSlot(d, action.pid, slotId, now, note);
      // Refused, such as a player not called up: the Gaffer has said why, and nothing moved.
      if (d.xi[slotId] !== action.pid) return next;
      if (ui.offInjured) {
        const off = player(offId);
        if (off) {
          off.inj = true;
          off.una = false;
          off.trn = false;
          off.out = true;
          detach(d, off.id);
          if (d.subs.length > subsBefore) d.subs[d.subs.length - 1].inj = true;
          note(say.subInjured(firstName(player(action.pid)?.name ?? ""), firstName(off.name)));
        }
      }
      ui.offSlot = null;
      ui.offInjured = false;
      return next;
    }

    case "fullTime":
      if (d.clock.running) d.clock = { running: false, base: elapsed(d, now), since: 0 };
      ui.step = "send";
      ui.sendKind = "sheet";
      ui.offSlot = null;
      ui.offInjured = false;
      note(say.fullTime);
      return next;

    case "notify":
      note(action.text);
      return next;

    case "backedUp":
      d.backedUpAt = now;
      return next;

    case "storageFailed":
      if (!state.ui.storageOK) return state;
      ui.storageOK = false;
      return next;

    case "setTeam":
      d.team = action.value;
      return next;

    case "setBadge":
      d.badge = action.value;
      return next;

    case "setFixture":
      d.fixture = action.value;
      return next;

    case "setMatch":
      d.match[action.field] = action.value;
      return next;

    case "clockToggle":
      if (d.clock.running) d.clock = { running: false, base: elapsed(d, now), since: 0 };
      else d.clock = { ...d.clock, running: true, since: now };
      return next;

    case "clockReset":
      d.clock = { running: false, base: 0, since: 0 };
      d.minutes = { on: {}, played: {} };
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
      d.custom = slotsFor(FORMATS[d.format].shapes[0], []).map(({ x, y }) => ({ x, y }));
      note(say.shapeReset);
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

    case "setSide": {
      const p = ui.editing ? player(ui.editing) : null;
      if (!p) return state;
      p.side = action.side;
      return next;
    }

    case "toggleInjured": {
      const p = player(action.id);
      if (!p) return state;
      p.inj = !p.inj;
      // one reason at a time
      if (p.inj) {
        p.una = false;
        p.trn = false;
        p.out = true;
        detach(d, p.id);
      }
      note(p.inj ? say.markedInjured(firstName(p.name)) : say.fitAgain(firstName(p.name)));
      return next;
    }

    case "toggleUnavailable": {
      const p = player(action.id);
      if (!p) return state;
      p.una = !p.una;
      if (p.una) {
        p.inj = false;
        p.trn = false;
        p.out = true;
        detach(d, p.id);
      }
      note(p.una ? say.markedUnavailable(firstName(p.name)) : say.availableAgain(firstName(p.name)));
      return next;
    }

    case "toggleTraining": {
      const p = player(action.id);
      if (!p) return state;
      p.trn = !p.trn;
      if (p.trn) {
        p.inj = false;
        p.una = false;
        p.out = true;
        detach(d, p.id);
      }
      note(p.trn ? say.markedTraining(firstName(p.name)) : say.trainingCleared(firstName(p.name)));
      return next;
    }

    // One choice for the week, from the player drawer. Available calls them up as well.
    case "setAvailability": {
      const p = player(action.id);
      if (!p) return state;
      const n = firstName(p.name);
      if (action.status === "available") {
        if (!blocked(p) && !p.out) return state;
        p.inj = false;
        p.una = false;
        p.trn = false;
        p.out = false;
        note(say.calledUp(n));
        return next;
      }
      p.inj = action.status === "inj";
      p.una = action.status === "una";
      p.trn = action.status === "trn";
      p.out = true;
      detach(d, p.id);
      note(p.inj ? say.markedInjured(n) : p.una ? say.markedUnavailable(n) : say.markedTraining(n));
      return next;
    }

    case "setCalledUp": {
      const p = player(action.id);
      if (!p || blocked(p)) return state;
      p.out = !action.called;
      // leaves their position empty, for the coach to fill
      if (p.out) detach(d, p.id);
      note(p.out ? say.notCalledUp(firstName(p.name)) : say.calledUp(firstName(p.name)));
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
      note(say.removed(firstName(p.name)));
      return next;
    }

    case "restorePlayer": {
      const p = d.removed.find((x) => x.id === action.id);
      if (!p) return state;
      d.removed = d.removed.filter((x) => x.id !== p.id);
      // back in the squad, not called up yet
      p.out = true;
      d.players.push(p);
      note(say.restored(firstName(p.name)));
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

    case "setName": {
      const p = player(action.id);
      const name = action.value.trim();
      if (!p || !name || name === p.name) return state;
      p.name = name;
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
        side: null,
        out: false,
        inj: false,
        una: false,
        trn: false,
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
      note(say.sorted);
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
      note(anyOut ? say.everyoneCalledUp : say.callUpsCleared);
      return next;
    }

    // Starts the week clean: nobody called up, clock and subs cleared.
    // Injuries and unavailability carry over, since they are not weekly decisions.
    case "newMatchday":
      for (const p of d.players) {
        p.out = true;
        // training is a weekly thing, so it starts clean too
        p.trn = false;
        detach(d, p.id);
      }
      d.subs = [];
      d.clock = { running: false, base: 0, since: 0 };
      d.minutes = { on: {}, played: {} };
      // The date, times, kit and ground are this week's. Last week's must never go out again.
      d.match = emptyMatch();
      ui.selected = null;
      closePicker();
      note(say.newMatchday);
      return next;

    case "setAge": {
      const group = AGE_GROUPS.find((a) => a.key === action.age);
      if (!group) return state;
      d.age = group.key;
      setFormat(d, ui, group.format);
      closePicker();
      note(GAFFER[d.voice].ageSet(group.label, FORMATS[d.format].label, group.phase === "development"));
      return next;
    }

    case "setFormat":
      if (action.format === d.format) return state;
      setFormat(d, ui, action.format);
      closePicker();
      note(GAFFER[d.voice].formatSet(FORMATS[d.format].label));
      return next;

    case "toggleSheetCredit":
      d.sheetCredit = !d.sheetCredit;
      return next;

    case "setVoice":
      d.voice = action.voice;
      note(GAFFER[action.voice].hello);
      return next;

    case "setColour":
      d.colour = action.index;
      return next;

    case "saveLineup":
      d.saved = captureLineup(d);
      note(say.lineupSaved);
      return next;

    case "setStrongest":
      d.preset = captureLineup(d);
      d.saved = captureLineup(d);
      note(say.planSaved(planName(d), phaseOf(d) === "competitive"));
      return next;

    case "backToStrongest": {
      if (!d.preset || !fitsFormat(d.preset, d)) {
        note(say.noPlan(planName(d)));
        return next;
      }
      const changes = applyLineup(d, d.preset);
      ui.selected = null;
      closePicker();
      note(changes > 0 ? say.planWithChanges(planName(d), changes) : say.backToPlan(planName(d)));
      return next;
    }

    case "saveNamed":
      d.lineups.unshift({ ...captureLineup(d), name: action.name });
      d.lineups = d.lineups.slice(0, BOARD_CONFIG.maxSavedLineups);
      note(say.lineupSaved);
      return next;

    case "loadNamed": {
      const l = d.lineups[action.index];
      if (!l) return state;
      // A named plan loads as it was saved. Gaps are left for the coach to fill.
      if (applyLineup(d, l, false) < 0) return state;
      ui.selected = null;
      closePicker();
      note(say.loaded(l.name));
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
