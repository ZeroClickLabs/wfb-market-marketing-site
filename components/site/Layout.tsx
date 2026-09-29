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
  className?: string;
}

/** Announcement → header → notice → page → newsletter → footer, on every page. */
export function SiteShell({ children, section, theme = "light", announcement = site.announcement, newsletter = true, footerAbove = "canvas", notice, className }: SiteShellProps) {
  const links = site.nav.map((l) => ({ label: l.label, href: l.href, current: l.key === section }));
  const bar = announcement && !(announcement.until && isPast(announcement.until)) ? announcement : null;
  return (
    <div className={cx("wfb", theme === "dark" && "min-h-screen bg-canvas text-ink", className)} data-theme={theme === "dark" ? "dark" : undefined}>
      {bar ? (
        <AnnouncementBar label={bar.label} href={bar.href} linkText={bar.linkText}>{bar.text}</AnnouncementBar>
      ) : null}
      <SiteHeader links={links} />
      <main id="main">
        {notice ? (
          // The rule under the notice separates it from the page intro below.
          <div className="border-b-2 border-ink bg-canvas pt-[76px] pb-5"><div className="wfb-container">{notice}</div></div>
        ) : null}
        {children}
        {newsletter ? <NewsletterBand /> : null}
      </main>
      <SiteFooter above={newsletter ? "sage" : footerAbove} />
    </div>
  );
}

export type Ground = "kraft" | "deep" | "canvas" | "sage";

// Page intros sit lower (clear of the header badge) and set a smaller h1 on phones.
const INTRO_SPACING = "pt-8 pb-7 [&_.wfb-heading]:mb-0 max-tablet:[&_.wfb-heading-title]:text-[44px] max-tablet:[&_.wfb-heading-title]:leading-[44px]";

// wfb-section / wfb-section-kraft / wfb-grain / wfb-on-deep are the kit's own ground classes.
const GROUND_CLASS: Record<Ground, string> = {
  kraft: "wfb-section-kraft wfb-grain",
  deep: "wfb-section-deep wfb-on-deep [&_a:not(.wfb-btn,.wfb-circle,.wfb-card-link)]:text-on-deep [&_a:not(.wfb-btn,.wfb-circle,.wfb-card-link)]:decoration-corn [&_a:not(.wfb-btn,.wfb-circle,.wfb-card-link)]:underline-offset-4 [&_a:not(.wfb-btn,.wfb-circle,.wfb-card-link):hover]:text-corn",
  canvas: "wfb-grain",
  sage: "wfb-grain bg-sage text-ink",
};

export interface BandProps {
  ground?: Ground;
  /** Opens a page, with the page intro's spacing (the 404 page uses this). */
  intro?: boolean;
  id?: string;
  className?: string;
  children: ReactNode;
}

/** A page section on one of the brand grounds. Change grounds between bands with <Edge>. */
export function Band({ ground = "canvas", intro, id, className, children }: BandProps) {
  return (
    <section id={id} className={cx("wfb-section [&_.wfb-heading:last-child]:mb-0", intro ? INTRO_SPACING : "pt-7", GROUND_CLASS[ground], className)}>
      <div className="wfb-container">{children}</div>
    </section>
  );
}

/** The lake wave between two grounds. Deep always owns the wave shape, as on the home page. */
export function Edge({ from, to }: { from: Ground; to: Ground }) {
  if (from === "deep") return <SectionEdge kind="wave" tone="deep" ground={to} flip />;
  return <SectionEdge kind="wave" tone={to} ground={from} />;
}

/** A centred row of buttons after a section's content. */
export function ButtonRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("wfb-row mt-10 justify-center", className)}>{children}</div>;
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
    <section className={cx("wfb-section wfb-section-kraft wfb-grain", INTRO_SPACING)}>
      <div className={cx("wfb-container", art ? "grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-7 max-desktop:grid-cols-[minmax(0,1fr)] max-desktop:gap-6" : null)}>
        <div className="[&>dl]:mt-5">
          <SectionHeading as="h1" title={title} eyebrow={eyebrow} lead={lead} align={art ? "left" : "center"} />
          {actions ? <div className={cx("wfb-row mt-5", art ? "justify-start" : "justify-center")}>{actions}</div> : null}
          {children}
        </div>
        {art ? (
          <div className="flex justify-center max-desktop:order-2 [&_.wfb-illo]:w-[min(320px,100%)] [&_.wfb-logo]:max-w-full [&_.wfb-logo_img]:drop-shadow-[4px_4px_0_rgba(26,34,38,.9)]">
            {art}
          </div>
        ) : null}
      </div>
    </section>
  );
}
