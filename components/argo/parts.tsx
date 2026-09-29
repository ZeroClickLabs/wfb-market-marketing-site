/* eslint-disable @next/next/no-img-element -- maker photos and partner logos are shown as supplied */
import type { ReactNode } from "react";
import { Button, Icon } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import { FactList, StubForm } from "@/components/site";
import { argo, visibleProgram, type ArgoMaker, type ArgoStatus } from "@/content/argo";
import { formatDate, formatTimeRange, mapsUrl, todayISO, toMarketISO } from "@/content/format";
import { HolidayOrnament } from "./Ornaments";

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

function StarGlyph() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" fill="currentColor" /></svg>;
}

export function StarRule() {
  return <div className="argo-rule" aria-hidden="true"><StarGlyph /></div>;
}

export function StripeEdge() {
  return <div className="argo-stripe" aria-hidden="true" />;
}

export function MarqueeLights() {
  return <div className="argo-lights" aria-hidden="true" />;
}

export type ArgoGround = "red" | "green" | "cream";

export function ArgoSection({ ground, id, sparkle, children, className, labelledBy }: { ground: ArgoGround; id?: string; sparkle?: boolean; children: ReactNode; className?: string; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx("argo-section", `argo-${ground}`, sparkle && "argo-sparkle", className)}>
      <div className="argo-container">{children}</div>
    </section>
  );
}

export function ArgoHeading({ id, kicker, title, lead }: { id: string; kicker: string; title: string; lead?: ReactNode }) {
  return (
    <header className="argo-heading">
      <p className="argo-kicker">{kicker}</p>
      <h2 className="argo-h2" id={id}>{title}</h2>
      <StarRule />
      {lead ? <p className="argo-lead">{lead}</p> : null}
    </header>
  );
}

/** Unconfirmed items are labelled in words, never by colour alone. Confirmed items need no label. */
export function StatusLabel({ status }: { status: ArgoStatus }) {
  if (status !== "planned") return null;
  return <span className="argo-status">Planned</span>;
}

/* ------------------------------------------------------------------ Sections */

export function StorySection() {
  return (
    <ArgoSection ground="cream" labelledBy="argo-story">
      <div className="argo-story">
        <ArgoHeading id="argo-story" kicker="Coming soon" title="A holiday market for Whitefish Bay" />
        {argo.story.map((p) => <p className="argo-body" key={p}>{p}</p>)}
        <ul className="argo-marks">
          {argo.storyMarks.map((m) => <li key={m}><StarGlyph />{m}</li>)}
        </ul>
      </div>
    </ArgoSection>
  );
}

export function ProgramSection() {
  return (
    <ArgoSection ground="green" id="whats-happening" sparkle labelledBy="argo-program">
      <ArgoHeading id="argo-program" kicker="What to expect" title="What's happening" lead="Some plans are still being finalized. Anything marked “Planned” isn't confirmed yet." />
      <div className="argo-program">
        {visibleProgram().map((p) => (
          <article className="argo-card" key={p.id}>
            <span className="argo-card-art"><HolidayOrnament name={p.ornament} /></span>
            <h3 className="argo-card-title">{p.title}</h3>
            <p>{p.text}</p>
            {p.time || p.status === "planned" ? (
              <div className="argo-card-meta">
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
        <div className="argo-grid">
          {makers.map((m) => (
            <article className="argo-card" key={m.name}>
              <div className="argo-maker-media">
                {m.image ? <img src={m.image} alt={m.imageAlt ?? ""} /> : m.logo ? <img className="argo-logo" src={m.logo} alt="" /> : <HolidayOrnament name="gift" />}
              </div>
              <h3 className="argo-maker-name">{m.href ? <a href={m.href}>{m.name}</a> : m.name}</h3>
              <p>{m.what}</p>
              {m.from || isNew(m) ? (
                <div className="argo-card-meta">
                  {m.from ? <span><Icon name="map-pin" size={16} />{m.from}</span> : null}
                  {isNew(m) ? <span className="argo-status argo-status-new">Newly announced</span> : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="argo-reveal">
          <div className="argo-reveal-count" aria-hidden="true"><div><b>{argo.makersExpected}</b><span>local makers</span></div></div>
          <div>
            <h3 className="argo-reveal-title">Announced soon</h3>
            <p>We&rsquo;re bringing together a curated collection of about {argo.makersExpected} local makers, merchants and small businesses for Christmas at The Argo. Participating vendors will be announced soon.</p>
            <Button variant="outline" icon="instagram" href={argo.updates.instagram}>Follow along</Button>
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
        <ul className="argo-merchants">
          {argo.merchants.map((m) => (
            <li key={m.name}><b>{m.href ? <a href={m.href}>{m.name}</a> : m.name}</b>{m.what}</li>
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
        facts={[
          { icon: "calendar", label: "Date", value: argoFacts.date },
          { icon: "clock", label: "Time", value: argoFacts.time },
          { icon: "map-pin", label: "Where", value: where },
          { icon: "tent", label: "Admission", value: `${argo.admission} · indoors` },
        ]}
      />
      {!argo.detailsFinal ? <p className="argo-visit-note">Times and activities are still being finalized. We&rsquo;ll post updates here.</p> : null}
      <div className="argo-visit-actions">
        <Button variant="accent" icon="map-pin" href={argoFacts.directionsHref}>Get directions</Button>
        <Button variant="outline" icon="calendar" href={argoFacts.calendarHref}>Add to calendar</Button>
      </div>
    </ArgoSection>
  );
}

export function UpdatesSection() {
  return (
    <ArgoSection ground="green" id="updates" sparkle labelledBy="argo-updates">
      <div className="argo-updates">
        <div>
          <p className="argo-kicker">Stay in the loop</p>
          <h2 className="argo-h2" id="argo-updates">Don&rsquo;t miss Christmas at The Argo</h2>
          <p className="argo-body" style={{ marginTop: 16 }}>{argo.updates.line}</p>
          <div className="argo-actions" style={{ justifyContent: "flex-start" }}>
            <Button variant="accent" icon="instagram" href={argo.updates.instagram}>Follow on Instagram</Button>
          </div>
        </div>
        <StubForm
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
      <header className="argo-heading" style={{ marginBottom: 24 }}>
        <p className="argo-kicker" id="argo-sponsors">With thanks to</p>
      </header>
      <ul className="argo-sponsors">
        {argo.sponsors.map((s) => {
          const mark = s.logo ? <img src={s.logo} alt={s.name} height={48} /> : <span>{s.name}</span>;
          return <li key={s.name}>{s.href ? <a href={s.href}>{mark}</a> : mark}</li>;
        })}
      </ul>
    </ArgoSection>
  );
}
