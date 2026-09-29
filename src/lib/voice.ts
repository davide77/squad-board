import { VOICE_STORAGE_KEY } from "@/constants/config";
import { AGE_PREF_KEY } from "@/constants/content/onboarding";
import { AGE_GROUPS, type AgeKey } from "@/constants/football";
import { VOICES, type VoiceKey } from "@/constants/content/landing";

// What the coach told the landing page, remembered on this device for the board: the
// gaffer and the age group. Its own module so the landing page does not load the
// board's storage code.

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

/** The age group picked on the homepage, or null when none was. Browser only. */
export function readAgePref(): AgeKey | null {
  try {
    const v = localStorage.getItem(AGE_PREF_KEY);
    return AGE_GROUPS.find((a) => a.key === v)?.key ?? null;
  } catch {
    return null;
  }
}

export function writeAgePref(age: AgeKey): void {
  try {
    localStorage.setItem(AGE_PREF_KEY, age);
  } catch {
    // Not remembered: the start screen simply asks again.
  }
}
