import { cx } from "./cx";

interface InstagramIconProps {
  readonly className?: string;
}

/** The Instagram glyph, drawn in the text colour around it. Decorative: the link it sits in carries the label. */
export function InstagramIcon({ className }: InstagramIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cx("social-icon", className)} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.25" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" />
    </svg>
  );
}
