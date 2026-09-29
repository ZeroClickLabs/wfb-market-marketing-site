import { Button, Illustration, SectionHeading } from "@/components/wfb";
import type { Metadata } from "next";
import { Band, SiteShell } from "@/components/site";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <SiteShell>
      <Band ground="kraft" className="wfb-intro wfb-lost">
        <Illustration name="carrots" />
        <SectionHeading as="h1" eyebrow="Oh, carrots" title="This stall's empty" lead="The page you're after has packed up, or it was never here. Try the front of the market." />
        <div className="wfb-row wfb-intro-actions">
          <Button variant="accent" href="/">Go home</Button>
          <Button variant="outline" href="/vendors">Meet the vendors</Button>
        </div>
      </Band>
    </SiteShell>
  );
}
