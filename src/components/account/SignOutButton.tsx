"use client";

import { useFormStatus } from "react-dom";
import { ACCOUNT } from "@/constants/content/account";
import { signOut } from "@/lib/server/signin";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className="button button--quiet has-py-2 has-px-3 has-radius-field text-base">
      {pending ? ACCOUNT.signedIn.signingOut : ACCOUNT.signedIn.signOut}
    </button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Submit />
    </form>
  );
}
