import type { ComponentPropsWithRef, ReactNode } from "react";
import type { IconName } from "@/constants/icons";
import { cx } from "./cx";
import { Icon } from "./Icon";

type Variant = "default" | "primary" | "quiet" | "out" | "outline" | "chalk";
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
  /** An icon before the label: 20px in a regular button, 16px in a tiny one. */
  readonly icon?: IconName;
  readonly children: ReactNode;
}

export function Button({
  variant = "default",
  size = "regular",
  on = false,
  icon,
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
        icon && "has-gap-2",
        `button--${on ? "primary" : variant}`,
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === "tiny" ? "small" : "button"} />}
      {children}
    </button>
  );
}
