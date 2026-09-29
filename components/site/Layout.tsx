import type { ReactNode } from "react";
import { AnnouncementBar, NewsletterBand, SectionEdge, SectionHeading, SiteFooter, SiteHeader, type Tone } from "@/components/wfb";
import { cx } from "@/components/wfb/utils";
import { isPast } from "@/content/format";
import { site, type SectionKey } from "@/content/site";

export interface SiteShellProps {
  children: ReactNode;
  /** The nav item to mark as the current section. */
  section?: SectionKey;
  /** "dark" is the Night Market theme. */
  theme?: "light" | "dark";
  /** Defaults to the site-wide announcement; null hides it. */
  announcement?: typeof site.announcement;
  newsletter?: boolean;
  /** Tone of the last band, shown behind the footer's wave when there's no newsletter. */
  footerAbove?: Tone;
  /** A Notice for anything unusual today, placed directly under the header. */
  notice?: ReactNode;
}

/** Announcement → header → notice → page → newsletter → footer, on every page. */
export function SiteShell({ children, section, theme = "light", announcement = site.announcement, newsletter = true, footerAbove = "canvas", notice }: SiteShellProps) {
  const links = site.nav.map((l) => ({ label: l.label, href: l.href, current: l.key === section }));
  const bar = announcement && !(announcement.until && isPast(announcement.until)) ? announcement : null;
  const shell = (
    <div className={cx("wfb", theme === "dark" && "wfb-theme-root")} data-theme={theme === "dark" ? "dark" : undefined}>
      {bar ? (
        <AnnouncementBar label={bar.label} href={bar.href} linkText={bar.linkText}>{bar.text}</AnnouncementBar>
      ) : null}
      <SiteHeader links={links} />
      <main id="main">
        {notice ? <div className="wfb-page-notice"><div className="wfb-container">{notice}</div></div> : null}
        {children}
        {newsletter ? <NewsletterBand /> : null}
      </main>
      <SiteFooter above={newsletter ? "sage" : footerAbove} />
    </div>
  );
  return shell;
}

export type Ground = "kraft" | "deep" | "canvas" | "sage";

const GROUND_CLASS: Record<Ground, string> = {
  kraft: "wfb-section-kraft wfb-grain",
  deep: "wfb-section-deep wfb-on-deep",
  canvas: "wfb-grain",
  sage: "wfb-band-sage wfb-grain",
};

export interface BandProps {
  ground?: Ground;
  id?: string;
  className?: string;
  children: ReactNode;
}

/** A page section on one of the brand grounds. Change grounds between bands with <Edge>. */
export function Band({ ground = "canvas", id, className, children }: BandProps) {
  return (
    <section id={id} className={cx("wfb-section", "wfb-band", GROUND_CLASS[ground], className)}>
      <div className="wfb-container">{children}</div>
    </section>
  );
}

/** The lake wave between two grounds. Deep always owns the wave shape, as on the home page. */
export function Edge({ from, to }: { from: Ground; to: Ground }) {
  if (from === "deep") return <SectionEdge kind="wave" tone="deep" ground={to} flip />;
  return <SectionEdge kind="wave" tone={to} ground={from} />;
}

export interface PageIntroProps {
  title: string;
  eyebrow?: string;
  lead?: ReactNode;
  actions?: ReactNode;
  /** An illustration or sub-brand Logo, shown beside the heading. */
  art?: ReactNode;
  children?: ReactNode;
}

/** The inner-page opening: a SectionHeading as the h1, on kraft (Hero.md). */
export function PageIntro({ title, eyebrow, lead, actions, art, children }: PageIntroProps) {
  return (
    <section className={cx("wfb-section", "wfb-section-kraft", "wfb-grain", "wfb-intro", art ? "wfb-intro-with-art" : null)}>
      <div className="wfb-container">
        <div className="wfb-intro-copy">
          <SectionHeading as="h1" title={title} eyebrow={eyebrow} lead={lead} align={art ? "left" : "center"} />
          {actions ? <div className="wfb-row wfb-intro-actions">{actions}</div> : null}
          {children}
        </div>
        {art ? <div className="wfb-intro-art">{art}</div> : null}
      </div>
    </section>
  );
}
