"use client";

import { useActionState, useId } from "react";
import { AUTH_CONFIG } from "@/constants/config";
import { ACCOUNT } from "@/constants/content/account";
import { requestSignIn, type SignInState } from "@/lib/server/signin";

const START: SignInState = { status: "idle" };
const COPY = ACCOUNT.signedOut;

/** An email and a button. Then "check your inbox", with a way to send it again. */
export function SignInForm() {
  const [state, action, pending] = useActionState(requestSignIn, START);
  const id = useId();

  return (
    <form action={action} className="is-flex is-flex-column is-align-start has-gap-3 measure-48ch">
      {state.status === "sent" && state.email ? (
        <div role="status" className="is-flex is-flex-column has-gap-2">
          <p className="text-lg has-font-semibold is-chalk">{COPY.sent(state.email)}</p>
          <p className="text-md is-dim">{COPY.spam}</p>
        </div>
      ) : null}
      <label htmlFor={id} className="text-sm has-font-semibold is-dim uppercase tracking-caps has-font-headline">
        {COPY.label}
      </label>
      <div className="is-flex is-flex-wrap has-gap-2 is-w-full">
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email ?? ""}
          maxLength={AUTH_CONFIG.maxEmail}
          placeholder={COPY.placeholder}
          aria-describedby={`${id}-status`}
          className="field is-flex-1 has-radius-field has-py-2 has-px-3 text-base"
        />
        {/* Out of sight and out of the tab order: only a bot fills it in. */}
        <input name={AUTH_CONFIG.trapField} tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="button button--primary has-py-3 has-px-4 has-radius-field has-font-bold text-base"
        >
          {pending ? COPY.sending : state.status === "sent" ? COPY.again : COPY.button}
        </button>
      </div>
      <p id={`${id}-status`} role="status" className="text-sm is-out">
        {state.status === "invalid" ? COPY.invalid : state.status === "failed" ? COPY.failed : ""}
      </p>
    </form>
  );
}
