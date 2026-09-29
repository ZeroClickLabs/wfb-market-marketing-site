import Image from "next/image";
import { Button, Icon } from "@/components/wfb";
import logo from "./assets/christmas-at-the-argo-logo.webp";
import { argo } from "@/content/argo";
import { Countdown } from "./Countdown";
import { HolidayOrnament } from "./Ornaments";
import { argoFacts, MarqueeLights, StripeEdge } from "./parts";

/** The shop-window hero: valance, marquee lights, the event logo and a window display of ornaments. */
export function ArgoHero({ past }: { past: boolean }) {
  return (
    <section className="argo argo-hero" aria-labelledby="argo-title">
      <MarqueeLights />
      <div className="argo-container">
        <div className="argo-window">
          <div className="argo-valance" aria-hidden="true" />
          <div className="argo-window-inner">
            <h1 className="argo-logo-heading" id="argo-title">
              <Image
                src={logo}
                alt="Christmas at The Argo, presented by Whitefish Bay Farmers Market Corp."
                className="argo-logo-img"
                sizes="(max-width: 760px) 92vw, 640px"
                priority
              />
            </h1>
            <p className="argo-subhead">{argo.subhead}</p>
            <ul className="argo-factstrip">
              <li><Icon name="calendar" size={18} />{argoFacts.date}</li>
              <li><Icon name="clock" size={18} />{argoFacts.time}</li>
              <li><Icon name="map-pin" size={18} />{argo.venue.name}</li>
              <li><Icon name="tent" size={18} />{argo.admission}</li>
            </ul>
            {past ? null : (
              <>
                <Countdown start={argoFacts.startISO} end={argoFacts.endISO} untilLabel={argoFacts.untilLabel} fallback={argoFacts.countingDown} className="argo-hero-countdown" />
                <div className="argo-actions">
                  <Button variant="accent" size="lg" iconAfter="arrow-right" href="#whats-happening">See what&rsquo;s happening</Button>
                  <Button variant="outline" size="lg" icon="mail" href="#updates">Get event updates</Button>
                </div>
                <a className="argo-small-link" href={argoFacts.calendarHref}><Icon name="calendar" size={16} />Add to calendar</a>
                {!argo.detailsFinal ? <p className="argo-note">Times are approximate while plans are finalized.</p> : null}
              </>
            )}
            <div className="argo-display-shelf" aria-hidden="true">
              <HolidayOrnament name="tree" />
              <HolidayOrnament name="gift" />
              <HolidayOrnament name="candy-cane" />
              <HolidayOrnament name="bauble" />
              <HolidayOrnament name="holly" />
              <HolidayOrnament name="gift" />
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 48 }}><StripeEdge /></div>
    </section>
  );
}
