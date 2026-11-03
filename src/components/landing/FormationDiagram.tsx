import type { CSSProperties } from "react";
import { FORMAT_PAGE } from "@/constants/content/formats";
import { FORMATIONS } from "@/constants/football";
import { PitchMarkings } from "../board/PitchMarkings";
import { cx } from "../cx";

interface FormationDiagramProps {
  readonly shape: string;
}

// The board measures y up from its own goal line. The diagram draws its own goal at the bottom.
const FLIP = 100;

/**
 * A formation drawn on the board's pitch, from the same slots the board uses. Rendered on the
 * server, so the picture is in the HTML that search engines and AI answers read.
 */
export function FormationDiagram({ shape }: FormationDiagramProps) {
  const slots = FORMATIONS[shape] ?? [];
  return (
    <div role="img" aria-label={FORMAT_PAGE.diagramLabel(shape)} className="formation-diagram pitch has-radius-panel">
      <PitchMarkings />
      {slots.map((s, i) => (
        <span
          key={`${shape}-${i}`}
          aria-hidden="true"
          className={cx("formation-diagram__marker has-radius-pill", s.role === "GK" && "formation-diagram__marker--keeper")}
          style={{ "--x": `${s.x}%`, "--y": `${FLIP - s.y}%` } as CSSProperties}
        />
      ))}
    </div>
  );
}
