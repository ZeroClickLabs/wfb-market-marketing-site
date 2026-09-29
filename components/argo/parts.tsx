/* eslint-disable @next/next/no-img-element -- maker photos and partner logos are shown as supplied */
import type { ReactNode } from "react";
import { Button, Icon } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import { FactList, StubForm } from "@/components/site";
import { argo, visibleProgram, type ArgoMaker, type ArgoStatus } from "@/content/argo";
import { formatDate, formatTimeRange, mapsUrl, todayISO, toMarketISO } from "@/content/format";
import { ARGO_ACTIONS, ARGO_BODY, ARGO_BUTTON, ARGO_CARD, ARGO_H2, ARGO_KICKER } from "./styles";

export const argoFacts = {
  date: formatDate(argo.date),
  time: formatTimeRange(argo.start, argo.end),
  startISO: toMarketISO(argo.date, argo.start),
  endISO: toMarketISO(argo.date, argo.end),
  /** "until 6 pm", for the countdown while the market is on. */
  untilLabel: `until ${formatTimeRange(argo.start, argo.end).split("–").pop()}`,
  /** Shown in place of the countdown before it starts ticking. */
  countingDown: `Counting down to ${formatDate(argo.date).split(", ").pop()}`,
  calendarHref: `/events/${argo.slug}/calendar.ics`,
  directionsHref: mapsUrl(argo.venue.address || argo.venue.mapsQuery),
};

function StarGlyph({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" fill="currentColor" /></svg>;
}

/** Double rules either side of a star, under section titles. */
export function StarRule() {
  const rule = "h-0.5 w-[min(120px,22vw)] bg-current shadow-[0_5px_0_currentColor]";
  return (
    <div className="my-3.5 flex items-center justify-center gap-3.5 text-argo-gold in-data-[ground=cream]:text-argo-red" aria-hidden="true">
      <span className={rule} />
      <StarGlyph className="size-[22px]" />
      <span className={rule} />
    </div>
  );
}

export function StripeEdge() {
  return <div className="argo-stripe" aria-hidden="true" />;
}

export function MarqueeLights() {
  return <div className="argo-lights" aria-hidden="true" />;
}

export function Kicker({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return <p id={id} className={cx(ARGO_KICKER, className)}>{children}</p>;
}

export type ArgoGround = "red" | "green" | "cream";

const GROUND: Record<ArgoGround, string> = {
  red: "bg-argo-red text-argo-cream",
  green: "bg-argo-green text-argo-cream",
  cream: "bg-argo-cream text-argo-ink [--argo-focus:var(--color-argo-green)]",
};

/** A full-width band on one of the holiday grounds. Children can style themselves by ground with in-data-[ground=…]. */
export function ArgoSection({ ground, id, sparkle, children, labelledBy }: { ground: ArgoGround; id?: string; sparkle?: boolean; children: ReactNode; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} data-ground={ground} className={cx("relative py-8 max-desktop:py-7", GROUND[ground], sparkle && "argo-sparkle")}>
      <div className="mx-auto w-full max-w-content px-6 max-tablet:px-4">{children}</div>
    </section>
  );
}

export function ArgoHeading({ id, kicker, title, lead }: { id: string; kicker: string; title: string; lead?: ReactNode }) {
  return (
    <header className="mx-auto mb-6 max-w-[760px] text-center">
      <Kicker>{kicker}</Kicker>
      <h2 className={ARGO_H2} id={id}>{title}</h2>
      <StarRule />
      {lead ? <p className="mx-auto mt-2.5 mb-0 max-w-(--prose-max) font-sans text-[19px] leading-[30px]">{lead}</p> : null}
    </header>
  );
}

const STATUS = "inline-flex h-[28px] items-center gap-1.5 rounded-pill border-2 bg-argo-paper px-3 font-sans text-[12px] leading-none font-extrabold uppercase tracking-[.12em]";

/** Unconfirmed items are labelled in words, never by colour alone. Confirmed items need no label. */
export function StatusLabel({ status }: { status: ArgoStatus }) {
  if (status !== "planned") return null;
  return <span className={cx(STATUS, "border-argo-gold-text text-argo-gold-text")}>Planned</span>;
}

const CARD_TEXT = "m-0 font-sans text-[16px] leading-[25px]";
const CARD_META = "flex flex-wrap items-center gap-x-3.5 gap-y-2 font-sans text-[14px] leading-[20px] font-bold text-argo-ink-muted *:inline-flex *:items-center *:gap-1.5";

/* ------------------------------------------------------------------ Sections */

export function StorySection() {
  return (
    <ArgoSection ground="cream" labelledBy="argo-story">
      <div className="mx-auto max-w-[760px] text-center">
        <ArgoHeading id="argo-story" kicker="Coming soon" title="A holiday market for Whitefish Bay" />
        {argo.story.map((p) => <p className={ARGO_BODY} key={p}>{p}</p>)}
        <ul className="m-0 mt-5 flex list-none flex-wrap justify-center gap-2.5 p-0">
          {argo.storyMarks.map((m) => (
            <li key={m} className="inline-flex items-center gap-2 rounded-pill border-2 border-dashed border-argo-red px-3.5 py-2 font-sans text-[13px] leading-none font-extrabold uppercase tracking-[.14em] text-argo-red">
              <StarGlyph className="size-3.5 text-argo-gold-text" />
              {m}
            </li>
          ))}
        </ul>
      </div>
    </ArgoSection>
  );
}

export function ProgramSection() {
  return (
    <ArgoSection ground="green" id="whats-happening" sparkle labelledBy="argo-program">
      <ArgoHeading id="argo-program" kicker="What to expect" title="What's happening" lead="Some plans are still being finalized. Anything marked “Planned” isn't confirmed yet." />
      {/* Rows of three; a short last row is centred rather than left hanging. */}
      <div className="flex flex-wrap justify-center gap-5">
        {visibleProgram().map((p) => (
          <article className={cx(ARGO_CARD, "flex-[0_1_340px] max-tablet:basis-full")} key={p.id}>
            <h3 className="m-0 font-argo text-[25px] leading-[1.2] font-bold text-argo-red">{p.title}</h3>
            <p className={CARD_TEXT}>{p.text}</p>
            {p.time || p.status === "planned" ? (
              <div className={CARD_META}>
                {p.time ? <span><Icon name="clock" size={16} />{p.time}</span> : null}
                <StatusLabel status={p.status} />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </ArgoSection>
  );
}

function isNew(m: ArgoMaker, today = todayISO()) {
  if (!m.announced) return false;
  const days = (Date.parse(today) - Date.parse(m.announced)) / 86_400_000;
  return days >= 0 && days <= 14;
}

export function MakersSection() {
  const makers = argo.makers;
  return (
    <ArgoSection ground="cream" id="makers" labelledBy="argo-makers">
      <ArgoHeading
        id="argo-makers"
        kicker="Meet the makers & merchants"
        title="Local makers, curated"
        lead={makers.length ? `${makers.length} of about ${argo.makersExpected} announced so far, with more to come.` : undefined}
      />
      {makers.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(250px,100%),1fr))] gap-5">
          {makers.map((m) => (
            <article className={ARGO_CARD} key={m.name}>
              {m.image || m.logo ? (
                <div className="-mx-5 -mt-5 mb-1.5 grid aspect-[4/3] place-items-center overflow-hidden rounded-t-[11px] border-b-3 border-argo-gold bg-argo-cream">
                  {m.image ? (
                    <img className="block size-full object-cover" src={m.image} alt={m.imageAlt ?? ""} />
                  ) : (
                    <img className="block size-[70%] object-contain" src={m.logo} alt="" />
                  )}
                </div>
              ) : null}
              <h3 className="m-0 font-sans text-[20px] leading-[26px] font-extrabold [&_a]:text-inherit [&_a]:no-underline [&_a]:after:absolute [&_a]:after:inset-0 [&_a]:after:content-['']">
                {m.href ? <a href={m.href}>{m.name}</a> : m.name}
              </h3>
              <p className={CARD_TEXT}>{m.what}</p>
              {m.from || isNew(m) ? (
                <div className={CARD_META}>
                  {m.from ? <span><Icon name="map-pin" size={16} />{m.from}</span> : null}
                  {isNew(m) ? <span className={cx(STATUS, "border-argo-green text-argo-green")}>Newly announced</span> : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mx-auto grid max-w-[860px] grid-cols-[auto_minmax(0,1fr)] items-center gap-6 rounded-[14px] border-3 border-argo-gold bg-argo-paper p-6 shadow-[6px_6px_0_rgba(42,21,18,.18)] max-tablet:grid-cols-[minmax(0,1fr)] max-tablet:justify-items-center max-tablet:p-5 max-tablet:text-center">
          <div aria-hidden="true" className="grid size-[150px] place-items-center rounded-full border-3 border-argo-gold bg-argo-red text-center text-argo-gold shadow-[0_0_0_6px_var(--color-argo-paper),0_0_0_9px_var(--color-argo-gold)]">
            <div>
              <b className="block font-argo text-[64px] leading-none font-bold">{argo.makersExpected}</b>
              <span className="font-sans text-[11px] leading-[14px] font-extrabold uppercase tracking-[.14em] text-argo-cream">local makers</span>
            </div>
          </div>
          <div>
            <h3 className="mt-0 mb-2 font-argo text-[28px] leading-[1.2] font-bold text-argo-red">Announced soon</h3>
            <p className="mt-0 mb-3 font-sans text-[18px] leading-[28px]">
              We&rsquo;re bringing together a curated collection of about {argo.makersExpected} local makers, merchants and small businesses for Christmas at The Argo. Participating vendors will be announced soon.
            </p>
            <Button variant="outline" icon="instagram" href={argo.updates.instagram} className={ARGO_BUTTON.outlineOnLight}>Follow along</Button>
          </div>
        </div>
      )}
    </ArgoSection>
  );
}

export function VillageSection() {
  return (
    <ArgoSection ground="red" sparkle labelledBy="argo-village">
      <ArgoHeading
        id="argo-village"
        kicker="Make a day of it"
        title="Explore Whitefish Bay"
        lead="After the market, stay for the afternoon: the village's shops, restaurants and businesses are just down the street."
      />
      {argo.merchants.length ? (
        <ul className="mx-auto my-0 grid max-w-[860px] list-none grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-x-5 gap-y-3 p-0">
          {argo.merchants.map((m) => (
            <li key={m.name} className="border-0 border-b-2 border-dashed border-[rgba(233,185,73,.5)] py-3 font-sans text-[16px] leading-[24px]">
              <b className="block font-extrabold text-argo-gold">
                {m.href ? <a className="text-argo-cream decoration-argo-gold underline-offset-4" href={m.href}>{m.name}</a> : m.name}
              </b>
              {m.what}
            </li>
          ))}
        </ul>
      ) : null}
    </ArgoSection>
  );
}

export function VisitSection() {
  const where = argo.venue.address ? `${argo.venue.name}, ${argo.venue.address}` : `${argo.venue.name}, ${argo.venue.town}`;
  return (
    <ArgoSection ground="cream" id="plan" labelledBy="argo-plan">
      <ArgoHeading id="argo-plan" kicker="Plan your visit" title="See you at The Argo" />
      <FactList
        tone="argo"
        facts={[
          { icon: "calendar", label: "Date", value: argoFacts.date },
          { icon: "clock", label: "Time", value: argoFacts.time },
          { icon: "map-pin", label: "Where", value: where },
          { icon: "tent", label: "Admission", value: `${argo.admission} · indoors` },
        ]}
      />
      {!argo.detailsFinal ? (
        <p className="mx-auto mt-4 mb-0 text-center font-sans text-[15px] leading-[22px] text-argo-ink-muted">Times and activities are still being finalized. We&rsquo;ll post updates here.</p>
      ) : null}
      <div className={cx(ARGO_ACTIONS, "justify-center")}>
        <Button variant="accent" icon="map-pin" href={argoFacts.directionsHref} className={ARGO_BUTTON.accent}>Get directions</Button>
        <Button variant="outline" icon="calendar" href={argoFacts.calendarHref} className={ARGO_BUTTON.outlineOnLight}>Add to calendar</Button>
      </div>
    </ArgoSection>
  );
}

export function UpdatesSection() {
  return (
    <ArgoSection ground="green" id="updates" sparkle labelledBy="argo-updates">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-7 max-desktop:grid-cols-[minmax(0,1fr)]">
        <div>
          <Kicker>Stay in the loop</Kicker>
          <h2 className={ARGO_H2} id="argo-updates">Don&rsquo;t miss Christmas at The Argo</h2>
          <p className={cx(ARGO_BODY, "mt-4")}>{argo.updates.line}</p>
          <div className={cx(ARGO_ACTIONS, "justify-start")}>
            <Button variant="accent" icon="instagram" href={argo.updates.instagram} className={ARGO_BUTTON.accent}>Follow on Instagram</Button>
          </div>
        </div>
        <StubForm
          tone="argo"
          title="Event updates sign-up"
          fields={[{ kind: "email", name: "email", label: "Email address", hint: "Just for news about Christmas at The Argo.", required: true, autoComplete: "email", requiredMessage: "Enter your email address." }]}
          submitLabel="Get event updates"
          emailSubject="Christmas at The Argo updates"
        />
      </div>
    </ArgoSection>
  );
}

export function SponsorsSection() {
  if (!argo.sponsors.length) return null;
  return (
    <ArgoSection ground="cream" labelledBy="argo-sponsors">
      <header className="mx-auto mb-5 max-w-[760px] text-center">
        <Kicker id="argo-sponsors">With thanks to</Kicker>
      </header>
      <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-6 p-0">
        {argo.sponsors.map((s) => {
          const mark = s.logo ? <img className="block h-12 w-auto" src={s.logo} alt={s.name} height={48} /> : <span className="font-sans text-[15px] leading-[20px] font-bold text-argo-ink-muted">{s.name}</span>;
          return <li key={s.name}>{s.href ? <a href={s.href}>{mark}</a> : mark}</li>;
        })}
      </ul>
    </ArgoSection>
  );
}
