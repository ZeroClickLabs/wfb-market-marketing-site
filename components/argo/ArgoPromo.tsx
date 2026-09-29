import Image from "next/image";
import { Button } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import logo from "./assets/christmas-at-the-argo-logo.webp";
import { argo, argoPath } from "@/content/argo";
import { inWindow } from "@/content/format";
import { Countdown } from "./Countdown";
import { argoFacts, Kicker, MarqueeLights } from "./parts";
import { ARGO_ACTIONS, ARGO_BUTTON, ARGO_ROOT } from "./styles";

/** The home page's seasonal feature: a shop window for Christmas at The Argo, shown until the event day. */
export function ArgoPromo() {
  if (!inWindow(argo.promo.from, argo.date)) return null;
  return (
    <section
      aria-labelledby="argo-promo-title"
      className={cx(
        ARGO_ROOT,
        "relative mx-auto mt-0 mb-8 max-w-[1040px] overflow-hidden rounded-t-[18px] rounded-b-[8px] border-3 border-argo-gold bg-argo-red text-argo-cream",
        "shadow-[0_0_0_6px_var(--color-argo-red-deep),0_0_0_9px_var(--color-argo-gold),10px_12px_0_9px_rgba(42,21,18,.3)]",
      )}
    >
      <div className="argo-valance" aria-hidden="true" />
      <MarqueeLights />
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-7 px-7 pt-7 pb-7 max-desktop:grid-cols-[minmax(0,1fr)] max-desktop:gap-5 max-tablet:px-6 max-tablet:pt-6 max-tablet:pb-6">
        {/* The logo: right-hand column on wide screens, first when stacked. */}
        <h2 className="order-2 mx-auto my-0 w-full max-w-[520px] leading-0 max-desktop:order-none max-desktop:max-w-[460px]" id="argo-promo-title">
          <Image src={logo} alt="Christmas at The Argo, presented by Whitefish Bay Farmers Market Corp." className="block h-auto w-full" sizes="(max-width: 900px) 80vw, 520px" />
        </h2>
        <div className="max-tablet:text-center">
          <Kicker>Free admission</Kicker>
          <p className="mt-2.5 mb-0 font-sans text-[clamp(20px,2.4vw,26px)] leading-[1.2] font-extrabold uppercase tracking-[.06em] text-argo-cream"><span className="whitespace-nowrap">{argoFacts.date}</span><br /> <span className="whitespace-nowrap">{argoFacts.time}</span></p>
          <Countdown start={argoFacts.startISO} end={argoFacts.endISO} untilLabel={argoFacts.untilLabel} fallback={argoFacts.countingDown} placement="promo" />
          <p className="mt-2.5 mb-0 max-w-[460px] font-sans text-[19px] leading-[28px] text-argo-cream max-tablet:mx-auto">{argo.promo.line}</p>
          <div className={cx(ARGO_ACTIONS, "justify-start max-tablet:justify-center")}>
            <Button
              variant="accent"
              size="lg"
              iconAfter="arrow-right"
              href={argoPath}
              // On phones: a compact button with room either side, and no arrow on the narrowest screens.
              className={cx(ARGO_BUTTON.accent, "max-tablet:h-12 max-tablet:gap-2 max-tablet:px-[20px] max-tablet:text-[12px] max-tablet:tracking-[.06em] max-phone:[&_.wfb-icon]:hidden")}
            >
              Explore the holiday market
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
