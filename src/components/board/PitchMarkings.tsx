// Its own file so the landing demo can draw the pitch without pulling in the board's
// provider and storage code.

/** Pitch lines, drawn in a 300 x 400 box and stretched to the pitch. */
export function PitchMarkings() {
  return (
    <svg className="pitch__lines" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
      <rect x="10" y="10" width="280" height="380" />
      <line x1="10" y1="200" x2="290" y2="200" />
      <circle cx="150" cy="200" r="42" />
      <circle className="pitch__spot" cx="150" cy="200" r="2.5" />
      <rect x="66" y="10" width="168" height="62" />
      <rect x="112" y="10" width="76" height="24" />
      <rect x="66" y="328" width="168" height="62" />
      <rect x="112" y="366" width="76" height="24" />
    </svg>
  );
}
