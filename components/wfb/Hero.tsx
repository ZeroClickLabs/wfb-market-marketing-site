import type { ReactNode } from "react";
import { Button } from "./Button";
import { Bunting, Ornament } from "./Decor";
import { cx, useArt } from "./utils";

export interface HeroProps {
  script?: string | false;
  title?: string;
  sub?: ReactNode;
  /** One `accent` button plus one `outline`. */
  actions?: ReactNode[];
  ariaLabel?: string;
  className?: string;
}

export function Hero({ script, title, sub, actions, ariaLabel, className }: HeroProps) {
  const panorama = useArt("panorama");
  return (
    <section className={cx("wfb", "wfb-hero", "wfb-grain", className)} aria-label={ariaLabel ?? "Welcome"}>
      <Bunting />
      <div className="wfb-hero-copy">
        {script !== false ? <p className="wfb-hero-script">{script ?? "Saturdays by the lake"}</p> : null}
        <h1 className="wfb-hero-title">{title ?? "Fresh from the Bay"}</h1>
        <Ornament />
        <p className="wfb-hero-sub">
          {sub ?? "Forty-plus local growers, bakers and makers, live music and a lake breeze. Every Saturday, June through September."}
        </p>
        <div className="wfb-row" style={{ justifyContent: "center" }}>
          {actions ?? [
            <Button key="a" variant="accent" size="lg" iconAfter="arrow-right" href="/visit">Plan your visit</Button>,
            <Button key="b" variant="outline" size="lg" href="/vendors">Meet the vendors</Button>,
          ]}
        </div>
      </div>
      <div className="wfb-hero-art" aria-hidden="true" dangerouslySetInnerHTML={panorama} />
    </section>
  );
}
