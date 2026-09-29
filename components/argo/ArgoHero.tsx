import Image from "next/image";
import { Button, Icon } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import logo from "./assets/christmas-at-the-argo-logo.webp";
import { argo } from "@/content/argo";
import { Countdown } from "./Countdown";
import { argoFacts, MarqueeLights, StripeEdge } from "./parts";
import { ARGO_ACTIONS, ARGO_BUTTON } from "./styles";

/** The shop-window hero: valance, marquee lights and the event logo in a gold frame. */
export function ArgoHero({ past }: { past: boolean }) {
  return (
    <section className="bg-argo-red pb-7 text-argo-cream" aria-labelledby="argo-title">
      <MarqueeLights />
      <div className="mx-auto w-full max-w-content px-6 pt-8 max-tablet:px-4 max-tablet:pt-16">
        {/* The window: a gold double frame with a dark print shadow. */}
        <div className="relative mx-auto max-w-[980px] overflow-hidden rounded-t-[18px] rounded-b-[6px] border-3 border-argo-gold bg-argo-red-deep shadow-[0_0_0_6px_var(--color-argo-red-deep),0_0_0_9px_var(--color-argo-gold),10px_12px_0_9px_rgba(42,21,18,.45)]">
          <div className="argo-valance" aria-hidden="true" />
          <div className="px-6 pt-7 pb-7 text-center max-tablet:px-4 max-tablet:pt-6 max-tablet:pb-6">
            <h1 className="mx-auto mt-0 mb-5 max-w-[640px] leading-0" id="argo-title">
              <Image
                src={logo}
                alt="Christmas at The Argo, presented by Whitefish Bay Farmers Market Corp."
                className="block h-auto w-full"
                sizes="(max-width: 760px) 92vw, 640px"
                priority
              />
            </h1>
            <p className="mx-auto my-0 max-w-[620px] font-sans text-[20px] leading-[30px] font-semibold text-argo-cream">{argo.subhead}</p>
            <ul className="mx-auto mt-5 mb-0 flex list-none flex-wrap justify-center gap-2.5 p-0">
              {[
                { icon: "calendar" as const, text: argoFacts.date },
                { icon: "clock" as const, text: argoFacts.time },
                { icon: "map-pin" as const, text: argo.venue.name },
                { icon: "tent" as const, text: argo.admission },
              ].map((f) => (
                <li
                  key={f.text}
                  className="inline-flex items-center gap-2 rounded-pill border-2 border-argo-gold px-4 py-2.5 font-sans text-[15px] leading-none font-extrabold uppercase tracking-[.06em] text-argo-cream max-tablet:px-3 max-tablet:py-[9px] max-tablet:text-[13px] [&_.wfb-icon]:text-argo-gold"
                >
                  <Icon name={f.icon} size={18} />
                  {f.text}
                </li>
              ))}
            </ul>
            {past ? null : (
              <>
                <Countdown start={argoFacts.startISO} end={argoFacts.endISO} untilLabel={argoFacts.untilLabel} fallback={argoFacts.countingDown} placement="hero" />
                <div className={cx(ARGO_ACTIONS, "justify-center")}>
                  <Button variant="accent" size="lg" iconAfter="arrow-right" href="#whats-happening" className={ARGO_BUTTON.accent}>See what&rsquo;s happening</Button>
                  <Button variant="outline" size="lg" icon="mail" href="#updates" className={ARGO_BUTTON.outlineOnDark}>Get event updates</Button>
                </div>
                <a
                  className="mt-2 inline-flex min-h-[44px] items-center gap-2 font-sans text-[15px] leading-none font-bold text-argo-cream underline decoration-argo-gold decoration-2 underline-offset-[5px] hover:text-argo-gold"
                  href={argoFacts.calendarHref}
                >
                  <Icon name="calendar" size={16} />
                  Add to calendar
                </a>
                {!argo.detailsFinal ? <p className="mx-auto mt-2.5 mb-0 font-sans text-[14px] leading-[20px] text-argo-cream opacity-92">Times are approximate while plans are finalized.</p> : null}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-12"><StripeEdge /></div>
    </section>
  );
}
