"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button, Checkbox, Notice, Select, TextField } from "@/components/wfb";
import { site } from "@/content/site";

interface FieldBase {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** Says how to fix a missing answer. Defaults to "Enter your <label>." */
  requiredMessage?: string;
}

export type FieldSpec =
  | (FieldBase & { kind: "text" | "email" | "tel"; autoComplete?: string })
  | (FieldBase & { kind: "textarea" })
  | (FieldBase & { kind: "select"; options: string[]; placeholder?: string })
  | (FieldBase & { kind: "checkboxes"; options: string[] })
  | (FieldBase & { kind: "agree" });

export interface StubFormProps {
  /** Names the form for screen readers. */
  title: string;
  fields: FieldSpec[];
  submitLabel: string;
  /** Subject line for the email fallback. */
  emailSubject: string;
}

function errorFor(field: FieldSpec, form: HTMLFormElement): string | undefined {
  if (field.kind === "checkboxes") {
    const checked = form.querySelectorAll<HTMLInputElement>(`input[name="${field.name}"]:checked`).length;
    return field.required && !checked ? field.requiredMessage ?? "Choose at least one." : undefined;
  }
  const el = form.elements.namedItem(field.name) as HTMLInputElement | null;
  if (!el) return undefined;
  if (field.kind === "agree") return field.required && !el.checked ? field.requiredMessage ?? "Tick this box to continue." : undefined;
  const value = el.value.trim();
  if (field.required && !value) {
    if (field.requiredMessage) return field.requiredMessage;
    if (field.kind === "select") return "Choose one.";
    const label = field.label.toLowerCase();
    return label.startsWith("your ") ? `Enter ${label}.` : `Enter your ${label}.`;
  }
  if (field.kind === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter an email address like name@example.com.";
  return undefined;
}

/**
 * A form built from the kit's fields, with inline errors that say how to fix the problem.
 * TODO: connect to a provider. Until site.formsEnabled is true nothing is sent, and the
 * visitor is told so plainly, with the email address to use instead. Never a fake success.
 */
export function StubForm({ title, fields, submitLabel, emailSubject }: StubFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<"not-sent" | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Record<string, string> = {};
    for (const f of fields) {
      const msg = errorFor(f, form);
      if (msg) next[f.name] = msg;
    }
    setErrors(next);
    const first = fields.find((f) => next[f.name]);
    if (first) {
      setResult(null);
      form.querySelector<HTMLElement>(`[name="${first.name}"]`)?.focus();
      return;
    }
    // site.formsEnabled: send the submission here once a provider is chosen.
    setResult("not-sent");
  };

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(emailSubject)}`;

  return (
    <div className="wfb wfb-form-card">
      <form ref={formRef} aria-label={title} noValidate onSubmit={onSubmit} className="wfb-form">
        {fields.map((f) => {
          const error = errors[f.name];
          switch (f.kind) {
            case "textarea":
              return <TextField key={f.name} multiline name={f.name} label={f.label} hint={f.hint} required={f.required} error={error} />;
            case "select":
              return <Select key={f.name} name={f.name} label={f.label} hint={f.hint} required={f.required} error={error} options={f.options} placeholder={f.placeholder ?? "Choose one"} defaultValue="" />;
            case "checkboxes":
              return (
                <fieldset key={f.name} className="wfb-fieldset" aria-describedby={error ? `${f.name}-err` : undefined}>
                  <legend className="wfb-field-label">{f.label}{f.required ? <span className="wfb-field-req" aria-hidden="true">*</span> : null}</legend>
                  {f.hint ? <p className="wfb-field-hint">{f.hint}</p> : null}
                  <div className="wfb-check-grid">
                    {f.options.map((o) => <Checkbox key={o} name={f.name} value={o} label={o} />)}
                  </div>
                  {error ? <p className="wfb-field-error" id={`${f.name}-err`}>{error}</p> : null}
                </fieldset>
              );
            case "agree":
              return (
                <div key={f.name} className={error ? "wfb-field-invalid" : undefined}>
                  <Checkbox name={f.name} label={f.label} hint={f.hint} aria-invalid={error ? true : undefined} aria-describedby={error ? `${f.name}-err` : undefined} />
                  {error ? <p className="wfb-field-error" id={`${f.name}-err`}>{error}</p> : null}
                </div>
              );
            default:
              return <TextField key={f.name} type={f.kind} name={f.name} label={f.label} hint={f.hint} required={f.required} error={error} autoComplete={f.autoComplete} />;
          }
        })}
        <p className="wfb-form-note">Fields marked <span aria-hidden="true">*</span><span className="wfb-sr">with an asterisk</span> are required.</p>
        <div><Button variant="primary" type="submit">{submitLabel}</Button></div>
      </form>
      {result === "not-sent" ? (
        <Notice
          tone="info"
          title="Online forms aren't switched on yet, so nothing was sent."
          action={<Button variant="outline" size="sm" href={mailto} icon="mail">Email us instead</Button>}
        >
          Thank you for filling it in. Please send the same details to {site.email} and a volunteer will reply within a week.
        </Notice>
      ) : null}
    </div>
  );
}
