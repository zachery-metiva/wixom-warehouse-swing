import Link from "next/link";
import { shortLabel } from "@/lib/dates";
import type { SiteEvent } from "@/lib/types";
import { AddToCalendar } from "./AddToCalendar";

export function EventRow({ ev, today }: { ev: SiteEvent; today: string }) {
  const tonight = ev.date === today;
  return (
    <div className="grid grid-cols-[minmax(96px,120px)_1fr_auto] items-center gap-[clamp(14px,2.5vw,24px)] border-t border-line py-[22px]">
      <div>
        <div className="font-display text-[34px] leading-none text-white">{shortLabel(ev.date)}</div>
        <div className={`font-mono text-xs ${tonight ? "text-blue" : "text-muted"}`}>{tonight ? "TONIGHT" : "TUESDAY"}</div>
      </div>
      <div className="min-w-0">
        <Link href="/calendar" className="text-[19px] font-bold text-white hover:text-blue">
          {ev.topic ? `${ev.name}: ${ev.topic}` : ev.name}
        </Link>
        <div className="mt-0.5 text-sm text-body">
          7:00 PM · The Warehouse, Wixom{ev.teachers ? ` · with ${ev.teachers}` : ""}
        </div>
      </div>
      <div className="col-span-2 col-start-2 min-[700px]:col-span-1 min-[700px]:col-start-auto">
        <AddToCalendar ev={ev} />
      </div>
    </div>
  );
}
