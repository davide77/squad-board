"use client";

import { useRef, useState, type CSSProperties, type UIEvent } from "react";
import { HOME_QUESTION, TONE_SLIDES, type Tone } from "@/constants/content/onboarding";
import { AGE_GROUPS, FORMATIONS, FORMATS, type AgeKey } from "@/constants/football";
import { PitchMarkings } from "../board/PitchMarkings";
import { cx } from "../cx";
import { useLanding } from "./LandingProvider";

// Made-up names for the squad card. Players are never gendered.
const SAMPLE_SQUAD = ["Alex", "Sam", "Riley", "Jamie", "Charlie", "Frankie", "Remi", "Ellis"];
// Before anyone picks an age, the page shows an under 11s side, told softly.
const FALLBACK_AGE: AgeKey = "U10";
const FALLBACK_TONE: Tone = "soft";

/**
 * Three cards, swiped or stepped through: squad in, pick the side, matchday. They follow
 * the age picked in the hero: its format on the pitch, its Gaffer in the words.
 */
export function HowItWorks() {
  const { age, tone } = useLanding();
  const words = TONE_SLIDES[tone ?? FALLBACK_TONE];
  const group = AGE_GROUPS.find((a) => a.key === (age ?? FALLBACK_AGE));
  const trackRef = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(0);

  const cards = [
    { heading: words.squadHeading, body: words.squadBody, visual: <Names /> },
    { heading: words.sideHeading, body: words.sideBody, visual: group ? <MiniPitch shape={FORMATS[group.format].shapes[0]} /> : null },
    { heading: words.matchHeading, body: words.matchBody, visual: <p className="how-it-works__bubble has-font-semibold text-lg leading-snug">{words.matchLine}</p> },
  ];

  function go(i: number) {
    const track = trackRef.current;
    const card = track?.children[i] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }

  // The dots follow a swipe as well as the buttons.
  function onScroll(e: UIEvent<HTMLOListElement>) {
    const track = e.currentTarget;
    const width = (track.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
    setCurrent(Math.round(track.scrollLeft / width));
  }

  return (
    <section className="how-it-works is-flex is-flex-column has-gap-4" aria-roledescription="carousel" aria-label={HOME_QUESTION.howLabel}>
      <ol ref={trackRef} className="how-it-works__track is-flex has-gap-4" onScroll={onScroll}>
        {cards.map((c, i) => (
          <li
            key={i}
            className="how-it-works__card is-flex is-flex-column has-gap-4 has-p-5 has-radius-panel"
            aria-roledescription="slide"
            aria-label={HOME_QUESTION.slide(i + 1, cards.length)}
          >
            <div className="how-it-works__visual is-flex is-align-center is-justify-center">{c.visual}</div>
            <h3 className="how-it-works__heading text-2xl leading-tight uppercase">{c.heading}</h3>
            <p className="text-md leading-relaxed is-dim">{c.body}</p>
          </li>
        ))}
      </ol>
      <div className="how-it-works__controls is-flex is-align-center is-justify-between has-gap-3">
        <button
          type="button"
          className="how-it-works__arrow hit-area has-radius-pill"
          aria-label={HOME_QUESTION.previous}
          disabled={current === 0}
          onClick={() => go(current - 1)}
        >
          <span aria-hidden="true">&larr;</span>
        </button>
        <ol className="is-flex has-gap-2" aria-hidden="true">
          {cards.map((_, i) => (
            <li key={i} className={cx("how-it-works__dot has-radius-pill", i === current && "how-it-works__dot--on")} />
          ))}
        </ol>
        <button
          type="button"
          className="how-it-works__arrow hit-area has-radius-pill"
          aria-label={HOME_QUESTION.next}
          disabled={current === cards.length - 1}
          onClick={() => go(current + 1)}
        >
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </section>
  );
}

function Names() {
  return (
    <ul className="is-flex is-flex-wrap is-justify-center has-gap-2" aria-hidden="true">
      {SAMPLE_SQUAD.map((n, i) => (
        <li key={n} className="how-it-works__name has-radius-pill has-py-1 has-px-3 text-base" style={{ "--i": i } as CSSProperties}>
          {n}
        </li>
      ))}
    </ul>
  );
}

/** The board's own pitch in the format this age plays. */
function MiniPitch({ shape }: { readonly shape: string }) {
  return (
    <div className="how-it-works__pitch pitch has-radius-panel" aria-hidden="true">
      <PitchMarkings />
      {FORMATIONS[shape].map((s, i) => (
        <span
          key={`${shape}-${i}`}
          className={cx("how-it-works__marker has-radius-pill", s.role === "GK" && "how-it-works__marker--keeper")}
          style={{ "--x": `${s.x}%`, "--y": `${100 - s.y}%`, "--i": i } as CSSProperties}
        />
      ))}
    </div>
  );
}
