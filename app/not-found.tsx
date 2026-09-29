import { Button, Illustration, SectionHeading } from "@/components/wfb";
import type { Metadata } from "next";
import { Band, SiteShell } from "@/components/site";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <SiteShell>
      <Band ground="kraft" intro className="text-center">
        <Illustration name="carrots" className="mb-5 w-[200px] -rotate-8" />
        <SectionHeading as="h1" eyebrow="Oh, carrots" title="This stall's empty" lead="The page you're after has packed up, or it was never here. Try the front of the market." />
        <div className="wfb-row mt-5 justify-center">
          <Button variant="accent" href="/">Go home</Button>
          <Button variant="outline" href="/vendors">Meet the vendors</Button>
        </div>
      </Band>
    </SiteShell>
  );
}
