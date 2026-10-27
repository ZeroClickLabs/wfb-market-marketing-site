"use client";

import { useActionState, useId, useState } from "react";
import { Button, Checkbox, Notice, Select, TextField } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import type { ActionState } from "@/app/portal/actions";
import { Markdown } from "./Markdown";

// One form component for the admin screens: describe the fields, pass a Server Action.
// Errors come back per field, and what was typed survives an error.

type Option = string | { value: string; label: string };
type LongTextField = { kind: "textarea" | "markdown"; name: string; label: string; hint?: string; required?: boolean; defaultValue?: string; placeholder?: string };

export type AdminField =
  | { kind: "text" | "email" | "tel" | "url" | "date" | "time"; name: string; label: string; hint?: string; required?: boolean; defaultValue?: string; placeholder?: string; half?: boolean; autoComplete?: string }
  | LongTextField
  | { kind: "select"; name: string; label: string; hint?: string; required?: boolean; defaultValue?: string; options: Option[]; placeholder?: string; half?: boolean }
  | { kind: "checkbox"; name: string; label: string; hint?: string; defaultChecked?: boolean }
  | { kind: "checkboxes"; name: string; label: string; hint?: string; options: Option[]; defaultValue?: string[]; columns?: boolean; showWhen?: { field: string; value: string } }
  | { kind: "file"; name: string; label: string; hint?: string; required?: boolean; accept?: string }
  | { kind: "hidden"; name: string; value: string };

const opt = (o: Option) => (typeof o === "string" ? { value: o, label: o } : o);

export function AdminForm({ action, fields, submitLabel, pendingLabel, secondary }: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: AdminField[];
  submitLabel: string;
  pendingLabel?: string;
  /** A second submit button, sent as `intent=<value>`. */
  secondary?: { label: string; value: string };
}) {
  const id = useId();
  const [state, formAction, pending] = useActionState(action, {} as ActionState);
  const e = state.errors ?? {};
  // Values of fields that others depend on (showWhen), kept live as the user changes them.
  const [live, setLive] = useState<Record<string, string>>({});
  const current = (name: string) => {
    const f = fields.find((x) => x.name === name);
    return live[name] ?? val(name, f && "defaultValue" in f && typeof f.defaultValue === "string" ? f.defaultValue : undefined);
  };
  const val = (name: string, fallback?: string) => {
    const v = state.values?.[name];
    return v === undefined ? fallback : Array.isArray(v) ? v.join("\n") : v;
  };

  return (
    <form
      action={formAction}
      noValidate
      aria-busy={pending}
      className="grid grid-cols-2 gap-5 max-tablet:grid-cols-1"
      onChange={(ev) => {
        const t = ev.target;
        if (t instanceof HTMLSelectElement) setLive((l) => ({ ...l, [t.name]: t.value }));
      }}
    >
      {fields.map((f) => {
        const fid = `${id}-${f.name}`;
        const wide = !("half" in f && f.half) && "col-span-2 max-tablet:col-span-1";
        switch (f.kind) {
          case "hidden":
            return <input key={f.name} type="hidden" name={f.name} value={f.value} />;
          case "select":
            return <Select key={f.name} id={fid} name={f.name} label={f.label} hint={f.hint} required={f.required} options={f.options} placeholder={f.placeholder} defaultValue={val(f.name, f.defaultValue)} error={e[f.name]} className={cx(wide)} />;
          case "checkbox":
            return (
              <div key={f.name} className="col-span-2 max-tablet:col-span-1">
                <Checkbox name={f.name} label={f.label} hint={f.hint} defaultChecked={state.values ? state.values[f.name] === "on" : f.defaultChecked} />
              </div>
            );
          case "checkboxes": {
            if (f.showWhen && current(f.showWhen.field) !== f.showWhen.value) return null;
            const picked = state.values ? [state.values[f.name] ?? []].flat() : f.defaultValue ?? [];
            return (
              <fieldset key={f.name} className={cx("wfb-field col-span-2 m-0 min-w-0 border-0 p-0 max-tablet:col-span-1", e[f.name] && "wfb-field-invalid")} aria-describedby={e[f.name] ? `${fid}-err` : undefined}>
                <legend className="wfb-field-label mb-1 p-0">{f.label}</legend>
                {f.hint ? <p className="wfb-field-hint">{f.hint}</p> : null}
                <div className={cx("grid gap-2", f.columns && "grid-cols-[repeat(auto-fill,minmax(220px,1fr))]")}>
                  {f.options.map(opt).map((o) => (
                    <Checkbox key={o.value} name={f.name} value={o.value} label={o.label} defaultChecked={picked.includes(o.value)} />
                  ))}
                </div>
                {e[f.name] ? <p id={`${fid}-err`} className="wfb-field-error">{e[f.name]}</p> : null}
              </fieldset>
            );
          }
          case "markdown":
            return <MarkdownField key={f.name} id={fid} field={f} value={val(f.name, f.defaultValue) ?? ""} error={e[f.name]} />;
          case "file":
            return <TextField key={f.name} id={fid} name={f.name} type="file" label={f.label} hint={f.hint} required={f.required} accept={f.accept} error={e[f.name]} className="col-span-2 max-tablet:col-span-1" />;
          default:
            return (
              <TextField
                key={f.name}
                id={fid}
                name={f.name}
                type={f.kind === "textarea" ? undefined : f.kind}
                multiline={f.kind === "textarea"}
                label={f.label}
                hint={f.hint}
                required={f.required}
                placeholder={f.placeholder}
                autoComplete={"autoComplete" in f ? f.autoComplete : undefined}
                defaultValue={val(f.name, f.defaultValue)}
                error={e[f.name]}
                className={cx(wide)}
              />
            );
        }
      })}
      <div className="col-span-2 flex flex-wrap items-center gap-3 max-tablet:col-span-1">
        <Button type="submit" variant="primary" name="intent" value="save" disabled={pending}>{pending ? pendingLabel ?? "Saving…" : submitLabel}</Button>
        {secondary ? <Button type="submit" variant="outline" name="intent" value={secondary.value} disabled={pending}>{secondary.label}</Button> : null}
      </div>
      {state.message ? (
        <Notice tone={state.ok ? "success" : "warning"} className="col-span-2 max-tablet:col-span-1">{state.message}</Notice>
      ) : null}
    </form>
  );
}

/** Markdown with a Write / Preview switch, so admins see what vendors will see. */
function MarkdownField({ id, field, value, error }: { id: string; field: LongTextField; value: string; error?: string }) {
  const [text, setText] = useState(value);
  const [preview, setPreview] = useState(false);
  const tab = "min-h-[44px] cursor-pointer rounded-pill border-2 border-ink px-4 font-sans text-[13px] font-extrabold uppercase tracking-[.12em]";
  return (
    <div className="col-span-2 grid gap-2 max-tablet:col-span-1">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="font-sans text-[13px] font-extrabold uppercase tracking-[.12em]" id={`${id}-label`}>{field.label}</span>
        <div className="flex gap-1.5" role="group" aria-label="Editor view">
          <button type="button" aria-pressed={!preview} onClick={() => setPreview(false)} className={cx(tab, !preview ? "bg-ink text-paper" : "bg-paper text-ink")}>Write</button>
          <button type="button" aria-pressed={preview} onClick={() => setPreview(true)} className={cx(tab, preview ? "bg-ink text-paper" : "bg-paper text-ink")}>Preview</button>
        </div>
      </div>
      <div hidden={preview}>
        <TextField id={id} name={field.name} label={<span className="sr-only">{field.label}</span>} hint={field.hint ?? "Markdown: **bold**, - bullet lists, [link text](https://…)."} multiline required={field.required} placeholder={field.placeholder} value={text} onChange={(ev) => setText(ev.target.value)} error={error} className="[&_textarea]:min-h-[220px]" />
      </div>
      {preview ? (
        <div className="min-h-[220px] rounded-md border-2 border-ink bg-paper p-4">{text.trim() ? <Markdown>{text}</Markdown> : <p className="m-0 text-ink-muted">Nothing to preview yet.</p>}</div>
      ) : null}
    </div>
  );
}
