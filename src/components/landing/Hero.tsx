"use client";

import Link from "next/link";
import { HERO } from "@/constants/content/landing";
import { HOME_HERO, HOME_QUESTION } from "@/constants/content/onboarding";
import { AGE_GROUPS, FORMATS } from "@/constants/football";
import { ROUTES } from "@/constants/routes";
import { AgeChooser } from "./AgeChooser";
import { GafferClip } from "./GafferClip";
import { useLanding } from "./LandingProvider";
import { VoiceCta } from "./VoiceText";

// Before anyone answers, the Gaffer is shown with the youngest side: the softest first impression.
const FIRST_CLIP_AGE = "U7";

/**
 * The page sells first, then asks. The question is optional and changes the page in
 * place: the Gaffer's clip, the headline, the tone of every section and the start button.
 */
export function Hero() {
  const { age, tone, copy } = useLanding();
  const group = AGE_GROUPS.find((a) => a.key === age);
  const key = tone ?? "none";

  return (
    <section id="top" className="container landing-split landing-split--hero is-grid is-align-center has-gap-9 has-pt-9 has-pb-11">
      <div className="is-flex is-flex-column has-gap-7 is-min-w-0">
        <div className="is-flex is-flex-column has-gap-3">
          <h1 className="has-font-body has-font-medium text-md leading-snug is-dim">{HERO.heading}</h1>
          <p aria-live="polite" className="landing-display landing-display--hero">
            {HOME_HERO.headline[key]}
          </p>
          <p className="landing-pretty text-lg is-dim measure-52ch">{copy.sub}</p>
        </div>

        <AgeChooser />

        <div className="is-flex is-flex-wrap is-align-center has-gap-4">
          {group ? (
            <Link
              href={ROUTES.board}
              className="button button--primary is-inline-flex is-align-center has-font-bold has-radius-field has-py-4 has-px-6 text-lg"
            >
              {HOME_QUESTION.start(FORMATS[group.format].label)}
            </Link>
          ) : (
            <VoiceCta />
          )}
          <span className="text-base is-dimmer">{copy.note}</span>
        </div>
      </div>

      <GafferClip age={age ?? FIRST_CLIP_AGE} caption={HOME_HERO.caption[key]} priority />
    </section>
  );
}
