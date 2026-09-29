// Dates and times in the brand's style: "Saturday, June 6 · 8 am–1 pm".

export const MARKET_TIME_ZONE = "America/Chicago";

/** Today's date in Whitefish Bay as YYYY-MM-DD. */
export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MARKET_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function asUTC(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** "Saturday, October 17" (adds the year when it isn't the current one). */
export function formatDate(date: string, { year }: { year?: boolean } = {}) {
  const showYear = year ?? date.slice(0, 4) !== todayISO().slice(0, 4);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", ...(showYear ? { year: "numeric" } : {}) }).format(asUTC(date));
}

function clock(t: string) {
  const [h, m] = t.split(":").map(Number);
  return { text: m ? `${h % 12 || 12}:${String(m).padStart(2, "0")}` : `${h % 12 || 12}`, meridiem: h < 12 ? "am" : "pm" };
}

/** "8 am–1 pm", "5–9 pm". */
export function formatTimeRange(start: string, end: string) {
  const a = clock(start), b = clock(end);
  return a.meridiem === b.meridiem ? `${a.text}–${b.text} ${b.meridiem}` : `${a.text} ${a.meridiem}–${b.text} ${b.meridiem}`;
}

/** "2026-12-13" + "13:00" in Whitefish Bay → "2026-12-13T13:00:00-06:00" (daylight saving included). */
export function toMarketISO(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  // The offset at noon UTC that day is the offset for the whole market day.
  const name = new Intl.DateTimeFormat("en-US", { timeZone: MARKET_TIME_ZONE, timeZoneName: "shortOffset" })
    .formatToParts(new Date(Date.UTC(y, m - 1, d, 12)))
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT-6";
  const [, sign = "-", oh = "6", om = "00"] = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/) ?? [];
  const pad = (n: number | string) => String(n).padStart(2, "0");
  return `${date}T${pad(hh)}:${pad(mm)}:00${sign}${pad(oh)}:${pad(om)}`;
}

/** True once the date has passed in Whitefish Bay (the event day itself is not past). */
export function isPast(date: string, today = todayISO()) {
  return date < today;
}

/** True from `from` through `until`, inclusive. */
export function inWindow(from: string, until: string, today = todayISO()) {
  return today >= from && today <= until;
}

export function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
