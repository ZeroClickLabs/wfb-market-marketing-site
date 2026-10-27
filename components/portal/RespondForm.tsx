"use client";

import { useActionState, useId } from "react";
import { Button, TextField } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import { respondAction, type ActionState } from "@/app/portal/actions";

/**
 * Confirm / can't-make-it for one or more market dates. Plain form submits, so it works before
 * JavaScript loads. "full" adds a note to the Market; "compact" fits a calendar row.
 */
export function RespondForm({ ids, current, variant = "compact", note, confirmLabel, confirmOnly, className }: {
  ids: string[];
  current: "invited" | "confirmed" | "declined";
  variant?: "compact" | "full";
  note?: string;
  confirmLabel?: string;
  /** Bulk confirm: no decline button, so a whole season can't be declined by one tap. */
  confirmOnly?: boolean;
  className?: string;
}) {
  const id = useId();
  const [state, action, pending] = useActionState(respondAction, {} as ActionState);
  return (
    <form action={action} className={cx("grid gap-3", className)} aria-busy={pending}>
      <input type="hidden" name="ids" value={ids.join(",")} />
      {variant === "full" ? (
        <TextField id={`${id}-note`} name="note" label="Note to the Market (optional)" hint="Running late, sharing a stall, anything we should know." multiline defaultValue={note} maxLength={500} />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {current !== "confirmed" ? (
          <Button type="submit" name="status" value="confirmed" variant="primary" size={variant === "compact" ? "sm" : "md"} icon="check-circle" disabled={pending}>
            {confirmLabel ?? "I'll be there"}
          </Button>
        ) : null}
        {current !== "declined" && !confirmOnly ? (
          <Button type="submit" name="status" value="declined" variant="outline" size={variant === "compact" ? "sm" : "md"} disabled={pending}>
            Can&rsquo;t make it
          </Button>
        ) : null}
        {current !== "invited" && variant === "full" ? (
          <Button type="submit" name="status" value={current} variant="link" disabled={pending}>Save note</Button>
        ) : null}
      </div>
      <p role="status" className={cx("m-0 font-sans text-[14px] leading-[20px] font-bold", state.ok === false ? "text-heirloom-text" : "text-kale-text", !state.message && "sr-only")}>
        {state.message}
      </p>
    </form>
  );
}
