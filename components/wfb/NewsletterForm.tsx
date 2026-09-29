"use client";

import { useId } from "react";
import { Button } from "./Button";

// TODO: connect to the Market's email provider. Until then the form does nothing,
// and preventDefault keeps the address out of the URL.
export function NewsletterForm() {
  const id = useId();
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <label className="wfb-news-label" htmlFor={id}>Email address</label>
      <input id={id} name="email" className="wfb-field-input" type="email" autoComplete="email" placeholder="you@example.com" required />
      <Button variant="primary" type="submit">Sign me up</Button>
    </form>
  );
}
