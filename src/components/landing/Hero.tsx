"use client";

import { useId } from "react";
import { HERO, VOICES } from "@/constants/content/landing";
import { sayLine } from "@/lib/landing/demo";
import { DemoBoard } from "./DemoBoard";
import { useLanding } from "./LandingProvider";
import { VoiceCta } from "./VoiceText";

export function Hero() {
  const { voice, setVoice, copy, demo } = useLanding();
  const line = sayLine(voice, demo.ev);
  const voiceLabelId = useId();

  return (
    <section id="top" className="container landing-split landing-split--hero is-grid is-align-center has-gap-9 has-pt-9 has-pb-11">
      <div className="is-flex is-flex-column has-gap-7 is-min-w-0">
        <div className="is-flex is-flex-column has-gap-3">
          <h1 className="has-font-body has-font-medium text-md leading-snug is-dim">{HERO.heading}</h1>
          <p className="has-font-headline has-font-bold text-base tracking-caps uppercase is-kit">{HERO.kicker}</p>
          <p aria-live="polite" className="landing-display landing-display--hero landing-hero__line">
            {line}
          </p>
          <p className="landing-pretty text-lg is-dim measure-52ch">{copy.sub}</p>
        </div>

        <div className="is-flex is-flex-column has-gap-2">
          <p id={voiceLabelId} className="text-base has-font-semibold">
            {HERO.voiceLabel}
          </p>
          <div role="group" aria-labelledby={voiceLabelId} className="voice-picker is-grid has-gap-2">
            {VOICES.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={v.key === voice}
                className="voice-option is-flex is-flex-column is-justify-center has-gap-1 has-py-2 has-px-3 has-radius-panel text-left"
                onClick={() => setVoice(v.key)}
              >
                <span className="has-font-headline has-font-bold text-xl leading-tight uppercase">{v.name}</span>
                <span className="voice-option__desc text-xs leading-snug">{v.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-sm is-dimmer measure-52ch">{HERO.voiceNote}</p>
        </div>

        <div className="is-flex is-flex-wrap is-align-center has-gap-4">
          <VoiceCta />
          <span className="text-base is-dimmer">{copy.note}</span>
        </div>
      </div>

      <DemoBoard line={line} />
    </section>
  );
}
