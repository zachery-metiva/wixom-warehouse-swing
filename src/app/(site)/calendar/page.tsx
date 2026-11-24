import type { Metadata } from "next";
import { SubscribeCalendar } from "@/components/site/AddToCalendar";
import { CalendarView } from "@/components/site/CalendarView";
import { MonoLink, PageHeader } from "@/components/ui";
import { getCalendar, getPricing, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Every Tuesday, 7 to 10 PM in Wixom, MI. Two lessons, then the floor is yours.",
};

export default async function CalendarPage() {
  "use cache";
  const [{ today, events }, settings, pricing] = await Promise.all([getCalendar(), getSettings(), getPricing()]);

  return (
    <div className="wrap pt-12 pb-[72px]">
      <PageHeader eyebrow="THE SCHEDULE" lead="Every Tuesday, 7–10 PM. Two lessons, then the floor is yours.">
        CALENDAR
      </PageHeader>

      <div className="mt-9 flex flex-wrap items-start gap-7">
        <div className="min-w-0 flex-[1_1_620px]">
          <CalendarView today={today} events={events} meetupFallback={settings.links.meetup} />
        </div>

        <aside className="flex min-w-[280px] flex-[1_1_300px] flex-col min-[980px]:flex-[0_1_320px] gap-4">
          <div className="border border-line bg-card p-6">
            <div className="font-display text-[26px] text-blue">EVERY TUESDAY</div>
            <div className="mt-3.5 flex flex-col gap-3">
              {settings.schedule.map((s) => (
                <div key={s.label} className="flex items-baseline gap-3.5">
                  <span className="w-[82px] flex-none font-mono text-xs text-blue">{s.time}</span>
                  <span className="text-sm text-white">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-[18px] border-t border-line pt-4 text-[13px] leading-[1.6] text-body">
              ${pricing.door} at the door covers both lessons and the social. No partner needed.
            </div>
          </div>
          <div className="border border-line p-6">
            <div className="font-mono text-[11px] tracking-[2px] text-muted">LOCATION</div>
            <div className="mt-2 text-base font-bold text-white">{settings.locationName}, Wixom, MI</div>
            <div className="mt-1 text-[13px] text-body">{settings.locationNote}</div>
            <MonoLink href="/contact" className="mt-3 inline-block text-xs">
              DIRECTIONS + CONTACT →
            </MonoLink>
          </div>
          <SubscribeCalendar />
        </aside>
      </div>
    </div>
  );
}
