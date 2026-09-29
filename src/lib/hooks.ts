import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

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

/** Holds the page still while a layer is open over it. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    document.body.classList.add(SCROLL_LOCK_CLASS);
    return () => document.body.classList.remove(SCROLL_LOCK_CLASS);
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
