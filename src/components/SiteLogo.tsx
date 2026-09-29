import Image from "next/image";
import Link from "next/link";
import { VISOR_MARK } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { cx } from "./cx";

interface SiteLogoProps {
  readonly label: string;
  readonly className?: string;
}

/** The visor mark and the name, linking home. The same size wherever it appears. */
export function SiteLogo({ label, className }: SiteLogoProps) {
  return (
    <Link
      href={ROUTES.home}
      aria-label={label}
      className={cx(
        "site-logo is-inline-flex is-align-center has-gap-3 is-chalk has-font-headline has-font-bold leading-tight tracking-number",
        className,
      )}
    >
      <Image className="site-logo__mark" src={VISOR_MARK.src} alt="" width={VISOR_MARK.headerSize} height={VISOR_MARK.headerSize} priority />
      <span className="site-logo__name">{SITE.name}</span>
    </Link>
  );
}
