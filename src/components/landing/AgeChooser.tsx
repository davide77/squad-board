"use client";

import { useId } from "react";
import Image from "next/image";
import { GAFFER_FACE, HOME_AGE_GROUPS, HOME_QUESTION } from "@/constants/content/onboarding";
import { AGE_GROUPS, FORMATS } from "@/constants/football";
import { useLanding } from "./LandingProvider";

/**
 * The homepage question. Optional: nothing on the page waits for it, but answering it
 * turns the page into one made for that team.
 */
export function AgeChooser() {
  const { age, setAge } = useLanding();
  const headingId = useId();

  return (
    <div className="is-flex is-flex-column has-gap-2">
      <div className="is-flex is-align-center has-gap-3">
        <Image
          src={GAFFER_FACE.src}
          alt={GAFFER_FACE.alt}
          width={GAFFER_FACE.size}
          height={GAFFER_FACE.size}
          className="age-chooser__face has-radius-pill is-shrink-0"
        />
        <p id={headingId} className="has-font-headline has-font-bold text-2xl leading-tight uppercase">
          {HOME_QUESTION.heading}
        </p>
      </div>
      <div role="group" aria-labelledby={headingId} className="age-chooser is-grid has-gap-2">
        {HOME_AGE_GROUPS.map((g) => {
          const group = AGE_GROUPS.find((a) => a.key === g.age);
          return (
            <button
              key={g.age}
              type="button"
              aria-pressed={age === g.age}
              className="age-chooser__option has-radius-field text-left"
              onClick={() => setAge(g.age)}
            >
              <span className="is-block has-font-headline has-font-bold text-lg leading-tight">{g.label}</span>
              {group && <span className="age-chooser__format is-block text-xs">{FORMATS[group.format].label}</span>}
            </button>
          );
        })}
      </div>
      <p className="text-sm is-dimmer">{HOME_QUESTION.hint}</p>
    </div>
  );
}
