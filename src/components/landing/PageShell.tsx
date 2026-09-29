import type { ReactNode } from "react";
import { SiteHeader } from "../SiteHeader";
import { LandingFooter } from "./Sections";

interface PageShellProps {
  readonly children: ReactNode;
}

/** The header, reading column and footer for the plain pages around the board. */
export function PageShell({ children }: PageShellProps) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container has-py-10">
        <div className="measure-62ch">{children}</div>
      </main>
      <LandingFooter />
    </>
  );
}
