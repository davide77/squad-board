import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BOARD_PALETTE, KIT_COLOURS, VISOR_MARK } from "@/constants/brand";
import { SITE } from "@/constants/site";
import { OG_IMAGE } from "@/constants/seo";

// The share card every page inherits: what WhatsApp, iMessage and social networks show
// when a Gafferboard link is sent. Drawn once at build time.
//
// ImageResponse renders with Satori, which reads inline `style` only: no stylesheet, no
// classes. That is why this file uses style props, against the house rule for JSX.

export const alt = OG_IMAGE.alt;
export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };
export const contentType = "image/png";

// The site header lockup: the visor mark, then the name.
const MARK_PX = 104;
const NAME_PX = 60;
const LOCKUP_GAP = 20;
const PAD = 80;
const HEADLINE_PX = 112;
const SUB_PX = 36;
const DOMAIN_PX = 32;
const TTF_URL = /src: url\((.+?)\) format\('truetype'\)/;

/** Saira Condensed Bold as TTF, which Satori can read. Falls back to the built-in font offline. */
async function headlineFont() {
  try {
    const css = await (await fetch(OG_IMAGE.fontCss)).text();
    const url = TTF_URL.exec(css)?.[1];
    if (!url) return [];
    const data = await (await fetch(url)).arrayBuffer();
    return [{ name: OG_IMAGE.fontName, data, weight: 700 as const, style: "normal" as const }];
  } catch {
    return [];
  }
}

export default async function OpengraphImage() {
  const [logo, fonts] = await Promise.all([
    readFile(join(process.cwd(), "public", VISOR_MARK.src)),
    headlineFont(),
  ]);
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;
  const kit = KIT_COLOURS[0].kit;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: PAD,
          background: BOARD_PALETTE.board,
          color: BOARD_PALETTE.chalk,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: LOCKUP_GAP }}>
          <img src={logoSrc} width={MARK_PX} height={MARK_PX} alt="" />
          <div style={{ fontFamily: OG_IMAGE.fontName, fontSize: NAME_PX, fontWeight: 700 }}>{SITE.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontFamily: OG_IMAGE.fontName,
              fontSize: HEADLINE_PX,
              fontWeight: 700,
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            {OG_IMAGE.headline}
          </div>
          <div style={{ fontSize: SUB_PX, color: BOARD_PALETTE.dim }}>{OG_IMAGE.sub}</div>
        </div>
        <div style={{ fontFamily: OG_IMAGE.fontName, fontSize: DOMAIN_PX, fontWeight: 700, color: kit }}>
          {OG_IMAGE.domain}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
