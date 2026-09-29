"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, CATEGORY_LABELS, Checkbox, Icon, Notice, Tag, TextField, VendorCard, type Category, type VendorCardProps } from "@/components/wfb";

export interface DirectoryVendor {
  card: VendorCardProps;
  categories: Category[];
  acceptsSnap: boolean;
  /** Name, description and products, matched by the search box. */
  searchText: string;
}

function isCategory(v: string | null): v is Category {
  return !!v && v in CATEGORY_LABELS;
}

/** The vendor grid with category, SNAP/EBT and name filters, kept in the URL so views can be shared. */
export function VendorDirectory({ vendors }: { vendors: DirectoryVendor[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [category, setCategory] = useState<Category | null>(isCategory(params.get("category")) ? (params.get("category") as Category) : null);
  const [snap, setSnap] = useState(params.get("snap") === "1");
  const [query, setQuery] = useState(params.get("q") ?? "");

  const sync = (next: { category?: Category | null; snap?: boolean; q?: string }) => {
    const c = next.category !== undefined ? next.category : category;
    const s = next.snap ?? snap;
    const q = next.q ?? query;
    const sp = new URLSearchParams();
    if (c) sp.set("category", c);
    if (s) sp.set("snap", "1");
    if (q.trim()) sp.set("q", q.trim());
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const categories = useMemo(() => {
    const present = new Set(vendors.flatMap((v) => v.categories));
    return (Object.keys(CATEGORY_LABELS) as Category[]).filter((c) => present.has(c));
  }, [vendors]);

  const shown = vendors.filter((v) => {
    if (category && !v.categories.includes(category)) return false;
    if (snap && !v.acceptsSnap) return false;
    const q = query.trim().toLowerCase();
    if (q && !v.searchText.toLowerCase().includes(q)) return false;
    return true;
  });

  const clear = () => {
    setCategory(null);
    setSnap(false);
    setQuery("");
    router.replace(pathname, { scroll: false });
  };

  const pick = (c: Category | null) => {
    setCategory(c);
    sync({ category: c });
  };

  return (
    <div className="wfb-directory">
      <div className="wfb-filters">
        <div className="wfb-filter-group" role="group" aria-label="Filter by category">
          <button type="button" className="wfb-filter" aria-pressed={category === null} onClick={() => pick(null)}>
            <Tag>{category === null ? <Icon name="check-circle" size={14} /> : null}All</Tag>
          </button>
          {categories.map((c) => (
            <button key={c} type="button" className="wfb-filter" aria-pressed={category === c} onClick={() => pick(category === c ? null : c)}>
              <Tag category={c}>{category === c ? <Icon name="check-circle" size={14} /> : null}{CATEGORY_LABELS[c]}</Tag>
            </button>
          ))}
        </div>
        <div className="wfb-filter-row">
          <TextField
            className="wfb-filter-search"
            label="Search vendors"
            hint="By name or product, like “honey”"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              sync({ q: e.target.value });
            }}
          />
          <Checkbox
            label="Takes SNAP/EBT"
            checked={snap}
            onChange={(e) => {
              setSnap(e.target.checked);
              sync({ snap: e.target.checked });
            }}
          />
        </div>
      </div>

      <p className="wfb-directory-count" aria-live="polite">
        Showing {shown.length} of {vendors.length} vendors
      </p>

      {shown.length ? (
        <div className="wfb-grid">
          {shown.map((v) => <VendorCard key={v.card.name} {...v.card} />)}
        </div>
      ) : (
        <Notice
          tone="info"
          title="No vendors match those filters."
          action={<Button variant="outline" size="sm" onClick={clear}>Clear filters</Button>}
        >
          Try another category, or clear the search.
        </Notice>
      )}
    </div>
  );
}
