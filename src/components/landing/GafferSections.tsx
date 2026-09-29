"use client";

import { HOME_HOW } from "@/constants/content/onboarding";
import { HowItWorks } from "./HowItWorks";
import { useLanding } from "./LandingProvider";

/** How it works, in three cards that follow the age picked in the hero. Off the home page for now: the story carousel tells it. */
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
