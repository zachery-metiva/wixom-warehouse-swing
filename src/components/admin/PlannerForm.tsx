"use client";

import { useState } from "react";
import { savePlannedEvent } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/forms";
import { LEVELS } from "@/lib/types";

export type Template = { id: string; name: string; desc?: string; doors: string; lesson: string; social: string; capacity: number; priceCents: number };

export type Planned = {
  id: string;
  date: string;
  name: string;
  night_type: string | null;
  doors_open: string;
  lesson_start: string;
  social_start: string;
  lesson_teacher: string;
  capacity: number;
  price_cents: number;
  topic: string;
  level: string;
  description: string;
  meetup_url: string | null;
  hidden: boolean;
};

/** "7:00 PM" -> "19:00" for <input type=time> */
function to24(t: string, fallback: string) {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp])?/);
  if (!m) return fallback;
  let h = Number(m[1]);
  if (m[3]?.toLowerCase() === "p" && h < 12) h += 12;
  if (m[3]?.toLowerCase() === "a" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

const label = "mb-2 block font-mono text-[11px] tracking-[2px] text-[#8b8f99] uppercase";

export function PlannerForm({ templates, planned, defaultDate, teachers }: { templates: Template[]; planned?: Planned; defaultDate: string; teachers: string[] }) {
  const first = templates[0];
  const [v, setV] = useState(() =>
    planned
      ? {
          night_type: planned.night_type ?? "",
          name: planned.name,
          doors_open: to24(planned.doors_open, "19:00"),
          lesson_start: to24(planned.lesson_start, "19:00"),
          social_start: to24(planned.social_start, "19:45"),
          capacity: planned.capacity,
          price: planned.price_cents / 100,
        }
      : {
          night_type: first?.id ?? "",
          name: first?.name ?? "Tuesday Social & Lesson",
          doors_open: first?.doors || "19:00",
          lesson_start: first?.lesson || "19:00",
          social_start: first?.social || "19:45",
          capacity: first?.capacity ?? 100,
          price: (first?.priceCents ?? 1000) / 100,
        },
  );
  const pick = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return setV((s) => ({ ...s, night_type: "" }));
    setV({ night_type: t.id, name: t.name, doors_open: t.doors, lesson_start: t.lesson, social_start: t.social, capacity: t.capacity, price: t.priceCents / 100 });
  };
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((s) => ({ ...s, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  return (
    <ActionForm action={savePlannedEvent} submit={planned ? "SAVE NIGHT" : "ADD TO CALENDAR"}>
      <input type="hidden" name="id" value={planned?.id ?? ""} />
      <input type="hidden" name="night_type" value={v.night_type} />
      <div className="grid gap-x-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="mb-4 block">
          <span className={label}>Date</span>
          <input type="date" name="date" required defaultValue={planned?.date ?? defaultDate} className="field" />
        </label>
        {!planned ? (
          <label className="mb-4 block">
            <span className={label}>Repeat weekly</span>
            <select name="repeat" defaultValue="1" className="field bg-ink">
              {[1, 2, 4, 8, 12, 26].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "Just this date" : `${n} weeks`}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {templates.length ? (
          <label className="mb-4 block">
            <span className={label}>Door-app template</span>
            <select value={v.night_type} onChange={(e) => pick(e.target.value)} className="field bg-ink">
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              <option value="">Custom</option>
            </select>
          </label>
        ) : null}
        <label className="mb-4 block">
          <span className={label}>Name</span>
          <input name="name" required value={v.name} onChange={set("name")} className="field" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-5">
        <label className="mb-4 block">
          <span className={label}>Doors</span>
          <input type="time" name="doors_open" value={v.doors_open} onChange={set("doors_open")} className="field [color-scheme:dark]" />
        </label>
        <label className="mb-4 block">
          <span className={label}>Lesson</span>
          <input type="time" name="lesson_start" value={v.lesson_start} onChange={set("lesson_start")} className="field [color-scheme:dark]" />
        </label>
        <label className="mb-4 block">
          <span className={label}>Social</span>
          <input type="time" name="social_start" value={v.social_start} onChange={set("social_start")} className="field [color-scheme:dark]" />
        </label>
        <label className="mb-4 block">
          <span className={label}>Capacity</span>
          <input type="number" min={1} name="capacity" value={v.capacity} onChange={set("capacity")} className="field" />
        </label>
        <label className="mb-4 block">
          <span className={label}>Door price ($)</span>
          <input type="number" min={0} step="0.5" name="price" value={v.price} onChange={set("price")} className="field" />
        </label>
      </div>
      <div className="grid gap-x-4 sm:grid-cols-3">
        <label className="mb-4 block">
          <span className={label}>Teaching</span>
          <input name="lesson_teacher" list="teacher-names" defaultValue={planned?.lesson_teacher ?? ""} placeholder="Grant, Rhythm" className="field" />
          <datalist id="teacher-names">
            {teachers.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>
        <label className="mb-4 block">
          <span className={label}>Topic (optional)</span>
          <input name="topic" defaultValue={planned?.topic ?? ""} placeholder="Whip variations" className="field" />
        </label>
        <label className="mb-4 block">
          <span className={label}>Level</span>
          <select name="level" defaultValue={planned?.level ?? "All levels"} className="field bg-ink">
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="mb-4 block">
        <span className={label}>Description (shown on the website)</span>
        <textarea name="description" rows={2} defaultValue={planned?.description ?? ""} className="field" />
      </label>
      <div className="grid gap-x-4 sm:grid-cols-[2fr_1fr]">
        <label className="mb-4 block">
          <span className={label}>Meetup link</span>
          <input type="url" name="meetup_url" defaultValue={planned?.meetup_url ?? ""} placeholder="https://www.meetup.com/…" className="field" />
        </label>
        <label className="mb-4 flex cursor-pointer items-center gap-2.5 self-end pb-3 text-sm text-strong">
          <input type="checkbox" name="hidden" defaultChecked={planned?.hidden} className="h-4 w-4 accent-[#2eb6f5]" />
          Hide from the public website
        </label>
      </div>
    </ActionForm>
  );
}
