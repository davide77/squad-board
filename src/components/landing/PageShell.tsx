import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { VISOR_MARK } from "@/constants/brand";
import { PAGE_SHELL } from "@/constants/content/pages";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { LandingFooter } from "./Sections";

interface PageShellProps {
  readonly children: ReactNode;
}

/** The header, reading column and footer for the plain pages around the board. */
export function PageShell({ children }: PageShellProps) {
  return (
    <>
      <header className="landing-header">
        <div className="container is-flex is-flex-wrap is-align-center is-justify-between has-gap-3 has-py-3">
          <Link
            href={ROUTES.home}
            aria-label={PAGE_SHELL.home}
            className="is-inline-flex is-align-center has-gap-2 is-chalk has-font-headline has-font-bold text-2xl tracking-number"
          >
            <Image src={VISOR_MARK.src} alt="" width={VISOR_MARK.headerSize} height={VISOR_MARK.headerSize} priority />
            <span>{SITE.name}</span>
          </Link>
          <Link
            href={ROUTES.board}
            className="button button--primary is-inline-flex is-align-center has-font-bold has-radius-field has-py-2 has-px-4 text-md"
          >
            {PAGE_SHELL.cta}
          </Link>
        </div>
      </header>
      <main id="main" className="container has-py-10">
        <div className="measure-62ch">{children}</div>
      </main>
      <LandingFooter />
    </>
  );
}
