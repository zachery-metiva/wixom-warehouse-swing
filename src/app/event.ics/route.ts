import type { NextRequest } from "next/server";
import { getCalendar } from "@/lib/data";
import { buildIcs, utcStamp } from "@/lib/ics";

/** One night as a downloadable .ics file: /event.ics?date=2026-12-01 */
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Response("Missing ?date=YYYY-MM-DD", { status: 400 });
  const { events } = await getCalendar();
  const ev = events.find((e) => e.date === date);
  if (!ev) return new Response("No Warehouse Swing night on that date.", { status: 404 });
  const ics = buildIcs([ev], { siteUrl: request.nextUrl.origin, nowUtc: utcStamp(new Date()) });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="warehouse-swing-${date}.ics"`,
      "Cache-Control": "public, max-age=0, s-maxage=600",
    },
  });
}
