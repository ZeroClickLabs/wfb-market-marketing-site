import type { Metadata } from "next";
import { Logo } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { ApplyForm } from "@/components/apply/ApplyForm";
import { site } from "@/content/site";

// The vendor application, for sharing as one short link (an Instagram bio, a flyer). It has its own slim
// frame instead of the full site header, so the form is the first thing on a phone.

const TITLE = "Apply to sell at the Whitefish Bay Farmers Market";
const DESCRIPTION = "Growers, bakers and makers from within 100 miles: applications for the 2027 season are open. It takes about five minutes.";

export const metadata: Metadata = {
  title: "Apply to sell",
  description: DESCRIPTION,
  alternates: { canonical: "/apply" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/apply", type: "website" },
};

const FACTS = [
  "Producer-only: you grow it, raise it, bake it or make it.",
  "Farms and kitchens within 100 miles of Whitefish Bay.",
  "Every vendor accepts market tokens.",
];

export default function ApplyPage() {
  const instagram = site.social.instagram !== "#" ? site.social.instagram : undefined;
  return (
    <div className="wfb flex min-h-screen flex-col bg-kraft font-sans text-ink">
      <header className="border-0 border-b-2 border-solid border-ink bg-paper">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4 px-5 py-3 max-tablet:px-4">
          <Logo variant="lockup" width={150} href="/" />
          <a href={`mailto:${site.email}?subject=${encodeURIComponent("Question about applying")}`} className="tap-target brand-link font-sans text-[15px] font-bold">Questions? Email us</a>
        </div>
      </header>

      <main id="main" className="mx-auto box-border w-full max-w-[760px] flex-1 px-5 pt-6 pb-8 max-tablet:px-4 max-tablet:pt-5">
        <p className="m-0 font-script text-[28px] leading-[34px] text-heirloom-text">Grow it, bake it, make it</p>
        <h1 className="mt-1 mb-2 font-display text-[56px] leading-[56px] font-normal uppercase max-tablet:text-[46px] max-tablet:leading-[46px]">Apply to sell</h1>
        <p className="mt-0 mb-3 max-w-(--prose-max) text-[18px] leading-[28px]">Applications for the 2027 season are open. It takes about five minutes, and you can come back to it on this phone or computer.</p>
        <ul className="mt-0 mb-6 grid gap-1 pl-5 text-[16px] leading-[25px]">
          {FACTS.map((f) => <li key={f}>{f}</li>)}
        </ul>

        <div className="box-border rounded-lg border-3 border-solid border-ink bg-paper p-6 shadow-print max-tablet:px-4 max-tablet:py-5">
          <ApplyForm instagramHref={instagram} />
        </div>
      </main>

      <footer className="border-0 border-t-2 border-solid border-ink bg-paper">
        <div className="mx-auto flex w-full max-w-[760px] flex-wrap items-center justify-between gap-x-5 gap-y-1 px-5 py-4 text-[14px] leading-[20px] text-ink-muted max-tablet:px-4">
          <span>{site.name}</span>
          <span className="flex gap-4">
            <SmartLink href="/" className="tap-target brand-link">Home</SmartLink>
            <SmartLink href="/privacy" className="tap-target brand-link">Privacy</SmartLink>
          </span>
        </div>
      </footer>
    </div>
  );
}
