#!/usr/bin/env node
// Renders the Instagram highlight covers to public/social/highlights/.
//
//   node tools/social/highlight-covers.mjs
//
// One family with the logo (brand.md, "Logo"): a single chalk stroke with round caps, the same
// weight all the way, and one Yellow disc, on Board. No ball, no whistle, no shield. Instagram crops
// a cover to a small circle, so each icon sits well inside the centre and carries no words: the
// highlight's name is typed under it in the app.

import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "../..");
const OUT = join(ROOT, "public/social/highlights");

// brand.md colours.
const BOARD = "#0A0A0A";
const CHALK = "#F6F6F3";
const KIT = "#F2D106";

// The icons are drawn on a 240 box, like Logo.svg, then placed at ICON_PX in the middle of the cover.
const W = 1080;
const H = 1920;
const ICON_PX = 760;
const STROKE = 14;

// Two themes. Yellow is the default: it stands out on Instagram in light and dark mode, where a
// Board cover disappears into a dark profile. In Yellow, the strokes and the disc swap to Board.
const THEMES = {
  yellow: { bg: KIT, ink: BOARD, accent: BOARD },
  board: { bg: BOARD, ink: CHALK, accent: KIT },
};

const icons = ({ ink, accent }) => {
  const line = `fill="none" stroke="${ink}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"`;
  return {
    // The board on a phone: halfway line and one player placed.
    product: `
      <rect x="72" y="28" width="96" height="184" rx="20" ${line}/>
      <path d="M100 30V40H140V30" ${line}/>
      <path d="M90 120H150" ${line}/>
      <circle cx="120" cy="164" r="16" fill="${accent}"/>
      <circle cx="120" cy="78" r="12" ${line}/>`,
    // A run drawn on the board, from a cross to the pick, as in the logo.
    story: `
      <path d="M52 176L72 196M72 176L52 196" ${line}/>
      <path d="M78 168C110 130 92 96 128 84C150 76 158 70 162 64" ${line}/>
      <circle cx="182" cy="56" r="22" fill="${accent}"/>`,
    // Two players and the pass between them.
    partners: `
      <circle cx="64" cy="166" r="28" ${line}/>
      <path d="M100 140C120 124 136 114 150 106" ${line} stroke-dasharray="1 22"/>
      <circle cx="178" cy="84" r="28" fill="${accent}"/>`,
    // A calendar with matchday marked.
    events: `
      <rect x="44" y="62" width="152" height="140" rx="22" ${line}/>
      <path d="M44 104H196" ${line}/>
      <path d="M88 44V76M152 44V76" ${line}/>
      <circle cx="82" cy="138" r="6" fill="${ink}"/>
      <circle cx="120" cy="138" r="6" fill="${ink}"/>
      <circle cx="82" cy="172" r="6" fill="${ink}"/>
      <circle cx="120" cy="172" r="6" fill="${ink}"/>
      <circle cx="160" cy="166" r="17" fill="${accent}"/>`,
  };
};

function cover(icon, bg) {
  const x = (W - ICON_PX) / 2;
  const y = (H - ICON_PX) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <svg x="${x}" y="${y}" width="${ICON_PX}" height="${ICON_PX}" viewBox="0 0 240 240">${icon}</svg>
  </svg>`;
}

await mkdir(OUT, { recursive: true });
for (const [theme, colours] of Object.entries(THEMES)) {
  for (const [name, icon] of Object.entries(icons(colours))) {
    // Yellow is the set in use, so it takes the plain names.
    const file = join(OUT, theme === "yellow" ? `${name}.jpg` : `${name}-board.jpg`);
    await sharp(Buffer.from(cover(icon, colours.bg))).jpeg({ quality: 92, progressive: false }).toFile(file);
    console.log(file.replace(ROOT + "/", ""));
  }
}
