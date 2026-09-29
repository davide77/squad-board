"use client";

import Image from "next/image";
import { ONBOARDING_CONFIG } from "@/constants/config";
import { MEDIA_BAND, ONBOARDING, ONBOARDING_MEDIA } from "@/constants/content/onboarding";
import type { AgeKey } from "@/constants/football";
import { usePrefersReducedMotion } from "@/lib/hooks";

interface GafferClipProps {
  /** Which team the Gaffer is shown with. */
  readonly age: AgeKey;
  /** One first-person line from the Gaffer, over the bottom of the clip. */
  readonly caption?: string;
  /** The hero clip loads straight away; anywhere else it waits until it is needed. */
  readonly priority?: boolean;
}

/** The Gaffer with a team close to the coach's own age: a muted loop, or its still when motion is reduced. */
export function GafferClip({ age, caption, priority = false }: GafferClipProps) {
  const reduced = usePrefersReducedMotion();
  const media = ONBOARDING_MEDIA[MEDIA_BAND[age]];

  return (
    <figure className="gaffer-clip has-radius-panel">
      {media.video && !reduced ? (
        <video
          // A new age swaps the clip, and the key makes the browser load the new one.
          key={media.poster}
          className="gaffer-clip__media"
          poster={media.poster}
          muted
          loop
          autoPlay
          playsInline
          preload={priority ? "auto" : "metadata"}
          aria-label={ONBOARDING.videoLabel}
        >
          <source src={media.video.webm} type="video/webm" />
          <source src={media.video.mp4} type="video/mp4" />
        </video>
      ) : (
        // Decorative: the caption says what it shows.
        <Image
          className="gaffer-clip__media"
          src={media.poster}
          alt=""
          fill
          priority={priority}
          sizes={ONBOARDING_CONFIG.mediaSizes}
        />
      )}
      {caption && <figcaption className="gaffer-clip__caption has-font-semibold text-base leading-snug">{caption}</figcaption>}
    </figure>
  );
}
