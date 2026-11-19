"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Button, Checkbox, Notice, Select, TextField } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import { createClient } from "@/lib/supabase/client";
import { preparePhotoUpload, submitApplication } from "@/app/apply/actions";
import {
  APPLY_CATEGORIES, APPLY_MARKETS, EMPTY_ANSWERS, MAX_PHOTOS, STALL_SIZES, STEPS, YEARS_SELLING, fieldErrors, websiteUrl, type Answers,
} from "@/lib/apply/schema";

// The vendor application: five short steps, checked one at a time, then a confirmation. Built for a
// phone opened from an Instagram bio, so answers are kept in this browser (not photos) in case the
// in-app browser closes, and the phone's back button goes back a step.

const DRAFT_KEY = "wfb-apply-draft-v1";
const LAST = STEPS.length - 1;

type Photo = { key: string; name: string; preview: string; status: "uploading" | "done" | "failed"; path?: string };

function readDraft(): Partial<Answers> | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Answers>) : null;
  } catch {
    return null;
  }
}

function writeDraft(a: Answers | null) {
  try {
    if (a) window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...a, photos: [] }));
    else window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Private browsing or blocked storage: the form still works, it just won't remember.
  }
}

const stepFromUrl = () => {
  const n = Number(new URLSearchParams(window.location.search).get("step"));
  return Number.isInteger(n) && n >= 1 && n <= STEPS.length ? n - 1 : 0;
};

export function ApplyForm({ moreInfoHref, instagramHref }: { moreInfoHref: string; instagramHref?: string }) {
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  // True once any saved draft has been read back; until then nothing is saved over it.
  const [ready, setReady] = useState(false);
  const uploadId = useRef<string | null>(null);
  const startedAt = useRef(0);
  const company = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // After the first render: bring back a draft, honour ?step= (but never past a step that isn't
  // finished), and follow the browser's back and forward buttons.
  useEffect(() => {
    startedAt.current = Date.now();
    const draft = readDraft();
    const restored = { ...EMPTY_ANSWERS, ...draft, photos: [] };
    const firstUnfinished = STEPS.findIndex((s) => !s.schema.safeParse(restored).success);
    const wanted = Math.min(stepFromUrl(), firstUnfinished === -1 ? LAST : firstUnfinished);
    /* eslint-disable react-hooks/set-state-in-effect -- browser-only state, read once after hydration */
    if (draft) setAnswers(restored);
    setStep(wanted);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    window.history.replaceState({ step: wanted }, "", wanted ? `?step=${wanted + 1}` : window.location.pathname);
    const onPop = () => {
      moved.current = true;
      setErrors({});
      setMessage(null);
      setStep(stepFromUrl());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (ready && !done) writeDraft(answers);
  }, [answers, done, ready]);

  // Move focus to the new step's heading, so screen readers start there and the page is at the top.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
  }, [step, done]);

  const clearErrors = (...keys: string[]) => setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !keys.includes(k))));

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (errors[key as string] || (errors.work && ["instagram", "website"].includes(key as string))) clearErrors(key as string, "work");
  };

  const goTo = (next: number) => {
    moved.current = true;
    setErrors({});
    setMessage(null);
    setStep(next);
    window.history.pushState({ step: next }, "", `?step=${next + 1}`);
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const key = Object.keys(errs)[0];
    if (!key) return;
    // The show-us-your-work rule belongs to the first of its three fields.
    const first = key === "work" ? "instagram" : key;
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] select, [data-field="${first}"] textarea, [data-field="${first}"] button`)?.focus());
  };

  const withPhotos = (): Answers => ({ ...answers, photos: photos.filter((p) => p.status === "done" && p.path).map((p) => p.path!) });

  const next = () => {
    const result = STEPS[step].schema.safeParse(withPhotos());
    if (!result.success) {
      const errs = fieldErrors(result.error);
      setErrors(errs);
      setMessage("Check the highlighted answers.");
      focusFirstError(errs);
      return;
    }
    // Keep the tidied-up versions (the handle without @, the web address with https://).
    if (STEPS[step].key === "work") setAnswers((a) => ({ ...a, instagram: (result.data as { instagram: string }).instagram, website: (result.data as { website: string }).website }));
    goTo(step + 1);
  };

  const send = async () => {
    const check = STEPS[LAST].schema.safeParse(answers);
    if (!check.success) {
      const errs = fieldErrors(check.error);
      setErrors(errs);
      setMessage("Check the highlighted answers.");
      focusFirstError(errs);
      return;
    }
    if (photos.some((p) => p.status === "uploading")) {
      setMessage("A photo is still uploading. Send again in a moment.");
      return;
    }
    setSending(true);
    setMessage(null);
    try {
      const res = await submitApplication({ answers: withPhotos(), uploadId: uploadId.current, startedAt: startedAt.current, company: company.current?.value ?? "" });
      if (res.ok) {
        writeDraft(null);
        moved.current = true;
        setDone(answers.name);
        window.history.replaceState({ step: "done" }, "", window.location.pathname);
        return;
      }
      if (res.step !== LAST) goTo(res.step);
      setErrors(res.errors);
      setMessage(res.message);
      focusFirstError(res.errors);
    } catch {
      setMessage("We couldn't reach the Market just now. Check your connection and send again.");
    } finally {
      setSending(false);
    }
  };

  const addPhotos = async (ev: ChangeEvent<HTMLInputElement>) => {
    const input = ev.currentTarget;
    const files = [...(input.files ?? [])].slice(0, MAX_PHOTOS - photos.length);
    input.value = "";
    if (!files.length) return;
    setPhotoError(null);
    const added: Photo[] = files.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, preview: URL.createObjectURL(f), status: "uploading" }));
    setPhotos((p) => [...p, ...added]);
    const update = (key: string, patch: Partial<Photo>) => setPhotos((p) => p.map((x) => (x.key === key ? { ...x, ...patch } : x)));
    const ticket = await preparePhotoUpload({ uploadId: uploadId.current, files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })), company: company.current?.value ?? "" }).catch(() => ({ error: "We couldn't start the upload. Check your connection and try again." }));
    if ("error" in ticket) {
      setPhotoError(ticket.error);
      setPhotos((p) => p.filter((x) => !added.some((a) => a.key === x.key)));
      added.forEach((a) => URL.revokeObjectURL(a.preview));
      return;
    }
    uploadId.current = ticket.uploadId;
    clearErrors("work");
    const storage = createClient().storage.from("assets");
    await Promise.all(files.map(async (f, i) => {
      const { path, token } = ticket.uploads[i];
      const { error } = await storage.uploadToSignedUrl(path, token, f, { contentType: f.type || undefined });
      update(added[i].key, error ? { status: "failed" } : { status: "done", path });
    }));
  };

  const removePhoto = (key: string) => setPhotos((p) => p.filter((x) => {
    if (x.key === key) URL.revokeObjectURL(x.preview);
    return x.key !== key;
  }));

  if (done !== null) {
    return (
      <div className="grid gap-4">
        <h2 ref={heading} tabIndex={-1} className="m-0 font-display text-[44px] leading-[46px] font-normal uppercase outline-none max-tablet:text-[38px] max-tablet:leading-[40px]">Thanks, {done}</h2>
        <p className="m-0 font-sans text-[18px] leading-[28px]">We&rsquo;ve got your application. Our vendor committee reads every one, and we&rsquo;ll be in touch within two weeks.</p>
        <p className="m-0 font-sans text-[16px] leading-[25px] text-ink-muted">We&rsquo;ve also sent a copy of what happens next to your email.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" href={moreInfoHref}>What selling here involves</Button>
          {instagramHref ? <Button variant="outline" href={instagramHref}>Follow us on Instagram</Button> : null}
        </div>
      </div>
    );
  }

  const field = (name: keyof Answers) => ({ "data-field": name });
  const err = (name: string) => errors[name];
  const current = STEPS[step];

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (step === LAST) void send(); else next(); }} aria-busy={sending} className="grid gap-5">
      {/* People never see this; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>Company<input ref={company} name="company" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid gap-2">
        <p className="m-0 font-sans text-[13px] leading-[16px] font-extrabold uppercase tracking-[.12em] text-ink-muted" aria-live="polite">
          Step {step + 1} of {STEPS.length}<span aria-hidden="true"> · </span><span className="sr-only">: </span>{current.title}
        </p>
        <div className="h-3 overflow-hidden rounded-pill border-2 border-ink bg-paper" aria-hidden="true">
          <div className="h-full bg-kale transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <h2 ref={heading} tabIndex={-1} className="m-0 font-display text-[40px] leading-[42px] font-normal uppercase outline-none max-tablet:text-[34px] max-tablet:leading-[36px]">{current.title}</h2>

      {message ? <Notice tone="warning">{message}</Notice> : null}

      {current.key === "you" ? (
        <Fieldset legend="About you">
          <div {...field("name")}><TextField name="name" label="Your name" required autoComplete="name" value={answers.name} onChange={(e) => set("name", e.target.value)} error={err("name")} /></div>
          <div {...field("email")}><TextField name="email" type="email" label="Email" required autoComplete="email" inputMode="email" value={answers.email} onChange={(e) => set("email", e.target.value)} error={err("email")} hint="We'll reply here." /></div>
          <div {...field("phone")}><TextField name="phone" type="tel" label="Phone (optional)" autoComplete="tel" value={answers.phone} onChange={(e) => set("phone", e.target.value)} error={err("phone")} /></div>
        </Fieldset>
      ) : null}

      {current.key === "business" ? (
        <Fieldset legend="Your business">
          <div {...field("business")}><TextField name="business" label="Business name" required autoComplete="organization" value={answers.business} onChange={(e) => set("business", e.target.value)} error={err("business")} /></div>
          <div {...field("town")}><TextField name="town" label="Where is your farm or kitchen?" required hint="Town and state, like “Cedarburg, WI”." value={answers.town} onChange={(e) => set("town", e.target.value)} error={err("town")} /></div>
          <div {...field("category")}><Select name="category" label="What do you mainly sell?" required options={APPLY_CATEGORIES} placeholder="Choose one" value={answers.category} onChange={(e) => set("category", e.target.value)} error={err("category")} /></div>
          <div {...field("products")}><TextField name="products" multiline label="Tell us about your products" required hint="What you grow or make, and how." value={answers.products} onChange={(e) => set("products", e.target.value)} error={err("products")} /></div>
        </Fieldset>
      ) : null}

      {current.key === "work" ? (
        <Fieldset legend="Show us your work" hint="Add photos of your products or stall, your Instagram, or a website. Any one is enough.">
          {errors.work ? <p className="wfb-field-error m-0" role="alert">{errors.work}</p> : null}
          <div {...field("instagram")}><TextField name="instagram" label="Instagram (optional)" placeholder="@yourfarm" autoCapitalize="none" autoCorrect="off" value={answers.instagram} onChange={(e) => set("instagram", e.target.value)} error={err("instagram")} /></div>
          <div {...field("website")}><TextField name="website" type="url" inputMode="url" label="Website (optional)" placeholder="yourfarm.com" autoCapitalize="none" value={answers.website} onChange={(e) => set("website", e.target.value)} error={err("website")} /></div>
          <div className="grid gap-2" {...field("photos")}>
            <span className="wfb-field-label">Photos (optional)</span>
            <p className="wfb-field-hint">Up to {MAX_PHOTOS} photos, 10 MB each. JPG, PNG or HEIC.</p>
            {photos.length ? (
              <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 p-0">
                {photos.map((p) => (
                  <li key={p.key} className="grid gap-1.5 rounded-md border-2 border-ink bg-paper p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of the chosen file */}
                    <img src={p.preview} alt="" className="aspect-square w-full rounded-sm bg-kraft object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                    <span className="truncate font-sans text-[13px] leading-[18px]" title={p.name}>{p.name}</span>
                    <span className={cx("font-sans text-[13px] leading-[18px] font-bold", p.status === "failed" ? "text-heirloom-text" : p.status === "done" ? "text-kale-text" : "text-ink-muted")}>
                      {p.status === "uploading" ? "Uploading…" : p.status === "done" ? "Uploaded" : "Didn't upload. Remove it and try again."}
                    </span>
                    <button type="button" onClick={() => removePhoto(p.key)} className="min-h-[44px] cursor-pointer rounded-pill border-2 border-ink bg-paper px-3 font-sans text-[13px] font-extrabold uppercase tracking-[.1em] text-ink hover:bg-kraft focus-visible:[outline:3px_solid_var(--focus)] focus-visible:[outline-offset:2px]">
                      Remove<span className="sr-only"> {p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {photos.length < MAX_PHOTOS ? (
              <label className="wfb-btn wfb-btn-outline w-fit cursor-pointer focus-within:[outline:3px_solid_var(--focus)] focus-within:[outline-offset:2px]">
                <span>{photos.length ? "Add more photos" : "Add photos"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={addPhotos} className="sr-only" />
              </label>
            ) : null}
            {photoError ? <p className="wfb-field-error m-0" role="alert">{photoError}</p> : null}
          </div>
        </Fieldset>
      ) : null}

      {current.key === "stall" ? (
        <>
          <Group name="markets" legend="Which markets interest you?" hint="The Summer Market comes first; the others are still being planned." error={err("markets")}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-x-5">
              {APPLY_MARKETS.map((m) => (
                <Checkbox key={m} name="markets" value={m} label={m} checked={answers.markets.includes(m)} onChange={(e) => set("markets", e.target.checked ? [...answers.markets, m] : answers.markets.filter((x) => x !== m))} />
              ))}
            </div>
          </Group>
          <YesNo name="needsPower" legend="Do you need power at your stall?" value={answers.needsPower} onChange={(v) => set("needsPower", v)} error={err("needsPower")} />
          <YesNo name="needsVehicle" legend="Does your vehicle need to stay at your stall?" value={answers.needsVehicle} onChange={(v) => set("needsVehicle", v)} error={err("needsVehicle")} />
          <div {...field("stallSize")}><Select name="stallSize" label="Stall size" required options={[...STALL_SIZES]} placeholder="Choose one" value={answers.stallSize} onChange={(e) => set("stallSize", e.target.value)} error={err("stallSize")} /></div>
          <div {...field("yearsSelling")}><Select name="yearsSelling" label="How long have you been selling?" required options={[...YEARS_SELLING]} placeholder="Choose one" value={answers.yearsSelling} onChange={(e) => set("yearsSelling", e.target.value)} error={err("yearsSelling")} /></div>
          <div {...field("otherMarkets")}><TextField name="otherMarkets" multiline label="Other markets or shops you sell at (optional)" value={answers.otherMarkets} onChange={(e) => set("otherMarkets", e.target.value)} error={err("otherMarkets")} /></div>
        </>
      ) : null}

      {current.key === "review" ? (
        <>
          <Review answers={answers} photos={photos.filter((p) => p.status === "done").length} onEdit={goTo} />
          <div className="grid gap-1" {...field("insurance")}>
            <Checkbox name="insurance" label="I have, or will get, product liability insurance before the season starts." checked={answers.insurance} onChange={(e) => set("insurance", e.target.checked)} aria-invalid={err("insurance") ? true : undefined} aria-describedby={err("insurance") ? "insurance-err" : undefined} />
            {err("insurance") ? <p className="wfb-field-error m-0" id="insurance-err">{err("insurance")}</p> : null}
          </div>
          <div className="grid gap-1" {...field("tokens")}>
            <Checkbox
              name="tokens"
              label="I'll accept market tokens."
              hint="Tokens are how shoppers using SNAP/EBT and Market Match pay at the Market."
              checked={answers.tokens}
              onChange={(e) => set("tokens", e.target.checked)}
              aria-invalid={err("tokens") ? true : undefined}
              aria-describedby={err("tokens") ? "tokens-err" : undefined}
            />
            {err("tokens") ? <p className="wfb-field-error m-0" id="tokens-err">{err("tokens")}</p> : null}
          </div>
        </>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-0 border-t-2 border-dashed border-hairline pt-5">
        {step > 0 ? <Button type="button" variant="outline" onClick={() => goTo(step - 1)} disabled={sending}>Back</Button> : null}
        {step < LAST ? (
          <Button type="submit" variant="primary" iconAfter="arrow-right" className="ml-auto">Next</Button>
        ) : (
          <Button type="submit" variant="accent" className="ml-auto" disabled={sending}>{sending ? "Sending…" : "Send application"}</Button>
        )}
      </div>
    </form>
  );
}

function Fieldset({ legend, hint, children }: { legend: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 grid min-w-0 gap-5 border-0 p-0">
      <legend className="sr-only">{legend}</legend>
      {hint ? <p className="m-0 font-sans text-[16px] leading-[25px]">{hint}</p> : null}
      {children}
    </fieldset>
  );
}

function Group({ name, legend, hint, error, children }: { name: string; legend: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <fieldset data-field={name} className={cx("wfb-field m-0 min-w-0 border-0 p-0", error && "wfb-field-invalid")} aria-describedby={error ? `${name}-err` : undefined}>
      <legend className="wfb-field-label mb-1 p-0">{legend}<span className="wfb-field-req" aria-hidden="true">*</span></legend>
      {hint ? <p className="wfb-field-hint">{hint}</p> : null}
      {children}
      {error ? <p id={`${name}-err`} className="wfb-field-error">{error}</p> : null}
    </fieldset>
  );
}

function YesNo({ name, legend, value, onChange, error }: { name: string; legend: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <Group name={name} legend={legend} error={error}>
      <div className="flex flex-wrap gap-x-6">
        {(["yes", "no"] as const).map((v) => (
          <label key={v} className="wfb-check min-w-[88px] [&_input]:rounded-full">
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
            <span>{v === "yes" ? "Yes" : "No"}</span>
          </label>
        ))}
      </div>
    </Group>
  );
}

function Review({ answers: a, photos, onEdit }: { answers: Answers; photos: number; onEdit: (step: number) => void }) {
  const yesNo = (v: string) => (v === "yes" ? "Yes" : v === "no" ? "No" : "");
  const groups: { step: number; rows: [string, string][] }[] = [
    { step: 0, rows: [["Name", a.name], ["Email", a.email], ["Phone", a.phone || "Not given"]] },
    { step: 1, rows: [["Business", a.business], ["Where", a.town], ["Mainly sells", a.category], ["Products", a.products]] },
    {
      step: 2,
      rows: [
        ["Instagram", a.instagram ? `@${a.instagram}` : "Not given"],
        ["Website", a.website ? websiteUrl(a.website) : "Not given"],
        ["Photos", photos ? `${photos} uploaded` : "None"],
      ],
    },
    {
      step: 3,
      rows: [
        ["Markets", a.markets.join(", ")], ["Power", yesNo(a.needsPower)], ["Vehicle at the stall", yesNo(a.needsVehicle)], ["Stall size", a.stallSize],
        ["Selling for", a.yearsSelling], ["Also sells at", a.otherMarkets || "Not given"],
      ],
    },
  ];
  return (
    <div className="grid gap-4">
      <p className="m-0 font-sans text-[16px] leading-[25px]">Check your answers, then send.</p>
      {groups.map((g) => (
        <section key={g.step} className="rounded-md border-2 border-ink bg-canvas p-4" aria-labelledby={`review-${g.step}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 id={`review-${g.step}`} className="m-0 font-sans text-[15px] leading-[20px] font-extrabold uppercase tracking-[.1em]">{STEPS[g.step].title}</h3>
            <button type="button" onClick={() => onEdit(g.step)} className="min-h-[44px] cursor-pointer rounded-pill border-0 bg-transparent px-2 font-sans text-[15px] font-bold text-bay underline decoration-corn decoration-2 underline-offset-4 focus-visible:[outline:3px_solid_var(--focus)]">
              Edit<span className="sr-only"> {STEPS[g.step].title.toLowerCase()}</span>
            </button>
          </div>
          <dl className="m-0 grid grid-cols-[minmax(0,150px)_minmax(0,1fr)] gap-x-4 gap-y-1.5 font-sans text-[15px] leading-[22px] max-phone:grid-cols-1 max-phone:gap-y-0">
            {g.rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="font-bold max-phone:mt-2">{k}</dt>
                <dd className="m-0 break-words whitespace-pre-line">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
