#!/usr/bin/env node
// Renders an Instagram post spec to JPEGs Instagram will take.
//
//   node tools/social/render.mjs docs/social/posts/2026-10-02-the-story.json
//
// Each slide is laid out as HTML in the brand (brand.md: Board, Chalk, one kit-yellow accent,
// Saira Condensed and Barlow), screenshotted by headless Chrome, then turned into a JPEG by sharp.
// Output goes to public/social/<slug>/, so once it is pushed it is live at
// https://gafferboard.com/social/<slug>/01.jpg, which is the public URL Instagram fetches from.
//
// Spec shape (see the files in docs/social/posts/):
//   { slug, format: "feed" | "story", theme?, slides: [{ layout, theme?, kicker?, title?, body?, items?, image?, photo?, alt }] }
// Layouts: cover, text, list, screen, end, photo.
// Themes: "board" (the default, Chalk on Board) and "kit" (Board on Yellow, the highlight covers' pairing).
// A slide's theme wins over the spec's. "photo" takes a real photo, path from the repo root, full bleed
// with the headline over a fade to Board at the foot.

import { spawn } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "../..");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const JPEG_QUALITY = 90;
// Time for Google Fonts and images to land before the screenshot.
const SETTLE_MS = 6000;
const SHOT_TIMEOUT_MS = 30000;
const POLL_MS = 400;

// Instagram's sizes: 4:5 for the feed, 9:16 for stories. Stories keep text out of the top and
// bottom bands, where the app draws the progress bar and the reply box.
const FORMATS = {
  feed: { w: 1080, h: 1350, padX: 96, padTop: 88, padBottom: 88, title: 112, cover: 132 },
  story: { w: 1080, h: 1920, padX: 96, padTop: 250, padBottom: 330, title: 120, cover: 144 },
};

// brand.md colours. No others.
const C = { board: "#0A0A0A", board2: "#141414", chalk: "#F6F6F3", dim: "#96968F", dimmer: "#7E7E76", kit: "#F2D106", rule: "#2A2A28" };

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Line breaks in the spec are kept. *Words* in asterisks are set in the kit colour, once per slide at most.
// Board on Yellow, with every accent in Board too: Yellow has no second colour that reads on it.
const THEMES = {
  board: { bg: C.board, fg: C.chalk, accent: C.kit, muted: C.dim, quiet: C.dimmer, rule: C.rule, bar: C.kit },
  kit: { bg: C.kit, fg: C.board, accent: C.board, muted: C.board, quiet: C.board, rule: C.board, bar: C.board },
};

const fmt = (s = "") => esc(s).replace(/\*(.+?)\*/g, `<span class="kit">$1</span>`).replace(/\n/g, "<br>");

function slideHtml(slide, i, total, f, logo, themeName) {
  const t = THEMES[themeName];
  if (!t) throw new Error(`Unknown theme "${themeName}" on slide ${i + 1}`);
  const counter = total > 1 ? `<div class="count">${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>` : "";
  const top = `<header>${slide.kicker ? `<div class="kicker">${esc(slide.kicker)}</div>` : "<div></div>"}${counter}</header>`;
  // The site header's lockup (SiteLogo.tsx): the visor mark, then the name set in Saira Condensed.
  const lockup = `<span class="mark">${logo}</span><span class="name">Gafferboard</span>`;
  const foot = `<footer><div class="logo">${lockup}</div><div class="url">gafferboard.com</div></footer>`;

  let main = "";
  switch (slide.layout) {
    case "cover":
      main = `<main class="bottom"><h1 class="cover">${fmt(slide.title)}</h1>${slide.body ? `<p class="lede">${fmt(slide.body)}</p>` : ""}</main>`;
      break;
    case "text":
      main = `<main class="center"><h2>${fmt(slide.title)}</h2>${slide.body ? `<p>${fmt(slide.body)}</p>` : ""}</main>`;
      break;
    case "list":
      main = `<main class="center"><h2>${fmt(slide.title)}</h2><ul>${(slide.items ?? []).map((it) => `<li><i></i><span>${fmt(it)}</span></li>`).join("")}</ul></main>`;
      break;
    case "screen": {
      const src = pathToFileURL(join(ROOT, "public", slide.image)).href;
      main = `<main class="screen"><h2 class="small">${fmt(slide.title)}</h2><div class="phone"><img src="${src}" alt=""></div>${slide.body ? `<p class="caption">${fmt(slide.body)}</p>` : ""}</main>`;
      break;
    }
    case "photo": {
      if (!slide.photo) throw new Error(`Slide ${i + 1} is a photo slide with no "photo"`);
      const src = pathToFileURL(join(ROOT, slide.photo)).href;
      main = `<div class="photo"><img src="${src}" alt=""></div><main class="bottom"><h1 class="cover">${fmt(slide.title)}</h1>${slide.body ? `<p class="lede">${fmt(slide.body)}</p>` : ""}</main>`;
      break;
    }
    case "end":
      main = `<main class="center end"><div class="biglogo">${lockup}</div><h2>${fmt(slide.title)}</h2>${slide.body ? `<p>${fmt(slide.body)}</p>` : ""}</main>`;
      break;
    default:
      throw new Error(`Unknown layout "${slide.layout}" on slide ${i + 1}`);
  }

  const showFoot = slide.layout !== "end";
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Saira+Condensed:wght@600;700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${f.w}px;height:${f.h}px;background:${t.bg};color:${t.fg};overflow:hidden}
body{font-family:Barlow,system-ui,sans-serif;display:flex;flex-direction:column;padding:${f.padTop}px ${f.padX}px ${f.padBottom}px;position:relative}
body::before{content:"";position:absolute;left:0;right:0;top:0;height:10px;background:${t.bar};z-index:2}
header,main,footer{position:relative;z-index:1}
header{display:flex;justify-content:space-between;align-items:baseline;font-family:"Saira Condensed";font-weight:600;font-size:34px;letter-spacing:.08em;text-transform:uppercase}
.kicker{color:${t.accent}}
.count{color:${t.quiet};font-variant-numeric:tabular-nums}
main{flex:1;display:flex;flex-direction:column;gap:44px;min-height:0}
main.center{justify-content:center}
main.bottom{justify-content:flex-end;padding-bottom:40px}
h1,h2{font-family:"Saira Condensed";font-weight:700;letter-spacing:.005em;line-height:.98}
h1.cover{font-size:${f.cover}px}
h2{font-size:${f.title}px}
h2.small{font-size:${Math.round(f.title * 0.62)}px;line-height:1.02}
p{font-size:46px;line-height:1.34;color:${t.muted};max-width:30ch}
p.lede{color:${t.fg};font-size:50px}
.kit{color:${t.accent}}
ul{list-style:none;display:flex;flex-direction:column;gap:30px}
li{display:flex;gap:30px;align-items:baseline;font-size:48px;line-height:1.25}
li i{flex:none;width:30px;height:30px;border-radius:50%;background:${t.accent};transform:translateY(2px)}
main.screen{justify-content:center;align-items:flex-start;gap:36px;padding-top:36px}
/* Screenshots run wide and show the top of the screen, where the content is: small enough to read on a phone. */
.phone{align-self:center;flex:1;min-height:0;width:${Math.round((f.w - 2 * f.padX) * 0.82)}px;border-radius:44px;overflow:hidden;border:2px solid ${t.rule};background:${C.board2}}
.phone img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
p.caption{font-size:40px;max-width:none}
footer{display:flex;justify-content:space-between;align-items:center;padding-top:36px;border-top:2px solid ${t.rule}}
.logo,.biglogo{display:flex;align-items:center;gap:18px;font-family:"Saira Condensed";font-weight:700;letter-spacing:.01em;color:${t.fg}}
.mark svg{display:block;width:100%!important;height:100%!important}
.logo .mark{width:76px;height:76px}
.logo .name{font-size:44px}
.url{font-family:"Saira Condensed";font-weight:600;font-size:32px;letter-spacing:.06em;color:${t.muted}}
/* On Yellow the mark sits on a Board tile, as on the app icon, so its Chalk stroke and Yellow disc still read. */
.mark{display:block;flex:none}
${themeName === "kit" ? `.mark{background:${C.board};border-radius:22%;padding:6%}` : ""}
/* A real photo, full bleed, fading to Board at the foot so the headline reads over it. The footer rule goes, the fade does its job. */
.photo{position:absolute;inset:0;z-index:0}
.photo img{width:100%;height:100%;object-fit:cover;display:block}
.photo::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,10,10,.25) 0%,rgba(10,10,10,0) 30%,rgba(10,10,10,.55) 55%,rgba(10,10,10,.95) 82%,${C.board} 100%)}
${slide.layout === "photo" ? `footer{border-top-color:transparent}` : ""}
.end{align-items:flex-start}
.biglogo{gap:26px;margin-bottom:24px}
.biglogo .mark{width:160px;height:160px}
.biglogo .name{font-size:88px}
</style></head><body>${top}${main}${showFoot ? foot : ""}</body></html>`;
}

// A throwaway profile, so Chrome never touches the everyday one. Chrome on macOS can write the
// screenshot and then hang or crash on the way out, so the PNG on disk is what counts: wait for it,
// then close Chrome ourselves.
async function screenshot(html, png, f, profile) {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-sync",
      "--hide-scrollbars",
      "--allow-file-access-from-files",
      `--window-size=${f.w},${f.h}`,
      `--virtual-time-budget=${SETTLE_MS}`,
      `--screenshot=${png}`,
      pathToFileURL(html).href,
    ],
    { stdio: "ignore" },
  );
  const deadline = Date.now() + SHOT_TIMEOUT_MS;
  try {
    while (Date.now() < deadline) {
      const size = await stat(png).then((s) => s.size).catch(() => 0);
      if (size > 0) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        return;
      }
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    throw new Error(`Chrome did not write ${png} in time. Is Chrome at ${CHROME}?`);
  } finally {
    chrome.kill("SIGKILL");
  }
}

async function main() {
  const specPath = process.argv[2];
  if (!specPath) throw new Error("Usage: node tools/social/render.mjs <spec.json>");
  const spec = JSON.parse(await readFile(resolve(specPath), "utf8"));
  const f = FORMATS[spec.format ?? "feed"];
  if (!f) throw new Error(`Unknown format "${spec.format}"`);

  const text = JSON.stringify(spec);
  if (/[\u2013\u2014]/.test(text)) throw new Error("The spec has a long dash. Use a plain hyphen (brand.md, hard rule 1).");

  // The visor mark, the one the site header uses (VISOR_MARK in src/constants/brand.ts).
  const logo = await readFile(join(ROOT, "public/brand/Logo.svg"), "utf8");
  const outDir = join(ROOT, "public/social", spec.slug);
  const work = join(tmpdir(), `gb-social-${spec.slug}`);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  await mkdir(work, { recursive: true });

  const files = [];
  for (const [i, slide] of spec.slides.entries()) {
    const n = String(i + 1).padStart(2, "0");
    const html = join(work, `${n}.html`);
    const png = join(work, `${n}.png`);
    // Stories get no counter: Instagram draws its own progress bar across the top.
    const total = spec.format === "story" ? 1 : spec.slides.length;
    await writeFile(html, slideHtml(slide, i, total, f, logo, slide.layout === "photo" ? "board" : (slide.theme ?? spec.theme ?? "board")));
    await screenshot(html, png, f, join(work, `profile-${n}`));
    const out = join(outDir, `${n}.jpg`);
    // Cropped to the exact size in case Chrome's window is a pixel out, and baseline JPEG in sRGB,
    // because Instagram rejects progressive variants now and then.
    await sharp(png).resize(f.w, f.h, { fit: "cover", position: "top" }).flatten({ background: C.board }).jpeg({ quality: JPEG_QUALITY, progressive: false, chromaSubsampling: "4:4:4" }).toFile(out);
    files.push(`public/social/${spec.slug}/${n}.jpg`);
  }
  await rm(work, { recursive: true, force: true });
  console.log(files.join("\n"));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
