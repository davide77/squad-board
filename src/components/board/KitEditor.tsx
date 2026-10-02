"use client";

import { type CSSProperties } from "react";
import { STRIP_COLOUR_KEYS, STRIP_COLOURS, type StripColour } from "@/constants/brand";
import { KIT } from "@/constants/content/board";
import { KIT_PATTERNS } from "@/constants/football";
import { kitWords } from "@/lib/board/kit";
import type { Kit, KitSide } from "@/lib/board/types";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { KitIcon } from "./KitIcon";
import { ControlRow } from "./Panel";

type ColourPart = "shirt" | "second" | "shorts" | "socks";

interface KitEditorProps {
  readonly side: KitSide;
  readonly label: string;
  readonly open: boolean;
  readonly onToggle: () => void;
}

/**
 * One strip under Customise your club: drawn, then said in words, as the call-up will say it. Change opens
 * the parts: shirt, pattern and its second colour, shorts, socks.
 */
export function KitEditor({ side, label, open, onToggle }: KitEditorProps) {
  const { state, act } = useBoard();
  const kit = state.data.kits[side];
  const set = (part: Partial<Kit>) => act({ type: "setKit", side, kit: part });

  const colours = (part: ColourPart) => (
    <ControlRow label={KIT.parts[part]} key={part}>
      <div className="is-flex is-flex-wrap has-gap-2">
        {STRIP_COLOUR_KEYS.map((c: StripColour) => (
          <button
            key={c}
            type="button"
            className="swatch has-radius-pill"
            style={{ "--swatch": STRIP_COLOURS[c].hex } as CSSProperties}
            title={STRIP_COLOURS[c].name}
            aria-label={KIT.swatchLabel(label, KIT.parts[part], STRIP_COLOURS[c].name)}
            aria-pressed={kit[part] === c}
            onClick={() => set({ [part]: c })}
          />
        ))}
      </div>
    </ControlRow>
  );

  return (
    <div className="kit-editor has-mt-3 has-pt-3">
      <div className="is-flex is-align-center has-gap-3">
        <KitIcon kit={kit} className="kit-icon--md is-shrink-0" />
        <div className="is-flex-1 is-min-w-0">
          <p className="has-font-headline text-xs tracking-caps uppercase is-dim">{label}</p>
          <p className="kit-editor__words text-base">{kitWords(kit)}</p>
        </div>
        <Button size="tiny" aria-expanded={open} onClick={onToggle}>
          {open ? KIT.done : KIT.edit}
        </Button>
      </div>
      {open && (
        <div className="has-mt-2">
          {colours("shirt")}
          <ControlRow label={KIT.parts.pattern}>
            {KIT_PATTERNS.map((p) => (
              <Button key={p.key} size="tiny" on={kit.pattern === p.key} aria-pressed={kit.pattern === p.key} onClick={() => set({ pattern: p.key })}>
                {p.label}
              </Button>
            ))}
          </ControlRow>
          {/* Plain wears one colour, so the second waits until a pattern needs it. */}
          {kit.pattern !== "plain" && colours("second")}
          {colours("shorts")}
          {colours("socks")}
        </div>
      )}
    </div>
  );
}
