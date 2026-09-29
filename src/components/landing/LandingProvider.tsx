"use client";

import { createContext, use, useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { LANDING_CONFIG } from "@/constants/config";
import { COPY, DEFAULT_VOICE, type VoiceCopy, type VoiceKey } from "@/constants/content/landing";
import { DEMO_START, demoReducer, demoSheet, type DemoAction, type DemoState } from "@/lib/landing/demo";
import { writeVoicePref } from "@/lib/voice";

interface LandingContextValue {
  readonly voice: VoiceKey;
  readonly setVoice: (v: VoiceKey) => void;
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

/** The voice picked in the hero and the demo board, shared by every section of the page. */
export function LandingProvider({ children }: LandingProviderProps) {
  const [voice, setVoiceState] = useState<VoiceKey>(DEFAULT_VOICE);
  // Remembered on this device, so the board starts with the same gaffer.
  const setVoice = useCallback((v: VoiceKey) => {
    setVoiceState(v);
    writeVoicePref(v);
  }, []);
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
    () => ({ voice, setVoice, copy: COPY[voice], demo, act, initials, toggleInitials, sheet, copied, copySheet }),
    [voice, setVoice, demo, initials, toggleInitials, sheet, copied, copySheet],
  );

  return <LandingContext value={value}>{children}</LandingContext>;
}
