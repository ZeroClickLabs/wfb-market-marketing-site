import type { ReactNode } from "react";
import { Button } from "./Button";
import { SectionEdge } from "./Decor";
import { Icon, type IconName } from "./Icon";
import { Illustration, Logo, type IllustrationName } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NewsletterForm } from "./NewsletterForm";
import { cx, SmartLink, type Tone } from "./utils";
import { site } from "@/content/site";

export interface AnnouncementBarProps {
  children: ReactNode;
  label?: string;
  href?: string;
  linkText?: string;
  className?: string;
}

export function AnnouncementBar({ children, label, href, linkText, className }: AnnouncementBarProps) {
  return (
    <div className={cx("wfb-announce", className)} role="region" aria-label="Announcement">
      {label ? <b>{label}</b> : null}
      {children}
      {href ? <> <SmartLink href={href}>{linkText ?? "See details"}</SmartLink></> : null}
    </div>
  );
}

export interface NavLink {
  label: string;
  href?: string;
  current?: boolean;
}

export interface SiteHeaderProps {
  links?: NavLink[];
  cta?: { label: string; href?: string; icon?: IconName } | null;
  status?: string;
  homeHref?: string;
  className?: string;
}

export function SiteHeader({ links = site.nav, cta = site.headerCta, status = site.status, homeHref = "/", className }: SiteHeaderProps) {
  const navLinks = (
    <>
      {links.map((l) => (
        <SmartLink key={l.label} href={l.href ?? "#"} aria-current={l.current ? "page" : undefined}>{l.label}</SmartLink>
      ))}
    </>
  );
  return (
    <div className={cx("wfb", className)}>
      <div className="wfb-utility">
        <div className="wfb-container">
          <span className="wfb-utility-open"><span className="wfb-utility-dot" aria-hidden="true" />{status}</span>
          <span className="wfb-utility-links">
            <SmartLink href="/food-access"><Icon name="card" size={16} />SNAP/EBT welcome</SmartLink>
            <SmartLink href="/events"><Icon name="calendar" size={16} />Market calendar</SmartLink>
            <a className="wfb-utility-icon" href={site.social.instagram} aria-label="Instagram"><Icon name="instagram" size={18} /></a>
            <a className="wfb-utility-icon" href={site.social.facebook} aria-label="Facebook"><Icon name="facebook" size={18} /></a>
          </span>
        </div>
      </div>
      <header className="wfb-header">
        <div className="wfb-container">
          <SmartLink className="wfb-header-logo" href={homeHref} aria-label="Whitefish Bay Farmers Market, home">
            <Logo variant="badge" width={128} label="" />
          </SmartLink>
          <nav className="wfb-nav" aria-label="Main">{navLinks}</nav>
          {cta ? <Button className="wfb-header-cta" href={cta.href ?? "#"} variant="primary" icon={cta.icon}>{cta.label}</Button> : null}
          <MobileMenu>
            <nav className="wfb-menu-nav" aria-label="Main">{navLinks}</nav>
            {cta ? <Button href={cta.href ?? "#"} variant="primary" icon={cta.icon}>{cta.label}</Button> : null}
          </MobileMenu>
        </div>
      </header>
    </div>
  );
}

export function NewsletterBand({ title, text, illustration = "sunflower", className }: { title?: string; text?: string; illustration?: IllustrationName; className?: string }) {
  return (
    <section className={cx("wfb", "wfb-news", "wfb-grain", className)} aria-label="Newsletter">
      <div className="wfb-container">
        <div className="wfb-news-art"><Illustration name={illustration} /></div>
        <div>
          <h2 className="wfb-news-title">{title ?? "The Market Letter"}</h2>
          <p>{text ?? "What's in season, who's at the market and what's coming up — the first Friday of every month."}</p>
        </div>
        <NewsletterForm />
      </div>
    </section>
  );
}

export function SiteFooter({ year = new Date().getFullYear(), above = "sage", className }: { year?: number; /** Tone of the section above, shown behind the wave. */ above?: Tone; className?: string }) {
  return (
    <footer className={cx("wfb", "wfb-footer", className)}>
      <SectionEdge kind="wave" tone="deep" ground={above} />
      <div className="wfb-container">
        <div className="wfb-footer-top">
          <div className="wfb-footer-logo"><Logo variant="emblem" width={180} /></div>
          <div>
            <h2 className="wfb-footer-h">Visit</h2>
            <p>Saturdays, June–September<br />8 am–1 pm · rain or shine<br />Whitefish Bay, Wisconsin</p>
            <p className="wfb-footer-script">See you by the lake</p>
          </div>
          <div>
            <h2 className="wfb-footer-h">Explore</h2>
            <ul>
              {site.footerExplore.map((l) => <li key={l.label}><SmartLink href={l.href}>{l.label}</SmartLink></li>)}
            </ul>
          </div>
          <div>
            <h2 className="wfb-footer-h">Say hello</h2>
            <ul>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><SmartLink href="/get-involved/sell">Apply to sell</SmartLink></li>
            </ul>
            <div className="wfb-social">
              <a href={site.social.instagram} aria-label="Instagram"><Icon name="instagram" size={18} /></a>
              <a href={site.social.facebook} aria-label="Facebook"><Icon name="facebook" size={18} /></a>
              <a href={`mailto:${site.email}`} aria-label="Email"><Icon name="mail" size={18} /></a>
            </div>
          </div>
        </div>
        <div className="wfb-footer-legal">
          <span>© {year} Whitefish Bay Farmers Market Corp · a non-profit organization</span>
          <span><SmartLink href="/privacy">Privacy</SmartLink> · <SmartLink href="/accessibility">Accessibility</SmartLink></span>
        </div>
      </div>
    </footer>
  );
}
