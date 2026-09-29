import type { Metadata } from "next";
import { SectionHeading } from "@/components/wfb";
import { Band, CardGrid, Edge, InfoCard, PageIntro, SiteShell, StubForm } from "@/components/site";
import { contactFields } from "@/content/get-involved";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email the Whitefish Bay Farmers Market, write to us, or find the volunteers at the info tent on market day.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <PageIntro eyebrow="Say hello" title="Contact us" lead="We're volunteers, so we answer within a week. At Christmas at The Argo, find us at the welcome table by the door." />
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <h2 className="wfb-sr">Ways to reach us</h2>
        <CardGrid min={240}>
          <InfoCard icon="mail" title="Email" action={<a className="wfb-btn wfb-btn-link" href={`mailto:${site.email}`}>{site.email}</a>}>For anything at all.</InfoCard>
          <InfoCard icon="tent" title="In person">At Christmas at The Argo on December 13, and at the info tent every Saturday from summer 2027.</InfoCard>
          <InfoCard icon="map-pin" title="Post">{site.mailingAddress.map((l) => <span key={l} style={{ display: "block" }}>{l}</span>)}</InfoCard>
          <InfoCard icon="instagram" title="Instagram" action={<a className="wfb-btn wfb-btn-link" href={site.social.instagram}>Follow the Market</a>}>Maker announcements for Christmas at The Argo, and news as we get ready for 2027.</InfoCard>
        </CardGrid>
      </Band>
      <Edge from="canvas" to="kraft" />
      <Band ground="kraft" id="message">
        <SectionHeading eyebrow="Drop us a line" title="Send a message" />
        <StubForm title="Contact form" fields={contactFields} submitLabel="Send message" emailSubject="A note for the market" />
      </Band>
    </SiteShell>
  );
}
