import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { Icon } from "./Icon";
import { cx } from "./utils";

interface FieldBase {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  id?: string;
  className?: string;
  required?: boolean;
}

function FieldShell({ label, hint, error, className, required, id, children }: FieldBase & { id: string; children: (describedBy?: string) => ReactNode }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("wfb-field", error ? "wfb-field-invalid" : null, className)}>
      <label className="wfb-field-label" htmlFor={id}>
        {label}
        {required ? <span className="wfb-field-req" aria-hidden="true">*</span> : null}
      </label>
      {hint ? <p className="wfb-field-hint" id={hintId}>{hint}</p> : null}
      {children(describedBy)}
      {error ? <p className="wfb-field-error" id={errId}><Icon name="alert" size={16} />{error}</p> : null}
    </div>
  );
}

export interface TextFieldProps extends FieldBase, Omit<InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>, "id" | "className"> {
  multiline?: boolean;
}

export function TextField({ label, hint, error, multiline, className, id, ...rest }: TextFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell {...{ label, hint, error, className, required: rest.required }} id={fid}>
      {(describedBy) => {
        const props = { id: fid, className: "wfb-field-input", "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, ...rest };
        return multiline ? <textarea {...props} /> : <input {...props} />;
      }}
    </FieldShell>
  );
}

export interface SelectProps extends FieldBase, Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className"> {
  options: Array<string | { value: string; label: string }>;
  placeholder?: string;
}

export function Select({ label, hint, error, options, placeholder, className, id, ...rest }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell {...{ label, hint, error, className, required: rest.required }} id={fid}>
      {(describedBy) => (
        <select id={fid} className="wfb-field-input" aria-describedby={describedBy} aria-invalid={error ? true : undefined} {...rest}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
      )}
    </FieldShell>
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  hint?: ReactNode;
}

export function Checkbox({ label, hint, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx("wfb-check", className)}>
      <input type="checkbox" {...rest} />
      <span>
        {label}
        {hint ? <span className="wfb-check-hint">{hint}</span> : null}
      </span>
    </label>
  );
}
