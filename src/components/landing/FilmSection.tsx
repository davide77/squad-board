"use client";

import { useEffect, useRef, useState } from "react";
import { FILM, FILM_MEDIA } from "@/constants/content/landing";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { Button } from "../Button";
import { useLanding } from "./LandingProvider";
import { VoiceCta } from "./VoiceText";

type Mode = "teaser" | "film";

/** The film under the hero: a silent loop until the visitor asks for the whole thing with sound. */
export function FilmSection() {
  const { copy } = useLanding();
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState<Mode>("teaser");
  const videoRef = useRef<HTMLVideoElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const watched = useRef(false);

  // The loop only moves for visitors who have not asked for less motion. It starts
  // here rather than through autoPlay, so the choice is known before it plays.
  useEffect(() => {
    const video = videoRef.current;
    if (mode !== "teaser" || !video) return;
    if (reduced) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [mode, reduced]);

  // Focus follows the swap, so a keyboard user is never left on a button that has gone.
  useEffect(() => {
    if (mode === "film") {
      watched.current = true;
      videoRef.current?.focus();
    } else if (watched.current) {
      playRef.current?.focus();
    }
  }, [mode]);

  // Browsers only allow sound when play() runs inside the click, so the same element
  // switches to the film here rather than a new one mounting after the render.
  function playFilm() {
    const video = videoRef.current;
    if (!video) return;
    video.src = FILM_MEDIA.film;
    video.loop = false;
    video.muted = false;
    video.play().catch(() => {});
    setMode("film");
  }

  function backToTeaser() {
    const video = videoRef.current;
    if (video) {
      video.removeAttribute("src");
      video.muted = true;
      video.loop = true;
      video.load();
    }
    setMode("teaser");
  }

  const film = mode === "film";

  return (
    <section id="film" className="landing-section">
      <div className="container landing-split is-grid is-align-center has-gap-9 landing-section__pad">
        <div className="is-flex is-flex-column has-gap-5">
          <h2 className="landing-display landing-display--section">{copy.filmH}</h2>
          <p className="landing-pretty text-lg is-dim measure-52ch">{FILM.body}</p>
          <div className="is-flex is-flex-wrap is-align-center has-gap-4">
            <VoiceCta />
          </div>
        </div>

        <div className="landing-film bg-board-2 has-radius-sheet is-w-full">
          <video
            ref={videoRef}
            className="landing-film__video"
            poster={FILM_MEDIA.poster}
            width={FILM_MEDIA.width}
            height={FILM_MEDIA.height}
            aria-label={film ? FILM.label : undefined}
            aria-hidden={film ? undefined : true}
            tabIndex={film ? undefined : -1}
            controls={film}
            muted
            loop
            playsInline
            preload="metadata"
            onEnded={backToTeaser}
          >
            <source src={FILM_MEDIA.teaser.webm} type="video/webm" />
            <source src={FILM_MEDIA.teaser.mp4} type="video/mp4" />
            <track kind="captions" src={FILM_MEDIA.captions} srcLang={FILM.captionsLang} label={FILM.captionsLabel} default />
          </video>
          {!film && (
            <Button
              ref={playRef}
              variant="primary"
              className="landing-film__play has-py-3 has-px-5 has-font-bold text-md"
              onClick={playFilm}
            >
              {FILM.play}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
