"use client";

import { useState } from "react";
import { MONTHS, parseIso, shortLabel } from "@/lib/dates";
import type { SiteEvent } from "@/lib/types";

const DOWS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const pad = (n: number) => String(n).padStart(2, "0");

export function CalendarView({ today, events, meetupFallback }: { today: string; events: SiteEvent[]; meetupFallback: string }) {
  const t = parseIso(today);
  const [ym, setYm] = useState({ y: t.getUTCFullYear(), m: t.getUTCMonth() });
  const [view, setView] = useState<"grid" | "list" | null>(null);

  const byDate = new Map(events.map((e) => [e.date, e]));
  const first = new Date(Date.UTC(ym.y, ym.m, 1));
  const startDow = first.getUTCDay();
  const dim = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const dimPrev = new Date(Date.UTC(ym.y, ym.m, 0)).getUTCDate();
  const total = Math.ceil((startDow + dim) / 7) * 7;
  const iso = (d: number) => `${ym.y}-${pad(ym.m + 1)}-${pad(d)}`;
  const monthEvents = events.filter((e) => e.date.startsWith(`${ym.y}-${pad(ym.m + 1)}`));

  const move = (delta: number) =>
    setYm(({ y, m }) => {
      const n = m + delta;
      return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });

  const toggle = (active: boolean) =>
    `cursor-pointer px-[18px] py-2.5 font-mono text-[11px] tracking-[1px] ${active ? "bg-blue text-ink" : "text-body"}`;

  // List view is the default on narrow screens; CSS decides until the visitor picks.
  const gridCls = view === "list" ? "hidden" : view === "grid" ? "block" : "hidden min-[700px]:block";
  const listCls = view === "grid" ? "hidden" : view === "list" ? "block" : "block min-[700px]:hidden";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => move(-1)}
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center border border-line-strong text-lg text-white hover:border-blue hover:text-blue"
          >
            ‹
          </button>
          <div className="min-w-[210px] text-center font-display text-[30px] tracking-[1px] text-white" aria-live="polite">
            {MONTHS[ym.m].toUpperCase()} {ym.y}
          </div>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => move(1)}
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center border border-line-strong text-lg text-white hover:border-blue hover:text-blue"
          >
            ›
          </button>
        </div>
        <div className="flex border border-line-strong" role="group" aria-label="Calendar view">
          <button type="button" className={toggle(view === "grid")} aria-pressed={view === "grid"} onClick={() => setView("grid")}>
            GRID
          </button>
          <button type="button" className={toggle(view === "list")} aria-pressed={view === "list"} onClick={() => setView("list")}>
            LIST
          </button>
        </div>
      </div>

      <div className={`mt-6 ${gridCls}`}>
        <div className="grid grid-cols-7 border-t border-l border-line">
          {DOWS.map((d) => (
            <div key={d} className="border-r border-b border-line bg-card px-2 py-2.5 text-center font-mono text-[11px] text-muted">
              {d}
            </div>
          ))}
          {Array.from({ length: total }, (_, i) => {
            const n = i - startDow + 1;
            const inMonth = n >= 1 && n <= dim;
            const date = inMonth ? iso(n) : "";
            const ev = inMonth ? byDate.get(date) : undefined;
            const isToday = date === today;
            const label = inMonth ? n : n < 1 ? dimPrev + n : n - dim;
            return (
              <div
                key={i}
                className={`min-h-[54px] border-r border-b border-line px-[5px] py-1.5 min-[700px]:min-h-[92px] min-[700px]:px-2 min-[700px]:py-[9px] ${ev ? "bg-blue/[.06]" : isToday ? "bg-white/[.03]" : ""}`}
              >
                <div className={`font-mono text-xs ${!inMonth ? "text-line-strong" : ev ? "text-blue" : "text-body"}`}>{label}</div>
                {isToday ? <div className="mt-[5px] hidden bg-blue min-[700px]:inline-block px-[5px] py-0.5 font-mono text-[9px] text-ink">TODAY</div> : null}
                {ev ? <div aria-hidden className="mt-[5px] h-[7px] w-[7px] rounded-full bg-blue min-[700px]:hidden" /> : null}
                {ev ? (
                  <div className="mt-[5px] hidden border border-blue/50 min-[700px]:block px-[5px] py-[3px] font-mono text-[9.5px] leading-[1.35] text-blue">
                    {ev.fromDoorApp && ev.name !== "Weekly Lessons + Social" ? ev.name.toUpperCase() : "LESSONS + SOCIAL"}
                    <br />
                    7:00 PM
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`mt-6 ${listCls}`}>
        <div className="flex flex-col border-b border-line">
          {monthEvents.length === 0 ? (
            <div className="border-t border-line py-6 text-sm text-body">No nights on the calendar this month yet.</div>
          ) : null}
          {monthEvents.map((ev) => {
            const past = ev.date < today;
            const tonight = ev.date === today;
            const rsvp = ev.meetupUrl || meetupFallback;
            return (
              <div
                key={ev.date}
                className={`grid grid-cols-[minmax(90px,110px)_1fr] gap-[clamp(14px,2.5vw,24px)] border-t border-line py-6 ${past ? "opacity-45" : ""}`}
              >
                <div>
                  <div className="font-display text-[36px] leading-none text-white">{shortLabel(ev.date)}</div>
                  <div className={`mt-0.5 font-mono text-xs ${tonight ? "text-blue" : "text-muted"}`}>
                    {tonight ? "TONIGHT" : ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][parseIso(ev.date).getUTCDay()]}
                  </div>
                </div>
                <div>
                  <div className="text-[19px] font-bold text-white">{ev.topic ? `${ev.name}: ${ev.topic}` : ev.name}</div>
                  {ev.description ? <p className="mt-1.5 text-sm text-body">{ev.description}</p> : null}
                  <div className="mt-2 font-mono text-xs leading-[1.8] text-body">
                    7:00 ADVANCED LESSON
                    <br />
                    7:30 BEGINNER LESSON
                    <br />
                    7:45 SOCIAL DANCE, UNTIL 10:00
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <span className="font-mono text-[11px] text-muted">
                      THE WAREHOUSE · WIXOM, MI{ev.teachers ? ` · ${ev.teachers.toUpperCase()}` : ""}
                    </span>
                    {rsvp && !past ? (
                      <a href={rsvp} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-blue hover:text-blue-hover">
                        RSVP ON MEETUP →
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
