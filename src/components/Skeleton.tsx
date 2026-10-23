import type { CSSProperties } from "react";
import { cx } from "./cx";

interface SkeletonProps {
  readonly className?: string;
  /** A width for a line of text, so a column of them reads as words rather than bars. */
  readonly width?: CSSProperties["width"];
}

/** A grey stand-in for something still loading. Hidden from a screen reader: the region round it says it is loading. */
export function Skeleton({ className, width }: SkeletonProps) {
  return <span aria-hidden="true" className={cx("skeleton", className)} style={width === undefined ? undefined : { width }} />;
}
