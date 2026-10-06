import type { Metadata } from "next";
import { Band, Edge, PageIntro, Prose, SiteShell, UpdatedNote } from "@/components/site";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What the Whitefish Bay Farmers Market collects, why, and how to ask us to delete it.",
};

// PLACEHOLDER: board to review before launch, and update once a newsletter and form provider are chosen.

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PageIntro eyebrow="Plainly put" title="Privacy" lead="We collect as little as we can, we never sell it, and we'll delete it if you ask." />
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <Prose>
          <h2>What we collect</h2>
          <ul>
            <li><strong>The Market Letter:</strong> your email address, so we can send the newsletter on the first Friday of each month.</li>
            <li><strong>Forms:</strong> what you type into the volunteer, vendor, sponsor and contact forms, so we can reply.</li>
            <li><strong>This website:</strong> we use <a href="https://policies.google.com/privacy">Google Analytics</a> to count visits and see which pages people find useful. It sets cookies and records things like the pages you view, roughly where you are (to the city) and the kind of device you use. We&rsquo;ve turned off its advertising features, and if your browser sends a Global Privacy Control signal, we don&rsquo;t load it at all. Fonts are served from our own site, not from a third party.</li>
          </ul>
          <h2>What we do with it</h2>
          <p>Volunteers on the Market&rsquo;s board read it to answer you and run the market. We don&rsquo;t sell or share it. The Market Letter is sent with <a href="https://www.beehiiv.com/privacy">beehiiv</a>, which stores subscribers&rsquo; email addresses for us and only uses them to deliver the newsletter.</p>
          <h2>SNAP/EBT at the market</h2>
          <p>When we start accepting EBT in 2027, the card reader at the info tent will handle the payment. We won&rsquo;t write down names or card numbers, and we&rsquo;ll only keep totals so we can report how much Market Match was spent.</p>
          <h2>Your choices</h2>
          <p>Every Market Letter has an unsubscribe link. To see or delete anything we hold about you, email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
          <UpdatedNote>{site.legalName} · Last updated September 2026.</UpdatedNote>
        </Prose>
      </Band>
    </SiteShell>
  );
}
