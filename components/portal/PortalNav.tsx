"use client";

import { useEffect, useRef } from "react";
import { SmartLink, cx } from "@/components/wfb/utils";
import type { PortalNavItem } from "./PortalShell";

/** The portal's tabs. On phones they scroll sideways, so the current one is scrolled into view. */
export function PortalNav({ items, current, ownRow }: { items: PortalNavItem[]; current?: string; ownRow?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = ref.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current=page]");
    if (nav && active) nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [current]);
  return (
    <nav ref={ref} aria-label="Portal" className={cx("-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] max-[1023px]:order-last max-[1023px]:w-full", ownRow && "order-last w-full")}>
      {items.map((item) => (
        <SmartLink
          key={item.href}
          href={item.href}
          aria-current={current === item.href ? "page" : undefined}
          className={cx(
            "inline-flex min-h-[44px] flex-none items-center whitespace-nowrap rounded-pill px-3.5 font-sans text-[13px] font-extrabold uppercase tracking-[.12em] text-ink no-underline hover:bg-kraft",
            current === item.href && "bg-kraft text-bay",
          )}
        >
          {item.label}
        </SmartLink>
      ))}
    </nav>
  );
}
