"use client";

import { useActionState, useId } from "react";
import { Button, Notice, TextField } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import { ARGO_BUTTON } from "@/components/argo/styles";
import { subscribe } from "@/app/actions/newsletter";
import { initialSubscribeState, type SignupSource } from "@/lib/newsletter";

export interface SubscribeCardProps {
  source: SignupSource;
  /** Names the form for screen readers. */
  title: string;
  hint?: string;
  submitLabel?: string;
  /** "argo" recolours the card and button for Christmas at The Argo. */
  tone?: "market" | "argo";
}

/** A newsletter sign-up in a paper card, sent to beehiiv by a Server Action. Works before JavaScript loads. */
export function SubscribeCard({ source, title, hint, submitLabel = "Sign me up", tone = "market" }: SubscribeCardProps) {
  const id = useId();
  const [state, action, pending] = useActionState(subscribe, initialSubscribeState);
  const argo = tone === "argo";
  const done = state.status === "subscribed" || state.status === "confirm";

  return (
    <div
      className={cx(
        "wfb grid max-w-[760px] gap-5 rounded-lg border-3 bg-paper p-6 text-ink max-tablet:px-4 max-tablet:py-5",
        argo ? "m-0 border-argo-gold shadow-[6px_6px_0_rgba(0,0,0,.28)] [--focus:var(--color-argo-green)]" : "mx-auto border-ink shadow-print",
      )}
    >
      {done ? (
        <Notice tone="success" title={state.status === "confirm" ? "Check your inbox" : "You're on the list"}>
          {state.message}
        </Notice>
      ) : (
        <form action={action} aria-label={title} aria-busy={pending} noValidate className="grid gap-5">
          <TextField
            id={`${id}-email`}
            name="email"
            type="email"
            label="Email address"
            hint={hint}
            autoComplete="email"
            required
            defaultValue={state.email}
            error={state.status === "error" ? state.message : undefined}
          />
          <input type="hidden" name="source" value={source} />
          {/* Honeypot for bots: hidden from people and screen readers. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={`${id}-company`}>Company</label>
            <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <Button variant="primary" type="submit" disabled={pending} className={argo ? ARGO_BUTTON.primary : undefined}>
              {pending ? "Signing you up…" : submitLabel}
            </Button>
          </div>
          {state.status === "unavailable" ? <Notice tone="info" title="Sign-up isn't open yet">{state.message}</Notice> : null}
        </form>
      )}
    </div>
  );
}
