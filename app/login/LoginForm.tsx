"use client";

import { useActionState } from "react";
import { Button, Notice, TextField } from "@/components/wfb";
import { requestLogin, verifyCode, type LoginState } from "./actions";

export function LoginForm({ next, error, email }: { next: string; error?: string; email?: string }) {
  const [state, send, sending] = useActionState(requestLogin, { step: "email", next, error, email } as LoginState);
  const [codeState, verify, verifying] = useActionState(verifyCode, { step: "code" } as LoginState);

  if (state.step === "code") {
    return (
      <div className="grid gap-5">
        <Notice tone="success" title="Check your email">{state.message}</Notice>
        <form action={verify} className="grid gap-4" aria-label="Enter your login code" noValidate>
          <input type="hidden" name="email" value={state.email} />
          <input type="hidden" name="next" value={state.next} />
          <TextField
            name="code"
            label="Or enter the code"
            hint={`Sent to ${state.email}. Handy if you opened the email on another device.`}
            inputMode="numeric"
            autoComplete="one-time-code"
            error={codeState.error}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" type="submit" disabled={verifying}>{verifying ? "Checking…" : "Log in"}</Button>
            <a className="brand-link font-sans text-[15px] font-bold" href={`/login?next=${encodeURIComponent(next)}`}>Use a different email</a>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form action={send} className="grid gap-4" aria-label="Log in to the vendor portal" noValidate>
      <input type="hidden" name="next" value={state.next ?? next} />
      <TextField
        name="email"
        type="email"
        label="Email address"
        hint="We'll email you a link and a code. No password needed."
        autoComplete="email"
        defaultValue={state.email}
        error={state.error}
        required
      />
      <div><Button variant="primary" type="submit" disabled={sending}>{sending ? "Sending…" : "Email me a login link"}</Button></div>
    </form>
  );
}
