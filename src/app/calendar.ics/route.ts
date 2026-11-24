import type { NextRequest } from "next/server";
import { getCalendar } from "@/lib/data";
import { addDays } from "@/lib/dates";
import { buildIcs, utcStamp } from "@/lib/ics";

/** Subscribable feed of every upcoming night (and the last month), for
 *  Apple Calendar, Google Calendar and Outlook. Calendar apps re-fetch it, so
 *  new nights and topic changes show up on their own. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const { today, events } = await getCalendar();
  const from = addDays(today, -31);
  const ics = buildIcs(
    events.filter((e) => e.date >= from),
    { siteUrl: origin, name: "Warehouse Swing", nowUtc: utcStamp(new Date()) },
  );
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="warehouse-swing.ics"',
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
