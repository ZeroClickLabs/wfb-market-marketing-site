"use client";

import { useSyncExternalStore } from "react";
import { cx } from "@/components/wfb/utils";

// Days, hours, minutes and seconds, ticking once a second. The seconds box is hidden for people
// who ask their device to reduce motion (see argo.css). Screen readers get one sentence that
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
  className?: string;
}

export function Countdown({ start, end, fallback, untilLabel, className }: CountdownProps) {
  const now = useSyncExternalStore(subscribe, secondNow, serverNow);
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);

  if (now === null) {
    return <p className={cx("argo-countdown", "argo-countdown-static", className)}>{fallback}</p>;
  }

  const t = now * SECOND;
  if (t >= endMs) return null;
  if (t >= startMs) {
    return <p className={cx("argo-countdown", "argo-countdown-live", className)}>Happening now · {untilLabel}</p>;
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
    { n: seconds, label: seconds === 1 ? "Second" : "Seconds", pad: 2, className: "argo-countdown-sec" },
  ];

  return (
    <div className={cx("argo-countdown", className)} role="timer" aria-live="off">
      <p className="wfb-sr">Starts in {plural(Math.floor(spokenMins / 1440), "day")}, {plural(Math.floor((spokenMins % 1440) / 60), "hour")} and {plural(spokenMins % 60, "minute")}.</p>
      <ol className="argo-countdown-units" aria-hidden="true">
        {units.map((u) => (
          <li key={u.label.replace(/s$/, "")} className={u.className}>
            <b>{String(u.n).padStart(u.pad, "0")}</b>
            <span>{u.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
