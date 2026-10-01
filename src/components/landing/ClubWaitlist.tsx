"use client";

import { useActionState, useId } from "react";
import { WAITLIST_CONFIG } from "@/constants/config";
import { WAITLIST } from "@/constants/content/pages";
import { joinWaitlist, type WaitlistState } from "@/lib/server/waitlist";

const START: WaitlistState = { status: "idle" };

interface ClubWaitlistProps {
  /** The bold line before the field. The footer asks clubs; the board asks coaches with more than one team. */
  readonly prompt?: string;
  readonly cta?: string;
}

/** One line for clubs: an email and a button, then a word from the Gaffer. No account. */
export function ClubWaitlist({ prompt = WAITLIST.prompt, cta = WAITLIST.cta }: ClubWaitlistProps) {
  const [state, action, pending] = useActionState(joinWaitlist, START);
  const id = useId();

  if (state.status === "joined") {
    return (
      <p role="status" className="text-md has-font-semibold is-chalk">
        {WAITLIST.joined}
      </p>
    );
  }

  return (
    <form action={action} className="is-flex is-flex-wrap is-align-center has-gap-3">
      <p className="text-md">
        <span className="is-chalk has-font-semibold">{prompt}</span> <span className="is-dim">{cta}</span>
      </p>
      <div className="is-flex has-gap-2">
        <label htmlFor={id} className="sr-only">
          {WAITLIST.label}
        </label>
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={WAITLIST_CONFIG.maxEmail}
          placeholder={WAITLIST.placeholder}
          aria-describedby={`${id}-status`}
          className="field waitlist__email has-radius-field has-py-2 has-px-3 text-base"
        />
        {/* Out of sight and out of the tab order: only a bot fills it in. */}
        <input name={WAITLIST_CONFIG.trapField} tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
        <button type="submit" disabled={pending} aria-busy={pending} className="button button--chalk has-py-3 has-px-4 has-radius-field has-font-bold text-base">
          {pending ? WAITLIST.sending : WAITLIST.button}
        </button>
      </div>
      <p id={`${id}-status`} role="status" className="is-w-full text-sm is-out">
        {state.status === "invalid" ? WAITLIST.invalid : state.status === "failed" ? WAITLIST.failed : ""}
      </p>
    </form>
  );
}
