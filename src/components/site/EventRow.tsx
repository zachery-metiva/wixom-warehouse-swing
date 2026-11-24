import Link from "next/link";
import { shortLabel } from "@/lib/dates";
import type { SiteEvent } from "@/lib/types";

export function EventRow({ ev, today }: { ev: SiteEvent; today: string }) {
  const tonight = ev.date === today;
  return (
    <Link
      href="/calendar"
      className="grid grid-cols-[minmax(96px,120px)_1fr_auto] items-center gap-[clamp(14px,2.5vw,24px)] border-t border-line py-[22px] hover:bg-blue/[.03]"
    >
      <div>
        <div className="font-display text-[34px] leading-none text-white">{shortLabel(ev.date)}</div>
        <div className={`font-mono text-xs ${tonight ? "text-blue" : "text-muted"}`}>{tonight ? "TONIGHT" : "TUESDAY"}</div>
      </div>
      <div className="min-w-0">
        <div className="text-[19px] font-bold text-white">{ev.topic ? `${ev.name}: ${ev.topic}` : ev.name}</div>
        <div className="mt-0.5 text-sm text-body">
          7:00 PM · The Warehouse, Wixom{ev.teachers ? ` · with ${ev.teachers}` : ""}
        </div>
      </div>
      <div className="hidden border border-blue px-3.5 py-2 font-mono text-xs text-blue min-[700px]:block">DETAILS</div>
    </Link>
  );
}
