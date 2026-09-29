import { BOARD_PALETTE, KIT_COLOURS, VISOR_MARK } from "@/constants/brand";
import { NO_NUMBER, SHEET, SUBS } from "@/constants/content/board";
import { PICTURE_CONFIG } from "@/constants/config";
import { containIn, loadImage } from "./badge";
import { downloadBlob } from "./files";
import { matchDate } from "./message";
import { monogram, shirtName } from "./names";
import { byId, slots } from "./queries";
import type { BoardData } from "./types";

// Where everything sits on the 1080 x 1350 picture. Single use, so kept here.
const L = {
  pad: 64,
  crestR: 44,
  crestY: 124,
  teamSize: 60,
  fixtureSize: 30,
  shapeSize: 44,
  pitchTop: 212,
  pitchHeight: 800,
  /** Players sit in this share of the pitch height, from this offset, so the keeper's name stays on it. */
  playerSpan: 0.88,
  playerOffset: 0.03,
  pitchRadius: 24,
  lineWidth: 2.5,
  discR: 40,
  numberSize: 40,
  nameSize: 26,
  nameGap: 16,
  namePadX: 10,
  namePadY: 5,
  labelSize: 24,
  listSize: 30,
  listLeading: 42,
  blockGap: 30,
  footerY: 1306,
  markSize: 48,
  footerSize: 26,
} as const;

const ELLIPSIS = "\u2026";

// The pitch lines of PitchMarkings, in the same 300 x 400 box.
const BOX = { w: 300, h: 400 } as const;
const LINES = {
  rects: [
    [10, 10, 280, 380],
    [66, 10, 168, 62],
    [112, 10, 76, 24],
    [66, 328, 168, 62],
    [112, 366, 76, 24],
  ],
  halfway: [10, 200, 290, 200],
  circle: [150, 200, 42],
  spot: [150, 200, 2.5],
} as const;

function cssFont(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || "sans-serif";
}

function hexAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Shortens text with an ellipsis until it fits the width. */
function fit(ctx: CanvasRenderingContext2D, text: string, width: number): string {
  if (ctx.measureText(text).width <= width) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + ELLIPSIS).width > width) t = t.slice(0, -1);
  return t.trimEnd() + ELLIPSIS;
}

const GAP = "   ";

/** Splits items into lines that fit the width. If some are left over, the last line ends in an ellipsis. */
function wrap(ctx: CanvasRenderingContext2D, items: readonly string[], width: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const item of items) {
    const next = line ? line + GAP + item : item;
    if (!line || ctx.measureText(next).width <= width) {
      line = next;
      continue;
    }
    lines.push(line);
    line = item;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines) {
    if (line) lines.push(line);
    return lines.map((l) => fit(ctx, l, width));
  }
  lines[maxLines - 1] = fit(ctx, lines[maxLines - 1] + GAP + ELLIPSIS, width);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Draws the current line-up in the board's own colours and type, and returns it as a PNG. */
export async function lineupPicture(d: BoardData): Promise<Blob> {
  const { width, height } = PICTURE_CONFIG;
  const kit = KIT_COLOURS[d.colour] ?? KIT_COLOURS[0];
  const head = cssFont("--font-headline");
  const body = cssFont("--font-body");
  await Promise.all([document.fonts.load(`700 40px ${head}`), document.fonts.load(`500 30px ${body}`)]);
  const mark = await loadImage(VISOR_MARK.src).catch(() => null);
  const badge = d.badge ? await loadImage(d.badge).catch(() => null) : null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");
  const inner = width - L.pad * 2;

  ctx.fillStyle = BOARD_PALETTE.board;
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "alphabetic";

  // Header: crest, team, fixture, shape.
  const cx = L.pad + L.crestR;
  if (badge) {
    const box = containIn(badge, L.crestR * 2);
    ctx.drawImage(badge, L.pad + box.x, L.crestY - L.crestR + box.y, box.w, box.h);
  } else {
    ctx.fillStyle = kit.kit;
    ctx.beginPath();
    ctx.arc(cx, L.crestY, L.crestR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = kit.ink;
    ctx.font = `700 34px ${head}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(monogram(d.team), cx, L.crestY + 2);
    ctx.textBaseline = "alphabetic";
  }

  ctx.textAlign = "right";
  ctx.font = `700 ${L.shapeSize}px ${head}`;
  ctx.fillStyle = kit.kit;
  const shapeW = ctx.measureText(d.formation).width;
  ctx.fillText(d.formation, width - L.pad, L.crestY + 14);

  const textX = cx + L.crestR + 24;
  const textW = width - L.pad - shapeW - 32 - textX;
  ctx.textAlign = "left";
  ctx.fillStyle = kit.kit;
  ctx.font = `700 ${L.teamSize}px ${head}`;
  // The fixture, then the day and kick-off when the coach filled them in.
  const sub = [d.fixture.trim(), matchDate(d.match.date), d.match.kickoff].filter(Boolean).join(SHEET.pictureJoin);
  ctx.fillText(fit(ctx, d.team || SHEET.fallbackTitle, textW), textX, sub ? L.crestY + 8 : L.crestY + 20);
  if (sub) {
    ctx.fillStyle = BOARD_PALETTE.dim;
    ctx.font = `500 ${L.fixtureSize}px ${body}`;
    ctx.fillText(fit(ctx, sub, textW), textX, L.crestY + 48);
  }

  // Pitch surface and lines.
  const px = L.pad;
  const py = L.pitchTop;
  const pw = inner;
  const ph = L.pitchHeight;
  const grad = ctx.createLinearGradient(px, py, px + pw * 0.09, py + ph * 0.66);
  grad.addColorStop(0, BOARD_PALETTE.pitchTop);
  grad.addColorStop(1, BOARD_PALETTE.pitchBottom);
  roundRect(ctx, px, py, pw, ph, L.pitchRadius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = BOARD_PALETTE.edge;
  ctx.lineWidth = 2;
  ctx.stroke();

  const sx = pw / BOX.w;
  const sy = ph / BOX.h;
  ctx.strokeStyle = hexAlpha(kit.kit, PICTURE_CONFIG.lineAlpha);
  ctx.fillStyle = hexAlpha(kit.kit, PICTURE_CONFIG.lineAlpha);
  ctx.lineWidth = L.lineWidth;
  for (const [x, y, w, h] of LINES.rects) ctx.strokeRect(px + x * sx, py + y * sy, w * sx, h * sy);
  const [x1, y1, x2, y2] = LINES.halfway;
  ctx.beginPath();
  ctx.moveTo(px + x1 * sx, py + y1 * sy);
  ctx.lineTo(px + x2 * sx, py + y2 * sy);
  ctx.stroke();
  const [ccx, ccy, cr] = LINES.circle;
  ctx.beginPath();
  ctx.ellipse(px + ccx * sx, py + ccy * sy, cr * sx, cr * sy, 0, 0, Math.PI * 2);
  ctx.stroke();
  const [spx, spy, spr] = LINES.spot;
  ctx.beginPath();
  ctx.arc(px + spx * sx, py + spy * sy, spr * sx, 0, Math.PI * 2);
  ctx.fill();

  // Players.
  for (const s of slots(d)) {
    const x = px + (s.x / 100) * pw;
    const y = py + ph * (L.playerOffset + L.playerSpan * ((100 - s.y) / 100));
    const p = byId(d, d.xi[s.id]);
    ctx.beginPath();
    ctx.arc(x, y, L.discR, 0, Math.PI * 2);
    if (!p) {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = hexAlpha(kit.kit, PICTURE_CONFIG.lineAlpha);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = BOARD_PALETTE.dim;
      ctx.font = `600 ${L.nameSize}px ${head}`;
      ctx.textAlign = "center";
      ctx.fillText(s.role, x, y + L.discR + L.nameGap + L.nameSize);
      continue;
    }
    const keeper = s.role === "GK";
    ctx.fillStyle = keeper ? BOARD_PALETTE.chalk : kit.kit;
    ctx.fill();
    ctx.strokeStyle = keeper ? BOARD_PALETTE.keeperEdge : kit.edge;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = keeper ? BOARD_PALETTE.board : kit.ink;
    ctx.font = `700 ${L.numberSize}px ${head}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.num || NO_NUMBER, x, y + 2);
    ctx.textBaseline = "alphabetic";

    ctx.font = `500 ${L.nameSize}px ${body}`;
    const name = fit(ctx, shirtName(p, d.nameStyle, d.players), pw / 4.4);
    const nw = ctx.measureText(name).width + L.namePadX * 2;
    const nh = L.nameSize + L.namePadY * 2;
    const ny = y + L.discR + L.nameGap - 6;
    roundRect(ctx, x - nw / 2, ny, nw, nh, 6);
    ctx.fillStyle = BOARD_PALETTE.nameBack;
    ctx.fill();
    ctx.fillStyle = BOARD_PALETTE.chalk;
    ctx.fillText(name, x, ny + L.namePadY + L.nameSize * 0.8);
  }

  // Bench, then substitutions, under the pitch.
  let y = py + ph + L.blockGap + L.labelSize;
  const block = (label: string, items: readonly string[], colour: string) => {
    if (!items.length) return;
    ctx.textAlign = "left";
    ctx.fillStyle = kit.kit;
    ctx.font = `700 ${L.labelSize}px ${head}`;
    ctx.fillText(label.toUpperCase(), L.pad, y);
    ctx.fillStyle = colour;
    ctx.font = `500 ${L.listSize}px ${body}`;
    for (const line of wrap(ctx, items, inner, PICTURE_CONFIG.benchLines)) {
      y += L.listLeading;
      ctx.fillText(line, L.pad, y);
    }
    y += L.blockGap + L.labelSize;
  };
  const bench = d.bench
    .map((id) => byId(d, id))
    .filter((p) => p !== null)
    .map((p) => `${p.num ? `${p.num} ` : ""}${shirtName(p, d.nameStyle, d.players)}`);
  block(SHEET.bench, bench, BOARD_PALETTE.chalk);
  const subs = d.subs.slice(-PICTURE_CONFIG.subsShown).map((s) => `${s.min}' ${s.onName} ${SUBS.for} ${s.offName}`);
  if (y + L.listLeading < L.footerY - L.markSize) block(SHEET.subs, subs, BOARD_PALETTE.dim);

  // Footer: the visor mark and the address.
  if (mark) ctx.drawImage(mark, L.pad, L.footerY - L.markSize + 10, L.markSize, L.markSize);
  ctx.textAlign = "left";
  ctx.fillStyle = BOARD_PALETTE.dimmer;
  ctx.font = `500 ${L.footerSize}px ${body}`;
  ctx.fillText(SHEET.pictureFooter, L.pad + (mark ? L.markSize + 14 : 0), L.footerY);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No picture"))), PICTURE_CONFIG.type);
  });
}

export type ShareResult = "shared" | "cancelled" | "downloaded";

/** Hands the picture to the phone's share sheet, or downloads it where files cannot be shared. */
export async function sharePicture(blob: Blob, fileName: string, title: string): Promise<ShareResult> {
  const file = new File([blob], fileName, { type: PICTURE_CONFIG.type });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      // Some browsers refuse once the tap is too long ago. Fall through to a download.
    }
  }
  downloadBlob(blob, fileName);
  return "downloaded";
}
