import type { SiteEvent } from "./types";

/** Calendar helpers: iCalendar (.ics) files and Google Calendar links.
 *  Times are local to Wixom (America/Detroit) and carry a TZID so every
 *  calendar app shows them at the right hour. */

export const VENUE = "The Warehouse, Wixom, MI";
const TZID = "America/Detroit";

// US Eastern rules (second Sunday in March / first Sunday in November).
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

export function eventTitle(e: SiteEvent) {
  return `Warehouse Swing: ${e.topic ? `${e.name} (${e.topic})` : e.name}`;
}

export function eventDetails(e: SiteEvent, siteUrl: string) {
  const lines = [
    e.description,
    "7:00 Advanced lesson · 7:30 Beginner lesson · 7:45 Social dance until 10:00.",
    "No partner needed, no experience required.",
    e.teachers ? `Teaching: ${e.teachers}` : "",
    e.meetupUrl ? `RSVP: ${e.meetupUrl}` : "",
    `${siteUrl}/calendar`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** "2026-12-01" + "19:00" -> "20261201T190000" (local wall time) */
function stamp(date: string, time: string) {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
}

function escapeText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Lines over 75 octets must be folded (RFC 5545 §3.1). */
function fold(line: string) {
  const out: string[] = [];
  let cur = "";
  for (const ch of line) {
    if (new TextEncoder().encode(cur + ch).length > 74) {
      out.push(cur);
      cur = " " + ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n");
}

export function buildIcs(events: SiteEvent[], opts: { siteUrl: string; name?: string; nowUtc: string }) {
  const host = new URL(opts.siteUrl).host;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Warehouse Swing//Website//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(opts.name ?? "Warehouse Swing")}`,
    `X-WR-TIMEZONE:${TZID}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...VTIMEZONE,
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      // Stable per date so re-downloads and feed refreshes update instead of duplicating.
      `UID:${e.date}@${host}`,
      `DTSTAMP:${opts.nowUtc}`,
      `DTSTART;TZID=${TZID}:${stamp(e.date, e.start)}`,
      `DTEND;TZID=${TZID}:${stamp(e.date, e.end)}`,
      `SUMMARY:${escapeText(eventTitle(e))}`,
      `DESCRIPTION:${escapeText(eventDetails(e, opts.siteUrl))}`,
      `LOCATION:${escapeText(VENUE)}`,
      `URL:${opts.siteUrl}/calendar`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(e: SiteEvent, siteUrl: string) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(e),
    dates: `${stamp(e.date, e.start)}/${stamp(e.date, e.end)}`,
    ctz: TZID,
    details: eventDetails(e, siteUrl),
    location: VENUE,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** UTC timestamp for DTSTAMP, e.g. 20261124T120000Z */
export function utcStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
