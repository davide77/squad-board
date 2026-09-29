"use client";

import { createContext, use, useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { LANDING_CONFIG } from "@/constants/config";
import { COPY, DEFAULT_VOICE, type VoiceCopy, type VoiceKey } from "@/constants/content/landing";
import { DEMO_START, demoReducer, demoSheet, type DemoAction, type DemoState } from "@/lib/landing/demo";
import { TONE_FOR_PHASE, VOICE_FOR_TONE, type Tone } from "@/constants/content/onboarding";
import { AGE_GROUPS, type AgeKey } from "@/constants/football";
import { writeAgePref } from "@/lib/voice";

interface LandingContextValue {
  /** The age group picked in the hero, which the rest of the page adapts to. */
  readonly age: AgeKey | null;
  readonly setAge: (age: AgeKey) => void;
  /** The Gaffer's tone for that age: very soft up to under 11s, rough from under 12s. */
  readonly tone: Tone | null;
  /** The voice the page's copy is written in, which follows the tone. */
  readonly voice: VoiceKey;
  readonly copy: VoiceCopy;
  readonly demo: DemoState;
  readonly act: (a: DemoAction) => void;
  readonly initials: boolean;
  readonly toggleInitials: () => void;
  readonly sheet: string;
  readonly copied: boolean;
  readonly copySheet: () => void;
}

const LandingContext = createContext<LandingContextValue | null>(null);

export function useLanding(): LandingContextValue {
  const ctx = use(LandingContext);
  if (!ctx) throw new Error("useLanding must be used inside LandingProvider");
  return ctx;
}

interface LandingProviderProps {
  readonly children: ReactNode;
}

/** The age picked in the hero, the voice it sets and the demo board, shared by every section of the page. */
export function LandingProvider({ children }: LandingProviderProps) {
  const [age, setAgeState] = useState<AgeKey | null>(null);
  // Remembered too, so the start screen opens on the same age group.
  const setAge = useCallback((a: AgeKey) => {
    setAgeState(a);
    writeAgePref(a);
  }, []);
  const phase = AGE_GROUPS.find((a) => a.key === age)?.phase;
  const tone = phase ? TONE_FOR_PHASE[phase] : null;
  // Every headline on the page speaks in the Gaffer for that age.
  const voice = tone ? VOICE_FOR_TONE[tone] : DEFAULT_VOICE;
  const [demo, act] = useReducer(demoReducer, DEMO_START);
  const [initials, setInitials] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const sheet = demoSheet(demo, initials);

  const copySheet = useCallback(() => {
    navigator.clipboard?.writeText(sheet).catch(() => {});
    act({ type: "copied" });
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), LANDING_CONFIG.copiedMs);
  }, [sheet]);

  const toggleInitials = useCallback(() => setInitials((v) => !v), []);

  const value = useMemo(
    () => ({ age, setAge, tone, voice, copy: COPY[voice], demo, act, initials, toggleInitials, sheet, copied, copySheet }),
    [age, setAge, tone, voice, demo, initials, toggleInitials, sheet, copied, copySheet],
  );

  return <LandingContext value={value}>{children}</LandingContext>;
}
