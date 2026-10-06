import { ICON_GRID, ICON_SIZES, ICON_STROKE, ICONS, type IconName, type IconShape, type IconSize } from "@/constants/icons";
import { cx } from "./cx";

interface IconProps {
  readonly name: IconName;
  readonly size?: IconSize;
  readonly className?: string;
}

function Shape({ shape }: { readonly shape: IconShape }) {
  switch (shape.kind) {
    case "path":
      return <path d={shape.d} />;
    case "circle":
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} />;
    case "rect":
      return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} />;
    case "dot":
      return <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill="currentColor" stroke="none" />;
    case "disc":
      return <circle className="icon__disc" cx={shape.cx} cy={shape.cy} r={shape.r} stroke="none" />;
  }
}

/**
 * One icon from the set, drawn in the text colour around it. Decorative: the control it sits in
 * carries the label, or the visible text beside it does.
 */
export function Icon({ name, size = "board", className }: IconProps) {
  const px = ICON_SIZES[size];
  return (
    <svg
      viewBox={`0 0 ${ICON_GRID} ${ICON_GRID}`}
      width={px}
      height={px}
      className={cx("icon is-shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name].map((shape, i) => (
        <Shape key={i} shape={shape} />
      ))}
    </svg>
  );
}
