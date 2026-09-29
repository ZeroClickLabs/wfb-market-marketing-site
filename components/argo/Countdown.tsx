"use client";

import { useSyncExternalStore } from "react";
import { cx } from "@/components/wfb/utils";

// Days, hours, minutes and seconds, ticking once a second. The seconds box is hidden for people
// who ask their device to reduce motion. Screen readers get one sentence that
// changes only by the minute and is never announced on its own.
// The server (and the first paint) shows a static line instead, which avoids a hydration
// mismatch and still reads correctly without JavaScript.

const SECOND = 1_000;
const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 250);
  return () => clearInterval(id);
}
const secondNow = () => Math.floor(Date.now() / SECOND);
const serverNow = () => null;

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export interface CountdownProps {
  /** ISO timestamps with offset, e.g. "2026-12-13T13:00:00-06:00". */
  start: string;
  end: string;
  /** Shown before the clock starts and when JavaScript is off, e.g. "Sunday, December 13 · 1–6 pm". */
  fallback: string;
  /** Shown while the event is on, e.g. "until 6 pm". */
  untilLabel: string;
  /** "hero" centres it; "promo" aligns it left on wide screens, as in the home page feature. */
  placement?: "hero" | "promo";
}

// min-height reserves the clock's space so nothing shifts when it replaces the fallback line.
const WRAP = {
  hero: "mx-auto mt-5 mb-0 flex min-h-[86px] flex-col items-center justify-center",
  promo: "mx-0 mt-4 mb-0 flex min-h-[86px] flex-col items-start justify-center max-tablet:items-center",
};
const LINE = "font-argo text-[16px] leading-[22px] font-bold uppercase tracking-[.2em] text-argo-gold";

export function Countdown({ start, end, fallback, untilLabel, placement = "hero" }: CountdownProps) {
  const now = useSyncExternalStore(subscribe, secondNow, serverNow);
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);

  if (now === null) {
    return <p className={cx(WRAP[placement], LINE)}>{fallback}</p>;
  }

  const t = now * SECOND;
  if (t >= endMs) return null;
  if (t >= startMs) {
    return <p className={cx(WRAP[placement], LINE)}>Happening now · {untilLabel}</p>;
  }

  const secs = Math.max(0, Math.ceil((startMs - t) / SECOND));
  const days = Math.floor(secs / 86_400);
  const hours = Math.floor((secs % 86_400) / 3_600);
  const minutes = Math.floor((secs % 3_600) / 60);
  const seconds = secs % 60;
  // The spoken sentence rounds up to the minute so it isn't rewritten every second.
  const spokenMins = Math.ceil((startMs - t) / MINUTE);
  const units = [
    { n: days, label: days === 1 ? "Day" : "Days", pad: 1 },
    { n: hours, label: hours === 1 ? "Hour" : "Hours", pad: 2 },
    { n: minutes, label: minutes === 1 ? "Minute" : "Minutes", pad: 2 },
    // A ticking seconds box is constant motion: hidden for people who ask for reduced motion.
    { n: seconds, label: seconds === 1 ? "Second" : "Seconds", pad: 2, className: "motion-reduce:hidden" },
  ];

  return (
    <div className={WRAP[placement]} role="timer" aria-live="off">
      <p className="sr-only">Starts in {plural(Math.floor(spokenMins / 1440), "day")}, {plural(Math.floor((spokenMins % 1440) / 60), "hour")} and {plural(spokenMins % 60, "minute")}.</p>
      <ol className="m-0 flex list-none gap-2.5 p-0 max-tablet:gap-1.5" aria-hidden="true">
        {units.map((u) => (
          <li
            key={u.label.replace(/s$/, "")}
            className={cx(
              "flex min-w-[86px] flex-col items-center rounded-[12px] border-2 border-argo-gold bg-[rgba(42,21,18,.35)] px-2 pt-2.5 pb-[9px]",
              "max-tablet:min-w-[62px] max-tablet:px-1 max-tablet:pt-2 max-tablet:pb-[7px]",
              u.className,
            )}
          >
            <b className="font-argo text-[40px] leading-none font-bold text-argo-gold tabular-nums lining-nums max-tablet:text-[28px]">{String(u.n).padStart(u.pad, "0")}</b>
            <span className="mt-[5px] font-sans text-[11px] leading-[14px] font-extrabold uppercase tracking-[.16em] text-argo-cream max-tablet:text-[10px] max-tablet:tracking-[.1em]">{u.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
