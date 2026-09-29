import Image from "next/image";
import { Button } from "@/components/wfb";
import logo from "./assets/christmas-at-the-argo-logo.webp";
import { argo, argoPath } from "@/content/argo";
import { inWindow } from "@/content/format";
import { Countdown } from "./Countdown";
import { HolidayOrnament } from "./Ornaments";
import { argoFacts, MarqueeLights } from "./parts";

/** The home page's seasonal feature: a shop window for Christmas at The Argo, shown until the event day. */
export function ArgoPromo() {
  if (!inWindow(argo.promo.from, argo.date)) return null;
  return (
    <section className="argo argo-promo" aria-labelledby="argo-promo-title">
      <div className="argo-valance" aria-hidden="true" />
      <MarqueeLights />
      <div className="argo-promo-body">
        <div className="argo-promo-copy">
          <p className="argo-kicker">Coming soon · Free admission</p>
          <h2 className="argo-logo-heading" id="argo-promo-title">
            <Image src={logo} alt="Christmas at The Argo, presented by Whitefish Bay Farmers Market Corp." className="argo-logo-img" sizes="(max-width: 900px) 80vw, 460px" />
          </h2>
          <p className="argo-promo-date">{argoFacts.date} · {argoFacts.time}</p>
          <Countdown start={argoFacts.startISO} end={argoFacts.endISO} untilLabel={argoFacts.untilLabel} fallback={argoFacts.countingDown} className="argo-promo-countdown" />
          <p className="argo-promo-line">{argo.promo.line}</p>
          <div className="argo-actions">
            <Button variant="accent" size="lg" iconAfter="arrow-right" href={argoPath}>Explore the holiday market</Button>
          </div>
        </div>
        <div className="argo-promo-art" aria-hidden="true">
          <HolidayOrnament name="tree" />
          <HolidayOrnament name="gift" />
          <HolidayOrnament name="bauble" />
          <HolidayOrnament name="candy-cane" />
        </div>
      </div>
    </section>
  );
}
