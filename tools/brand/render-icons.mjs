#!/usr/bin/env node
// Renders every icon on the site from public/brand/Logo.svg.
//
//   node tools/brand/render-icons.mjs
//
// The mark itself comes from Figma, the source of truth: the "Export/Logo 240" frame on the
// Components page of the Gafferboard file, exported as SVG with text outlined, saved over
// public/brand/Logo.svg. Run this after every export so nothing on the site drifts from the file.
// brand.md, "Logo".

import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "../..");
const BRAND = join(ROOT, "public/brand");
const APP = join(ROOT, "src/app");

// brand.md colours.
const BOARD = "#0A0A0A";

// Logo.svg is drawn on a 240 box.
const BOX = 240;
// The rounded square the favicon and app icons sit on.
const ICON_RADIUS = 52;
// Inside the rounded square the mark sits a touch smaller, nudged to the optical centre.
const ICON_INNER = 'transform="translate(-2.54 0.42) scale(0.9882)"';
// Share of the square the 240 box fills: the maskable icon keeps the mark inside the central safe
// zone, the avatar leaves room for the circle crop, the Apple icon is rounded by iOS itself.
const MASKABLE_SHARE = 0.71;
const AVATAR_SHARE = 0.8;
const APPLE_SHARE = 1;

const logo = await readFile(join(BRAND, "Logo.svg"), "utf8");
// The art without its <svg> wrapper. The wrapper's fill="none" goes with it, so every placement
// below puts it back, or the open G is filled in black. The export's own <title> goes too, so the
// icons keep the one title they set.
const inner = logo.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>[\s\S]*?<\/title>/, "");

// The mark on a Board rounded square: the favicon and the "any" app icons.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}" role="img" aria-label="Gafferboard"><title>Gafferboard</title><rect width="${BOX}" height="${BOX}" rx="${ICON_RADIUS}" fill="${BOARD}"/><g fill="none" ${ICON_INNER}>${inner}</g></svg>\n`;
await writeFile(join(BRAND, "gafferboard-icon.svg"), icon);
await writeFile(join(APP, "icon.svg"), icon);

const png = (svg, size) => sharp(Buffer.from(svg), { density: (72 * size) / BOX }).resize(size, size).png();

// The mark on a full-bleed Board square, the 240 box scaled to `share` of it and centred.
const square = (share) => {
  const pad = (BOX * (1 - share)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}"><rect width="${BOX}" height="${BOX}" fill="${BOARD}"/><g fill="none" transform="translate(${pad} ${pad}) scale(${share})">${inner}</g></svg>`;
};

const outputs = [
  [icon, 192, join(BRAND, "gafferboard-icon-192.png")],
  [icon, 512, join(BRAND, "gafferboard-icon-512.png")],
  [square(MASKABLE_SHARE), 512, join(BRAND, "gafferboard-icon-maskable-512.png")],
  [square(AVATAR_SHARE), 1080, join(BRAND, "gafferboard-avatar-1080.png")],
  [square(APPLE_SHARE), 180, join(APP, "apple-icon.png")],
];

for (const [svg, size, file] of outputs) {
  await png(svg, size).toFile(file);
  console.log(`${size}px  ${file.replace(`${ROOT}/`, "")}`);
}
