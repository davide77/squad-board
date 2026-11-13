import { CAPTAIN } from "@/constants/content/board";
import { cx } from "../cx";

interface CaptainMarkProps {
  readonly className?: string;
}

/** The C beside the captain's name or on their marker. A screen reader hears "captain". */
export function CaptainMark({ className }: CaptainMarkProps) {
  return (
    <span className={cx("captain-mark is-inline-flex is-align-center is-justify-center has-radius-pill has-font-headline has-font-bold text-2xs leading-tight is-shrink-0", className)}>
      <span aria-hidden="true">{CAPTAIN.mark}</span>
      <span className="sr-only">{CAPTAIN.label}</span>
    </span>
  );
}
