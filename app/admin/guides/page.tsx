import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/wfb";
import { SmartLink } from "@/components/wfb/utils";
import { ADMIN_NAV, PortalFrame } from "@/components/portal/PortalShell";
import { EmptyState, Flash, PageHeader, Panel } from "@/components/portal/ui";
import { excerpt } from "@/components/portal/Markdown";
import { listAllMarkets, listGuides } from "@/lib/portal/data";

export const metadata = { title: "Guides" };

export default async function GuidesPage({ searchParams }: PageProps<"/admin/guides">) {
  const user = await requireAdmin();
  const [guides, markets, sp] = await Promise.all([listGuides(), listAllMarkets(), searchParams]);
  const groups = [{ id: null as string | null, name: "Every market" }, ...markets.map((m) => ({ id: m.id as string | null, name: m.name }))]
    .map((g) => ({ ...g, guides: guides.filter((x) => x.marketId === g.id) }));
  return (
    <PortalFrame user={user} nav={ADMIN_NAV} current="/admin/guides">
      <PageHeader eyebrow="How it works" title="Guides" lead="Setup, teardown and house rules. Vendors see them on each date's page.">
        <Button href="/admin/guides/new" variant="accent" icon="tent">New guide</Button>
      </PageHeader>
      <Flash done={sp.done} />
      <div className="grid max-w-[900px] gap-5">
        {groups.map((g) => (
          <Panel key={g.name} title={g.name}>
            {g.guides.length ? (
              <ul className="m-0 grid list-none gap-2 p-0">
                {g.guides.map((x) => (
                  <li key={x.id}>
                    <SmartLink href={`/admin/guides/${x.id}`} className="block rounded-md border-2 border-ink bg-canvas px-4 py-3 text-ink no-underline hover:bg-kraft">
                      <span className="block font-sans text-[17px] font-extrabold">{x.title}</span>
                      <span className="block font-sans text-[14px] leading-[20px] text-ink-muted">{excerpt(x.body, 140)}</span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No guides here" />
            )}
          </Panel>
        ))}
      </div>
    </PortalFrame>
  );
}
