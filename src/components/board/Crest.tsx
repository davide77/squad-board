import Image from "next/image";
import { BADGE_CONFIG } from "@/constants/config";
import { monogram } from "@/lib/board/names";
import { cx } from "../cx";

interface CrestProps {
  readonly team: string;
  readonly badge: string;
  readonly className?: string;
}

/** Decorative, as the team name sits beside it. The club's badge when the coach added one, otherwise the team's initials on the kit colour. */
export function Crest({ team, badge, className }: CrestProps) {
  if (badge) {
    return (
      <Image
        className={cx("crest crest--badge is-shrink-0", className)}
        src={badge}
        alt=""
        aria-hidden="true"
        width={BADGE_CONFIG.crestPx}
        height={BADGE_CONFIG.crestPx}
        unoptimized
      />
    );
  }
  const mono = monogram(team);
  return (
    <div
      className={cx(
        "crest is-flex is-align-center is-justify-center is-shrink-0 has-radius-pill has-font-headline has-font-bold text-lg tracking-number",
        !mono && "crest--empty",
        className,
      )}
      aria-hidden="true"
    >
      {mono}
    </div>
  );
}
