import { events, getEvent } from "@/content/events";
import { site } from "@/content/site";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

// iCalendar text: escape , ; \ and newlines, and fold nothing (lines stay short).
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const stamp = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;

const VTIMEZONE = [
  "BEGIN:VTIMEZONE", "TZID:America/Chicago",
  "BEGIN:DAYLIGHT", "TZOFFSETFROM:-0600", "TZOFFSETTO:-0500", "TZNAME:CDT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "END:DAYLIGHT",
  "BEGIN:STANDARD", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0600", "TZNAME:CST", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "END:STANDARD",
  "END:VTIMEZONE",
];

export async function GET(_request: Request, { params }: RouteContext<"/events/[slug]/calendar.ics">) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (!e) return new Response("Not found", { status: 404 });

  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Whitefish Bay Farmers Market//Events//EN", "CALSCALE:GREGORIAN",
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${e.slug}@${new URL(site.url).host}`,
    `DTSTAMP:${stamp(e.date, e.start)}Z`,
    `DTSTART;TZID=America/Chicago:${stamp(e.date, e.start)}`,
    `DTEND;TZID=America/Chicago:${stamp(e.date, e.end)}`,
    `SUMMARY:${esc(`${e.title} · ${site.name}`)}`,
    `LOCATION:${esc(`${e.location}, ${e.address}`)}`,
    `DESCRIPTION:${esc(e.description)}`,
    `URL:${site.url}/events/${e.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug}.ics"`,
    },
  });
}
