import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { VIDEO_CONFIG } from "@/constants/config";
import { parseStored, readStoredRaw } from "@/lib/board/storage";
import type { BoardData } from "@/lib/board/types";

/** The current time, refreshed every `everyMs` while `active`, for anything that counts with the match clock. */
export function useNow(active: boolean, everyMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer);
  }, [active, everyMs]);
  // While paused the match clock reads its banked time, so a stale value is harmless.
  return now;
}

/**
 * Keeps the screen on while `active`, so a phone on the touchline does not lock mid-match.
 * The browser drops the lock whenever the page is hidden, so it is taken again on the way back.
 * Where the Screen Wake Lock API is missing it does nothing.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let done = false;
    const take = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const next = await navigator.wakeLock.request("screen");
        if (done) void next.release();
        else lock = next;
      } catch {
        // Refused, for example on low battery. The match carries on either way.
      }
    };
    void take();
    document.addEventListener("visibilitychange", take);
    return () => {
      done = true;
      document.removeEventListener("visibilitychange", take);
      void lock?.release();
    };
  }, [active]);
}

/** Calls `onEscape` on Escape while `active`. */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onEscape();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, onEscape]);
}

const SCROLL_LOCK_CLASS = "is-scroll-locked";
// Layers can stack (the picker over the example sheet), so the page is let go by the last one to close.
let scrollLocks = 0;

/** Holds the page still while a layer is open over it. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    scrollLocks += 1;
    document.body.classList.add(SCROLL_LOCK_CLASS);
    return () => {
      scrollLocks -= 1;
      if (!scrollLocks) document.body.classList.remove(SCROLL_LOCK_CLASS);
    };
  }, [active]);
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the system asks for less movement. The server renders as if motion is fine. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Holds Tab inside an open layer, and moves focus into it when it opens. */
export function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    container?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !container) return;

      const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (!container.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Back to whatever opened the layer, if it is still on the page.
      if (returnTo?.isConnected) returnTo.focus();
    };
  }, [active, containerRef]);
}

const STANDALONE = "(display-mode: standalone)";

function subscribeToStandalone(onChange: () => void) {
  const query = window.matchMedia(STANDALONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the site is running from the home screen. iOS reports it on navigator. */
export function useIsInstalled(): boolean {
  return useSyncExternalStore(
    subscribeToStandalone,
    () => window.matchMedia(STANDALONE).matches || ("standalone" in navigator && navigator.standalone === true),
    () => false,
  );
}

const COARSE_POINTER = "(pointer: coarse)";

function subscribeToPointer(onChange: () => void) {
  const query = window.matchMedia(COARSE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the main pointer is a finger, as on a phone or tablet. */
export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribeToPointer, () => window.matchMedia(COARSE_POINTER).matches, () => false);
}

/** The install event Chrome and Edge fire when a site can go on the home screen. Not in the DOM types yet. */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

// The event can fire before the board has loaded, so it is caught as soon as this module runs.
let installPrompt: InstallPromptEvent | null = null;
const installListeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e as InstallPromptEvent;
    installListeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installListeners.forEach((l) => l());
  });
}

function subscribeToInstall(onChange: () => void) {
  installListeners.add(onChange);
  return () => installListeners.delete(onChange);
}

/** The browser's own install prompt, when it offers one. */
export function useInstallPrompt(): InstallPromptEvent | null {
  return useSyncExternalStore(subscribeToInstall, () => installPrompt, () => null);
}

const FLAG_EVENT = "gafferboard:flag";

function subscribeToFlags(onChange: () => void) {
  window.addEventListener(FLAG_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(FLAG_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/** A yes or no remembered on this device, such as a card the coach closed. */
export function useStoredFlag(key: string): readonly [boolean, () => void] {
  const value = useSyncExternalStore(subscribeToFlags, () => readFlag(key), () => false);
  const set = () => {
    try {
      localStorage.setItem(key, "1");
    } catch {
      // storage blocked, the card simply comes back next time
    }
    window.dispatchEvent(new Event(FLAG_EVENT));
  };
  return [value, set] as const;
}

/** The Network Information API. Not in the DOM types, and missing on Safari and Firefox. */
interface NetworkInformation {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

/**
 * False until the page has loaded and had a moment to settle, and for good when the visitor
 * asked their browser to save data or is on a 2G-class connection. Video waits for it.
 */
export function useVideoAllowed(): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const slow: readonly string[] = VIDEO_CONFIG.slowConnections;
    if (conn?.saveData || (conn?.effectiveType && slow.includes(conn.effectiveType))) return;
    let timer: ReturnType<typeof setTimeout>;
    const wait = () => {
      timer = setTimeout(() => setAllowed(true), VIDEO_CONFIG.afterLoadMs);
    };
    if (document.readyState === "complete") wait();
    else window.addEventListener("load", wait, { once: true });
    return () => {
      window.removeEventListener("load", wait);
      clearTimeout(timer);
    };
  }, []);
  return allowed;
}

/**
 * A silent loop that turns into a film with sound on request, in the same video element:
 * browsers only allow sound when play() runs inside the click. The loop moves only while
 * `still` is false, and the film goes back to the loop when it ends.
 */
export function useFilmPlayer(
  film: { readonly src: string; readonly phone: string },
  still: boolean,
  onPlayingChange?: (playing: boolean) => void,
) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const watched = useRef(false);

  // It starts here rather than through autoPlay, so the motion choice is known before it plays.
  useEffect(() => {
    const video = videoRef.current;
    if (playing || !video) return;
    if (still) {
      video.pause();
      return;
    }
    // play() is also what makes an iPhone start buffering, so it runs as soon as the loop may move.
    video.play().catch(() => {});
  }, [playing, still]);

  // Focus follows the swap, so a keyboard user is never left on a button that has gone.
  useEffect(() => {
    if (playing) {
      watched.current = true;
      videoRef.current?.focus();
    } else if (watched.current) {
      playRef.current?.focus();
    }
  }, [playing]);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    video.src = window.matchMedia(VIDEO_CONFIG.phoneQuery).matches ? film.phone : film.src;
    video.loop = false;
    video.muted = false;
    video.play().catch(() => {});
    setPlaying(true);
    onPlayingChange?.(true);
  }

  function stop() {
    const video = videoRef.current;
    if (video) {
      // Without a src the element falls back to its <source> children: the loop.
      video.removeAttribute("src");
      video.muted = true;
      video.loop = true;
      video.load();
    }
    setPlaying(false);
    onPlayingChange?.(false);
  }

  return { videoRef, playRef, playing, play, stop } as const;
}

function subscribeToStorage(onChange: () => void) {
  // Fires when another tab saves the board. This tab reads it fresh on every page.
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** The coach's saved board in this browser. Null on the server and when there is none. */
export function useStoredBoard(): BoardData | null {
  const raw = useSyncExternalStore(subscribeToStorage, readStoredRaw, () => null);
  // The snapshot is the raw string, so the board is only parsed again when it changes.
  return useMemo(() => parseStored(raw), [raw]);
}

/** True once the coach has a team of their own saved in this browser. The example team does not count. */
export function useHasOwnBoard(): boolean {
  const board = useStoredBoard();
  return !!board && !board.example;
}
