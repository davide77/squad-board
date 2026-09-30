import { useId } from "react";
import { STRIP_COLOURS } from "@/constants/brand";
import type { Kit } from "@/lib/board/types";
import { cx } from "../cx";

interface KitIconProps {
  readonly kit: Kit;
  readonly className?: string;
}

// Drawn on a 40 by 56 box: the shirt with its sleeves, the shorts under it, then the socks.
const SHIRT = "M13 2 8 4 2 10 6 16 10 13V30H30V13L34 16 38 10 32 4 27 2Q20 7 13 2Z";
const SHORTS = "M10 32H30L31 42H22L20 38 18 42H9Z";
const SOCKS = [11, 23];
// Where the second colour lands for each pattern, before the shirt clips it.
const SECOND = {
  plain: [],
  stripes: [{ x: 12, y: 0, w: 4, h: 32 }, { x: 20, y: 0, w: 4, h: 32 }, { x: 28, y: 0, w: 4, h: 32 }],
  hoops: [{ x: 0, y: 8, w: 40, h: 4 }, { x: 0, y: 16, w: 40, h: 4 }, { x: 0, y: 24, w: 40, h: 4 }],
  halves: [{ x: 20, y: 0, w: 20, h: 32 }],
  sleeves: [{ x: 0, y: 0, w: 10, h: 32 }, { x: 30, y: 0, w: 10, h: 32 }],
} as const;

/** The strip, drawn: a coach checks it at a glance, as a parent will see it on the day. Decorative. */
export function KitIcon({ kit, className }: KitIconProps) {
  const clip = useId();
  const hex = (c: keyof typeof STRIP_COLOURS) => STRIP_COLOURS[c].hex;
  return (
    <svg viewBox="0 0 40 56" className={cx("kit-icon", className)} aria-hidden="true">
      <clipPath id={clip}>
        <path d={SHIRT} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <path d={SHIRT} fill={hex(kit.shirt)} />
        {SECOND[kit.pattern].map((r) => (
          <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={r.h} fill={hex(kit.second)} />
        ))}
      </g>
      <path d={SHIRT} className="kit-icon__line" />
      <path d={SHORTS} fill={hex(kit.shorts)} className="kit-icon__part" />
      {SOCKS.map((x) => (
        <rect key={x} x={x} y={44} width={6} height={10} rx={1.5} fill={hex(kit.socks)} className="kit-icon__part" />
      ))}
    </svg>
  );
}
