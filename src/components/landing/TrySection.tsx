"use client";

import { TRY_SECTION } from "@/constants/content/landing";
import { sayLine } from "@/lib/landing/demo";
import { DemoBoard } from "./DemoBoard";
import { useLanding } from "./LandingProvider";

/** The demo board after the story: the visitor's turn, and the board the team sheet below comes from. */
export function TrySection() {
  const { voice, demo } = useLanding();
  return (
    <section id="try" className="landing-section">
      <div className="container landing-split is-grid is-align-center has-gap-9 landing-section__pad">
        <div className="is-flex is-flex-column has-gap-5">
          <p className="is-kit has-font-headline has-font-bold text-md uppercase tracking-caps">{TRY_SECTION.kicker}</p>
          <h2 className="landing-display landing-display--section">{TRY_SECTION.heading}</h2>
          <p className="landing-pretty text-lg is-dim measure-52ch">{TRY_SECTION.body}</p>
        </div>
        <DemoBoard line={sayLine(voice, demo.ev)} />
      </div>
    </section>
  );
}
