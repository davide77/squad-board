import Link from "next/link";
import type { ReactNode } from "react";
import { PAGE_SHELL } from "@/constants/content/pages";
import { ROUTES } from "@/constants/routes";
import { SiteHeader } from "../SiteHeader";
import { LandingFooter } from "./Sections";

interface PageShellProps {
  readonly children: ReactNode;
}

/** The header, reading column and footer for the plain pages around the board. */
export function PageShell({ children }: PageShellProps) {
  return (
    <>
      <SiteHeader
        action={
          <Link
            href={ROUTES.board}
            className="button button--primary is-inline-flex is-align-center has-font-bold has-radius-field has-py-2 has-px-4 text-md"
          >
            {PAGE_SHELL.cta}
          </Link>
        }
      />
      <main id="main" className="container has-py-10">
        <div className="measure-62ch">{children}</div>
      </main>
      <LandingFooter />
    </>
  );
}
