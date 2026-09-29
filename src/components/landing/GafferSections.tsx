"use client";

import { HOME_DEMO, HOME_HOW } from "@/constants/content/onboarding";
import { sayLine } from "@/lib/landing/demo";
import { DemoBoard } from "./DemoBoard";
import { HowItWorks } from "./HowItWorks";
import { useLanding } from "./LandingProvider";

/** How it works, in three cards that follow the age picked in the hero. Replaces the four numbered steps. */
export function HowItWorksSection() {
  const { tone } = useLanding();
  return (
    <section id="week" className="landing-section">
      <div className="container is-flex is-flex-column has-gap-8 landing-section__pad">
        <h2 className="landing-display landing-display--section measure-72ch">{HOME_HOW.heading[tone ?? "none"]}</h2>
        <HowItWorks />
      </div>
    </section>
  );
}

/** The demo board: moved out of the hero so the Gaffer leads, and still the board the team sheet below comes from. */
export function DemoSection() {
  const { voice, tone, demo } = useLanding();
  const line = sayLine(voice, demo.ev);
  return (
    <section id="try" className="landing-section">
      <div className="container is-flex is-flex-column has-gap-7 landing-section__pad">
        <h2 className="landing-display landing-display--section measure-72ch">{HOME_DEMO.heading[tone ?? "none"]}</h2>
        <div className="is-flex is-justify-center">
          <DemoBoard line={line} />
        </div>
      </div>
    </section>
  );
}
