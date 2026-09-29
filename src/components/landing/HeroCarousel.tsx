"use client";

import { useId, useRef, useState, type AnimationEvent, type CSSProperties, type FocusEvent, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, motion, useInView, type Variants } from "framer-motion";
import { STORY_DURATION_MS } from "@/constants/config";
import { FILM, FILM_MEDIA, STORY, STORY_UI, type StoryChapter } from "@/constants/content/landing";
import { AGE_GROUPS, FORMATS, type AgeKey } from "@/constants/football";
import { MOTION } from "@/constants/motion";
import { useFilmPlayer, usePrefersReducedMotion } from "@/lib/hooks";
import { Button } from "../Button";
import { cx } from "../cx";
import { useLanding } from "./LandingProvider";
import { VoiceCta } from "./VoiceText";

const NUMBER_DIGITS = 2;
// Shown in the age chapter until the visitor picks their own.
const SHOWN_AGE: AgeKey = "U14";
// Typing in a field never changes chapter, and a playing film keeps the arrows to seek.
const KEEPS_ARROWS = "input, textarea, select, video, [contenteditable='true']";
// How much of the hero must be on screen for the story to keep moving.
const IN_VIEW_AMOUNT = 0.4;

const chapterNumber = (i: number) => String(i + 1).padStart(NUMBER_DIGITS, "0");

// The words leave together, quickly, then come in line by line from the side the story is heading.
// `dir` is 1 going forward and -1 going back.
const WORDS: Variants = {
  enter: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: MOTION.storyStagger } },
  exit: (dir: number) => ({ opacity: 0, x: -dir * MOTION.storyX * 0.5, transition: MOTION.storyOut }),
};

const LINE: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * MOTION.storyX }),
  show: { opacity: 1, x: 0, transition: MOTION.story },
};

/**
 * The hero: one matchday in six chapters, each with its own vertical clip. It moves on by
 * itself, and stops while the visitor is reading, using the keyboard, watching the film,
 * scrolled away, or asks it to.
 */
export function HeroCarousel() {
  const { copy } = useLanding();
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  // Bumped on every change, so the progress bar starts again from empty.
  const [cycle, setCycle] = useState(0);
  const [held, setHeld] = useState(false);
  const [reading, setReading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [film, setFilm] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: IN_VIEW_AMOUNT });
  const id = useId();

  const chapter = STORY[index];
  const last = index === STORY.length - 1;
  const paused = reduced || held || reading || focused || film || !inView;
  const tabId = (i: number) => `${id}-tab-${i}`;
  const panelId = `${id}-panel`;

  // `to` may run one past either end: the direction comes from it before it wraps.
  function go(to: number) {
    setDir(to < index ? -1 : 1);
    setIndex((to + STORY.length) % STORY.length);
    setCycle((c) => c + 1);
    // A film cut off by a change of chapter is not still playing.
    setFilm(false);
  }

  function onFill(e: AnimationEvent<HTMLSpanElement>) {
    if (e.target === e.currentTarget && !paused) go(index + 1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.target instanceof Element && e.target.closest(KEEPS_ARROWS)) return;
    const to = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: STORY.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    go(to);
    // Focus goes to the chapter's tab, since what had it may be gone with the old chapter.
    const next = (to + STORY.length) % STORY.length;
    tabsRef.current?.querySelector<HTMLElement>(`#${CSS.escape(tabId(next))}`)?.focus();
  }

  // Only keyboard focus holds the story. A click on a tab should not stop it for good.
  function onFocus(e: FocusEvent<HTMLElement>) {
    if (e.target.matches(":focus-visible")) setFocused(true);
  }

  function onBlur(e: FocusEvent<HTMLElement>) {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
  }

  return (
    // Under reduced motion the chapters still cross-fade, but nothing slides or zooms.
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="top"
        aria-roledescription="carousel"
        aria-label={STORY_UI.label}
        data-paused={paused}
        className="landing-story container is-flex is-flex-column has-gap-7 has-pt-9 has-pb-11"
        style={{ "--story-ms": `${STORY_DURATION_MS}ms` } as CSSProperties}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div
          id={panelId}
          role="tabpanel"
          aria-roledescription="slide"
          aria-labelledby={tabId(index)}
          className="landing-split landing-split--hero is-grid is-align-start has-gap-9"
        >
          {/* Read out on a change only while it stands still, so a rotating hero never talks over the page. */}
          <div
            aria-live={paused ? "polite" : "off"}
            className="landing-story__words is-flex is-flex-column has-gap-6 is-min-w-0"
            // Pointing at the words means reading them. Pointing at the clip or the tabs does not stop the story.
            onPointerEnter={(e) => e.pointerType === "mouse" && setReading(true)}
            onPointerLeave={() => setReading(false)}
          >
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={chapter.key}
                custom={dir}
                variants={WORDS}
                initial="enter"
                animate="show"
                exit="exit"
                className="is-flex is-flex-column has-gap-6"
              >
                <div className="is-flex is-flex-column has-gap-3">
                  <motion.p
                    custom={dir}
                    variants={LINE}
                    className="is-flex is-align-baseline has-gap-3 has-font-headline has-font-bold text-md uppercase tracking-caps"
                  >
                    <span className="is-kit">{chapter.kicker}</span>
                    <span className="is-dimmer is-tabular">{STORY_UI.count(index + 1, STORY.length)}</span>
                  </motion.p>
                  <motion.h1 custom={dir} variants={LINE} className="landing-display landing-display--hero landing-hero__line">
                    {chapter.title}
                  </motion.h1>
                  <motion.p custom={dir} variants={LINE} className="landing-pretty text-lg is-dim measure-48ch">
                    {chapter.body}
                  </motion.p>
                </div>

                {chapter.key === "age" && (
                  <motion.div custom={dir} variants={LINE}>
                    <AgePicker onPick={() => setHeld(true)} />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* The buttons stay put between chapters, and glide when the words above them change length. */}
            <motion.div layout="position" transition={MOTION.story} className="is-flex is-flex-wrap is-align-center has-gap-4">
              <VoiceCta />
              <Button className="has-py-4 has-px-6 has-font-bold text-lg" onClick={() => go(index + 1)}>
                {last ? STORY_UI.restart : STORY_UI.next(STORY[index + 1].tab)}
              </Button>
              <span className="text-base is-dimmer">{copy.note}</span>
            </motion.div>
          </div>

          {/* On a phone the clip sits under the words, so it glides rather than jumps when they change length. */}
          <motion.div layout="position" transition={MOTION.story} className="landing-film bg-board-2 has-radius-sheet is-w-full">
            <AnimatePresence initial={false}>
              <StoryMedia key={chapter.key} chapter={chapter} n={chapterNumber(index)} still={reduced} onFilm={setFilm} />
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="is-flex is-flex-column has-gap-3">
          <div ref={tabsRef} role="tablist" aria-label={STORY_UI.chapters} className="landing-story__tabs is-grid has-gap-2">
            {STORY.map((c, i) => {
              const active = i === index;
              return (
                <button
                  key={c.key}
                  id={tabId(i)}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={panelId}
                  tabIndex={active ? 0 : -1}
                  className="landing-story__tab is-flex is-flex-column has-gap-2 text-left"
                  onClick={() => go(i)}
                >
                  <span className="landing-story__track is-block is-w-full has-radius-pill" aria-hidden="true">
                    <span
                      key={active ? `${i}-${cycle}` : i}
                      className={cx("landing-story__fill is-block", {
                        "landing-story__fill--run": active,
                        "landing-story__fill--done": i < index,
                      })}
                      onAnimationEnd={active ? onFill : undefined}
                    />
                  </span>
                  <span className="is-flex is-align-baseline has-gap-2 has-font-headline has-font-bold text-sm uppercase tracking-caps">
                    <span className={cx("is-tabular", active ? "is-kit" : "is-dimmer")}>{chapterNumber(i)}</span>
                    <span className={active ? "is-chalk" : "is-dim"}>{c.tab}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="is-flex is-flex-wrap is-align-center is-justify-between has-gap-3 text-sm is-dimmer">
            <span>{STORY_UI.keysHint}</span>
            {/* Under reduced motion it never moves on by itself, so there is nothing to pause. */}
            {!reduced && (
              <Button variant="quiet" size="tiny" className="has-gap-2" onClick={() => setHeld((h) => !h)}>
                <svg className="landing-story__glyph" viewBox="0 0 12 12" aria-hidden="true">
                  {held ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
                </svg>
                {held ? STORY_UI.play : STORY_UI.pause}
              </Button>
            )}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

interface AgePickerProps {
  readonly onPick: () => void;
}

/** Every age group, and what the Gaffer makes of it. The pick is remembered for the board's start screen. */
function AgePicker({ onPick }: AgePickerProps) {
  const { age, setAge } = useLanding();
  const shown = AGE_GROUPS.find((g) => g.key === (age ?? SHOWN_AGE));

  return (
    <div className="is-flex is-flex-column has-gap-3">
      <div role="group" aria-label={STORY_UI.ageLabel} className="landing-story__ages is-grid has-gap-2">
        {AGE_GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            aria-pressed={g.key === shown?.key}
            className="landing-story__age has-radius-field has-font-headline has-font-bold text-md"
            onClick={() => {
              setAge(g.key);
              onPick();
            }}
          >
            {g.key}
          </button>
        ))}
      </div>
      {shown && (
        <p className="is-flex is-flex-column has-gap-1 bg-board-2 has-radius-panel has-py-3 has-px-4">
          <span className="is-kit has-font-headline has-font-bold text-sm uppercase tracking-caps">
            {FORMATS[shown.format].label}
          </span>
          <span className="text-md">{STORY_UI.ageLine(shown.label, shown.phase)}</span>
        </p>
      )}
    </div>
  );
}

interface StoryMediaProps {
  readonly chapter: StoryChapter;
  /** The chapter number, as the storyboard frame labels its clip. */
  readonly n: string;
  readonly still: boolean;
  readonly onFilm: (playing: boolean) => void;
}

/** The chapter's clip, or its storyboard frame until the clip is rendered. Keyed by chapter, so each loads fresh and cross-fades. */
function StoryMedia({ chapter, n, still, onFilm }: StoryMediaProps) {
  const { videoRef, playRef, playing, play, stop } = useFilmPlayer(FILM_MEDIA.film, still, onFilm);
  const media = chapter.media;
  // Only the first chapter has the whole film behind its loop.
  const hasFilm = chapter.key === "gaffer";

  return (
    // Each clip is a layer over the last: it fades in and settles from a slight push in.
    <motion.div
      className="landing-film__layer"
      initial={{ opacity: 0, scale: MOTION.storyMediaScale }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={MOTION.storyMedia}
    >
      {media ? (
        <>
          <video
            ref={videoRef}
            className="landing-film__video"
            poster={media.poster}
            width={FILM_MEDIA.width}
            height={FILM_MEDIA.height}
            aria-label={playing ? FILM.label : undefined}
            aria-hidden={playing ? undefined : true}
            tabIndex={playing ? undefined : -1}
            controls={playing}
            muted
            loop
            playsInline
            preload="metadata"
            onEnded={stop}
          >
            <source src={media.webm} type="video/webm" />
            <source src={media.mp4} type="video/mp4" />
            {hasFilm && (
              <track kind="captions" src={FILM_MEDIA.captions} srcLang={FILM.captionsLang} label={FILM.captionsLabel} default />
            )}
          </video>
          {hasFilm && !playing && (
            <Button
              ref={playRef}
              variant="primary"
              className="landing-film__play has-py-3 has-px-5 has-font-bold text-md"
              onClick={play}
            >
              {STORY_UI.playFilm}
            </Button>
          )}
        </>
      ) : (
        <div className="landing-story__board is-flex is-flex-column is-justify-between has-p-5">
          <div className="is-flex is-align-center is-justify-between has-gap-3">
            <span className="is-kit has-font-headline has-font-bold text-sm uppercase tracking-caps">
              {STORY_UI.clipLabel(n)}
            </span>
            <span className="landing-story__pill has-radius-pill has-py-1 has-px-3 text-xs uppercase tracking-caps is-chalk">
              {STORY_UI.toCome}
            </span>
          </div>
          <p className="is-flex is-flex-column has-gap-2">
            <span className="has-font-headline has-font-bold text-sm uppercase tracking-caps is-chalk">{STORY_UI.shotLabel}</span>
            <span className="text-md leading-relaxed is-chalk">{chapter.shot}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
