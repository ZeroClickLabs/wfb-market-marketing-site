"use client";

import { useActionState, useId } from "react";
import { Button, Checkbox, Notice, TextField } from "@/components/wfb";
import { emailPrefAction, profileAction, type ActionState } from "@/app/portal/actions";
import type { PortalVendor } from "@/lib/portal/types";

/** The vendor's public profile. Saving sends it to the Market for review before it goes on the website. */
export function ProfileForm({ vendor }: { vendor: PortalVendor }) {
  const id = useId();
  const [state, action, pending] = useActionState(profileAction, {} as ActionState);
  const e = state.errors ?? {};
  const v: Record<string, string | string[]> = state.values ?? {
    name: vendor.name, town: vendor.town, description: vendor.description, products: vendor.products.join("\n"),
    website: vendor.website, instagram: vendor.instagram, phone: vendor.phone,
  };
  return (
    <form action={action} noValidate aria-busy={pending} className="grid grid-cols-1 gap-5">
      <TextField id={`${id}-name`} name="name" label="Business name" required defaultValue={v.name} error={e.name} autoComplete="organization" />
      <TextField id={`${id}-town`} name="town" label="Town" hint="Where you farm or make, e.g. Cedarburg, WI." defaultValue={v.town} error={e.town} />
      <TextField id={`${id}-description`} name="description" label="Short description" hint="One or two sentences for the Vendors page. Up to 400 characters." multiline maxLength={400} defaultValue={v.description} error={e.description} />
      <TextField id={`${id}-products`} name="products" label="What you sell" hint="One item per line, e.g. Heirloom tomatoes." multiline defaultValue={v.products} error={e.products} />
      <div className="grid grid-cols-2 gap-5 max-tablet:grid-cols-1">
        <TextField id={`${id}-website`} name="website" type="url" label="Website (optional)" placeholder="https://" defaultValue={v.website} error={e.website} autoComplete="url" />
        <TextField id={`${id}-instagram`} name="instagram" label="Instagram (optional)" placeholder="@yourfarm" defaultValue={v.instagram} error={e.instagram} />
      </div>
      <TextField id={`${id}-phone`} name="phone" type="tel" label="Phone for the Market (optional)" hint="Only Market staff see this. It's never published." defaultValue={v.phone} error={e.phone} autoComplete="tel" />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
      </div>
      {state.message ? (
        <Notice tone={state.ok ? "success" : "warning"} title={state.ok ? "Profile saved" : undefined}>
          {state.message}
        </Notice>
      ) : null}
    </form>
  );
}

export function EmailPrefForm({ on }: { on: boolean }) {
  const [state, action, pending] = useActionState(emailPrefAction, {} as ActionState);
  return (
    <form action={action} aria-busy={pending} className="grid grid-cols-1 gap-3">
      <Checkbox name="emailUpdates" label="Email me when the Market posts an update" hint="Invites and attendance reminders always come by email." defaultChecked={on} />
      <div>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>Save preference</Button>
      </div>
      <p role="status" className={state.message ? "m-0 font-sans text-[14px] leading-[20px] font-bold text-kale-text" : "sr-only"}>{state.message}</p>
    </form>
  );
}
