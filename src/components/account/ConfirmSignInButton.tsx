"use client";

import { useFormStatus } from "react-dom";
import { AUTH_CONFIG } from "@/constants/config";
import { ACCOUNT } from "@/constants/content/account";
import { confirmSignIn } from "@/lib/server/signin";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className="button button--primary has-py-3 has-px-4 has-radius-field has-font-bold text-base">
      {pending ? ACCOUNT.confirm.signingIn : ACCOUNT.confirm.button}
    </button>
  );
}

interface ConfirmSignInButtonProps {
  readonly token: string;
}

/** Uses the emailed link up and signs this browser in. */
export function ConfirmSignInButton({ token }: ConfirmSignInButtonProps) {
  return (
    <form action={confirmSignIn}>
      <input type="hidden" name={AUTH_CONFIG.tokenParam} value={token} />
      <Submit />
    </form>
  );
}
