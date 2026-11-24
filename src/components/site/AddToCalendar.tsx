"use client";

import { useSyncExternalStore } from "react";
import { googleCalendarUrl } from "@/lib/ics";
import type { SiteEvent } from "@/lib/types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warehouseswing.com";

/** Small "Add to calendar" menu: Google Calendar, or an .ics file that Apple
 *  Calendar and Outlook open directly. */
export function AddToCalendar({ ev, compact = false }: { ev: SiteEvent; compact?: boolean }) {
  return (
    <details className="group relative inline-block">
      <summary
        className={`cursor-pointer list-none font-mono text-[11px] tracking-[1px] text-blue select-none hover:text-blue-hover [&::-webkit-details-marker]:hidden ${
          compact ? "" : "border border-blue px-3 py-1.5"
        }`}
      >
        + ADD TO CALENDAR
      </summary>
      <div className={`absolute z-20 mt-2 ${compact ? "left-0" : "right-0"} flex min-w-[200px] flex-col border border-line-strong bg-card`}>
        <a
          href={googleCalendarUrl(ev, SITE)}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-line px-4 py-3 text-sm text-white hover:bg-blue/10 hover:text-blue"
        >
          Google Calendar ↗
        </a>
        <a href={`/event.ics?date=${ev.date}`} className="px-4 py-3 text-sm text-white hover:bg-blue/10 hover:text-blue">
          Apple / Outlook (.ics) ↓
        </a>
      </div>
    </details>
  );
}

/** Subscribe to every Tuesday at once; the calendar app keeps it up to date. */
export function SubscribeCalendar() {
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => SITE,
  );
  const host = origin.replace(/^https?:\/\//, "");
  const webcal = `webcal://${host}/calendar.ics`;
  const google = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
  return (
    <div className="border border-line p-6">
      <div className="font-mono text-[11px] tracking-[2px] text-muted">NEVER MISS A TUESDAY</div>
      <p className="mt-2 text-[13px] leading-[1.6] text-body">Subscribe once and every night, topic and change shows up in your calendar.</p>
      <div className="mt-3 flex flex-col gap-2">
        <a href={webcal} className="flex justify-between border border-line-strong px-3.5 py-[11px] text-sm text-white hover:border-blue">
          Apple Calendar / Outlook <span className="text-blue">→</span>
        </a>
        <a
          href={google}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-between border border-line-strong px-3.5 py-[11px] text-sm text-white hover:border-blue"
        >
          Google Calendar <span className="text-blue">↗</span>
        </a>
      </div>
    </div>
  );
}
