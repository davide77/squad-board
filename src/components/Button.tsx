import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "./cx";

type Variant = "default" | "primary" | "quiet";
type Size = "regular" | "tiny";

const SIZES: Record<Size, string> = {
  regular: "has-py-2 has-px-3 text-base has-radius-field",
  tiny: "has-py-1 has-px-2 text-sm has-radius-sm",
};

interface ButtonProps extends ComponentPropsWithRef<"button"> {
  readonly variant?: Variant;
  readonly size?: Size;
  /** A toggle that is currently on, shown in the kit colour. */
  readonly on?: boolean;
  readonly children: ReactNode;
}

export function Button({
  variant = "default",
  size = "regular",
  on = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "button",
        "is-inline-flex is-align-center is-justify-center has-font-body has-font-medium leading-snug",
        SIZES[size],
        `button--${on ? "primary" : variant}`,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
