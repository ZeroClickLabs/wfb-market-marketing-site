import type { Category, IconName, IllustrationName, MarketId } from "@/components/wfb";
import type { ReactNode } from "react";

export interface Vendor {
  slug: string;
  name: string;
  categories: Category[];
  illustration: IllustrationName;
  /** One sentence naming real products. */
  description: string;
  /** A short paragraph for the vendor's own page. */
  about: string;
  products: string[];
  from: string;
  stall?: number;
  snap?: boolean;
  markets: MarketId[];
}

export interface MarketEvent {
  slug: string;
  /** YYYY-MM-DD */
  date: string;
  market: MarketId;
  title: string;
  /** 24-hour "HH:MM", local time in Whitefish Bay. */
  start: string;
  end: string;
  location: string;
  address: string;
  description: string;
  whatsOn: string[];
  rainOrShine?: boolean;
  /** A dedicated landing page, used instead of /events/[slug]. */
  href?: string;
  /** Replaces the market name above the title on the ticket. */
  eyebrow?: string;
  /** Anything unusual about the day: shown as a Notice under the header. */
  status?: { tone: "info" | "warning" | "danger"; title: string; text: string };
}

export interface Market {
  id: MarketId;
  name: string;
  when: string;
  hours: string;
  where: string;
  note?: string;
  blurb: string;
  href: string;
  /** "planned" until dates and a place are confirmed. */
  status: "planned" | "confirmed";
}

export interface Fact {
  icon: IconName;
  label: string;
  value: ReactNode;
}

export interface QA {
  q: string;
  a: ReactNode;
}
