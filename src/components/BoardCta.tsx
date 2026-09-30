"use client";

import Link from "next/link";
import { BOARD_CTA } from "@/constants/content/landing";
import { HOME_QUESTION } from "@/constants/content/onboarding";
import { ROUTES } from "@/constants/routes";
import { useHasOwnBoard } from "@/lib/hooks";
import { cx } from "./cx";

interface BoardCtaProps {
  readonly className?: string;
  /** The format picked on the homepage, such as "7-a-side". Without one the button says the start screen's words. */
  readonly format?: string;
}

/** The link to the board, worded the same everywhere it appears. */
export function BoardCta({ className, format }: BoardCtaProps) {
  const back = useHasOwnBoard();
  const label = back ? BOARD_CTA.back : format ? HOME_QUESTION.start(format) : BOARD_CTA.fresh;
  return (
    <Link href={ROUTES.board} className={cx("button button--primary is-inline-flex is-align-center has-font-bold has-radius-field", className)}>
      {label}
    </Link>
  );
}
