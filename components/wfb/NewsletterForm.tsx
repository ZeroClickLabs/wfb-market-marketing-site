"use client";

import { useActionState, useEffect, useId } from "react";
import { subscribe } from "@/app/actions/newsletter";
import { initialSubscribeState, type SignupSource } from "@/lib/newsletter";
import { track } from "@/lib/analytics";
import { Button } from "./Button";
import { Icon } from "./Icon";

// App addition: the Market Letter sign-up, sent to beehiiv by a Server Action.
// It works before JavaScript loads (a plain form post), and shows beehiiv's actual answer.
// Errors are set in ink with an icon: the kit's heirloom-text is under 4.5:1 on sage.
export function NewsletterForm({ source = "market-letter" }: { source?: SignupSource }) {
  const id = useId();
  const [state, action, pending] = useActionState(subscribe, initialSubscribeState);

  // Count a sign-up in Google Analytics only once beehiiv has accepted it.
  useEffect(() => {
    if (state.status === "subscribed" || state.status === "confirm") track("sign_up", { method: "newsletter", form: source });
  }, [state.status, source]);

  if (state.status === "subscribed" || state.status === "confirm") {
    return (
      <p role="status" className="m-0 flex items-start gap-2 rounded-md border-2 border-ink bg-paper px-4 py-3 font-sans text-[16px] leading-[24px] font-bold text-ink">
        <Icon name={state.status === "confirm" ? "mail" : "check-circle"} size={20} className="mt-0.5" />
        {state.message}
      </p>
    );
  }

  const failed = state.status === "error" || state.status === "unavailable";
  return (
    <form action={action} noValidate aria-busy={pending}>
      <label className="wfb-news-label" htmlFor={id}>Email address</label>
      <input
        id={id}
        name="email"
        className="wfb-field-input"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={state.email}
        aria-invalid={failed ? true : undefined}
        aria-describedby={failed ? `${id}-msg` : undefined}
      />
      <input type="hidden" name="source" value={source} />
      {/* Honeypot for bots: hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <Button variant="primary" type="submit" disabled={pending}>{pending ? "Signing you up…" : "Sign me up"}</Button>
      {failed ? (
        <p id={`${id}-msg`} role="alert" className="m-0 flex basis-full items-start gap-1.5 font-sans text-[15px] leading-[22px] font-bold text-ink">
          <Icon name="alert" size={18} className="mt-0.5" />
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
