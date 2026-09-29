"use client";

import { WEEK_BODIES } from "@/constants/content/landing";
import { useLanding } from "./LandingProvider";

export function WeekSection() {
  const { copy } = useLanding();

  return (
    <section id="week" className="landing-section">
      <div className="container is-flex is-flex-column has-gap-8 landing-section__pad">
        <h2 className="landing-display landing-display--section measure-72ch">{copy.weekH}</h2>
        <ol className="landing-steps is-grid">
          {copy.steps.map((title, i) => (
            <li key={title} className="is-flex is-flex-column has-gap-3 has-pt-5 has-pr-5 has-pb-2">
              <span aria-hidden="true" className="has-font-headline has-font-bold text-6xl leading-display is-kit">
                {i + 1}
              </span>
              <h3 className="has-font-headline has-font-bold text-3xl leading-tight uppercase is-chalk">{title}</h3>
              <p className="landing-pretty text-md is-dim">{WEEK_BODIES[i]}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
