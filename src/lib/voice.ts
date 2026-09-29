import { VOICE_STORAGE_KEY } from "@/constants/config";
import { VOICES, type VoiceKey } from "@/constants/content/landing";

// The coach's gaffer, remembered on this device between the landing page and the
// board. Its own module so the landing page does not load the board's storage code.

export function isVoice(v: unknown): v is VoiceKey {
  return VOICES.some((o) => o.key === v);
}

/** The gaffer the coach picked last on this device, or null when they never have. Browser only. */
export function readVoicePref(): VoiceKey | null {
  try {
    const v = localStorage.getItem(VOICE_STORAGE_KEY);
    return isVoice(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeVoicePref(v: VoiceKey): void {
  try {
    localStorage.setItem(VOICE_STORAGE_KEY, v);
  } catch {
    // Private windows and blocked storage: the choice simply is not remembered.
  }
}
