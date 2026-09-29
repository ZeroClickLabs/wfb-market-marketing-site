import type { Metadata } from "next";
import Link from "next/link";
import { Band, Edge, PageIntro, Prose, SiteShell } from "@/components/site";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "How the Whitefish Bay Farmers Market makes its website and its market days work for everyone.",
};

// PLACEHOLDER: board to review before launch.

export default function AccessibilityPage() {
  return (
    <SiteShell>
      <PageIntro eyebrow="For everyone" title="Accessibility" lead="The Market serves everyone in the village. This is what we do to make the site and the market work for you, and how to tell us when they don't." />
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <Prose>
          <h2>This website</h2>
          <p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. In practice, that means:</p>
          <ul>
            <li>Text has a contrast of at least 4.5:1 against its background, in both the light theme and the Night Market theme.</li>
            <li>Everything works with a keyboard, and the focus ring is always visible.</li>
            <li>Buttons and links are at least 44 pixels tall so they&rsquo;re easy to tap.</li>
            <li>Every form field has a visible label, and error messages say how to fix the problem.</li>
            <li>Status is always written in words, never shown by colour alone.</li>
            <li>Nothing moves if you&rsquo;ve asked your device to reduce motion.</li>
            <li>Decorative illustrations are hidden from screen readers; dates and times are always written out in text.</li>
          </ul>
          <h2>At our markets</h2>
          <p>When the Summer Market opens in 2027, we plan to have:</p>
          <ul>
            <li>Accessible parking at the entrance, and a smooth, level path between the stalls.</li>
            <li>Seating near the music, and an accessible restroom by the parking lot.</li>
            <li>SNAP/EBT at the info tent, with no questions asked. See <Link href="/food-access">food access</Link>.</li>
            <li>Christmas at The Argo is indoors; contact us before the day with any access needs and we&rsquo;ll help.</li>
            <li>Volunteers at the info tent can fetch things from a stall for you.</li>
          </ul>
          <h2>Tell us what isn&rsquo;t working</h2>
          <p>If something on this site or at the market gets in your way, email <a href={`mailto:${site.email}`}>{site.email}</a> or find us at the info tent. We&rsquo;ll reply within a week and tell you what we&rsquo;ll do about it.</p>
          <p className="wfb-updated">Last reviewed September 2026.</p>
        </Prose>
      </Band>
    </SiteShell>
  );
}
