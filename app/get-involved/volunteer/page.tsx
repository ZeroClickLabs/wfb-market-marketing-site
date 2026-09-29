import type { Metadata } from "next";
import { Badge, Icon, SectionHeading } from "@/components/wfb";
import { Band, CardGrid, Edge, InfoCard, PageIntro, SiteShell, StubForm } from "@/components/site";
import { argoJobs, volunteerFields, volunteerJobs } from "@/content/get-involved";

export const metadata: Metadata = {
  title: "Volunteer",
  description: "Help run Christmas at The Argo on December 13, and the Summer Market from 2027.",
};

export default function VolunteerPage() {
  return (
    <SiteShell section="get-involved">
      <PageIntro eyebrow="Two hours helps" title="Volunteer" lead="We're a brand-new, volunteer-run market. Help us put on Christmas at The Argo this December, and the Summer Market from 2027. No experience needed." />
      <Edge from="kraft" to="canvas" />
      <Band ground="canvas">
        <SectionHeading eyebrow="Sunday, December 13" title="Christmas at The Argo" lead="Christmas at The Argo needs a warm welcome. These jobs are planned; we'll confirm shift times in November." />
        <div className="wfb-row mb-5 justify-center"><Badge tone="info" icon="calendar">Planned</Badge></div>
        <CardGrid>
          {argoJobs.map((j) => (
            <InfoCard key={j.title} icon={j.icon} title={j.title} meta={<span><Icon name="clock" size={16} />{j.time}</span>}>{j.text}</InfoCard>
          ))}
        </CardGrid>
      </Band>
      <Edge from="canvas" to="deep" />
      <Band ground="deep">
        <SectionHeading eyebrow="From June 2027" title="At the Summer Market" />
        <CardGrid>
          {volunteerJobs.map((j) => (
            <InfoCard key={j.title} icon={j.icon} title={j.title} meta={<span><Icon name="clock" size={16} />{j.time}</span>}>{j.text}</InfoCard>
          ))}
        </CardGrid>
      </Band>
      <Edge from="deep" to="kraft" />
      <Band ground="kraft" id="sign-up">
        <SectionHeading eyebrow="Count me in" title="Sign up" lead="Tell us what you'd like to do and we'll send the schedule." />
        <StubForm title="Volunteer sign-up" fields={volunteerFields} submitLabel="Sign me up" emailSubject="Volunteering at the market" />
      </Band>
    </SiteShell>
  );
}
