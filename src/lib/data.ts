import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { publicClient } from "./supabase/public";
import { supabaseConfigured } from "./supabase/env";
import { addDays, dow, todayIso } from "./dates";
import type { Faq, Instructor, Move, Photo, Pricing, SiteEvent, SiteSettings } from "./types";

/** Every public read is tagged "site"; admin saves call updateTag("site"). */
export const SITE_TAG = "site";

export const DEFAULT_SETTINGS: SiteSettings = {
  tagline:
    "Lessons, socials, and a community that shows up every week. No partner needed, no experience required. Just come dance.",
  firstTimerStrip: true,
  email: "hello@warehouseswing.com",
  locationName: "The Warehouse",
  locationNote: "Full street address is on the Meetup event page. Free parking on site; the door with the blue light is the right one.",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Warehouse+Swing+Wixom+MI",
  monthlyPass: { price: 32, label: "/ 4 TUESDAYS", enabled: true },
  schedule: [
    { time: "7:00–7:30", label: "Advanced Lesson", blurb: "Level up your patterns and styling." },
    { time: "7:30–7:45", label: "Beginner Lesson", blurb: "Everything you need for your first dance." },
    { time: "7:45–10:00", label: "Social Dance", blurb: "Open floor. Ask anyone to dance." },
  ],
  links: { meetup: "", instagram: "", facebook: "", discord: "", waiver: "" },
};

function warn(where: string, error: unknown) {
  console.error(`[data] ${where}:`, error);
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  if (!supabaseConfigured) return DEFAULT_SETTINGS;
  const { data, error } = await publicClient().from("site_settings").select("data").eq("id", "default").maybeSingle();
  if (error) warn("settings", error);
  const stored = (data?.data ?? {}) as Partial<SiteSettings>;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    monthlyPass: { ...DEFAULT_SETTINGS.monthlyPass, ...(stored.monthlyPass ?? {}) },
    links: { ...DEFAULT_SETTINGS.links, ...(stored.links ?? {}) },
    schedule: stored.schedule?.length ? stored.schedule : DEFAULT_SETTINGS.schedule,
  };
}

/** Door and student prices come from the door app's own pricing tiers so the
 *  website never disagrees with what is charged at the door. */
export async function getPricing(): Promise<Pricing> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  const fallback: Pricing = { door: 10, student: 7 };
  if (!supabaseConfigured) return fallback;
  const { data, error } = await publicClient().rpc("site_public_pricing");
  if (error) {
    warn("pricing", error);
    return fallback;
  }
  const tiers = (data ?? []) as { name: string; price: number }[];
  const find = (n: string) => tiers.find((t) => t.name.toLowerCase() === n)?.price;
  return { door: find("door") ?? fallback.door, student: find("student") ?? null };
}

type MoveRow = Omit<Move, "prereqs">;

export async function getMoves(): Promise<Move[]> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  if (!supabaseConfigured) return [];
  const sb = publicClient();
  const [moves, prereqs] = await Promise.all([
    sb.from("site_moves").select("*").order("sort").order("name"),
    sb.from("site_move_prereqs").select("move_id, prereq_id"),
  ]);
  if (moves.error) warn("moves", moves.error);
  if (prereqs.error) warn("prereqs", prereqs.error);
  const links = prereqs.data ?? [];
  return ((moves.data ?? []) as MoveRow[]).map((m) => ({
    ...m,
    prereqs: links.filter((l) => l.move_id === m.id).map((l) => l.prereq_id),
  }));
}

export async function getFaqs(): Promise<Faq[]> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  if (!supabaseConfigured) return [];
  const { data, error } = await publicClient().from("site_faqs").select("*").eq("published", true).order("sort");
  if (error) warn("faqs", error);
  return (data ?? []) as Faq[];
}

export async function getInstructors(): Promise<Instructor[]> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  if (!supabaseConfigured) return [];
  const { data, error } = await publicClient().from("site_instructors").select("*").eq("active", true).order("sort");
  if (error) warn("instructors", error);
  return (data ?? []) as Instructor[];
}

export async function getPhotos(): Promise<Photo[]> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  if (!supabaseConfigured) return [];
  const { data, error } = await publicClient().from("site_photos").select("*").order("sort").order("taken_on", { ascending: false });
  if (error) warn("photos", error);
  return (data ?? []) as Photo[];
}

type DoorEvent = {
  id: string;
  date: string;
  name: string;
  lesson_start: string;
  lesson_teacher: string;
  topic: string;
  level: string;
  description: string;
  meetup_url: string | null;
};

const WEEKLY_NAME = "Weekly Lessons + Social";

/** "7:00 PM" -> "19:00"; falls back when the door app has no time. */
export function to24h(t: string | null | undefined, fallback = "19:00"): string {
  const m = (t ?? "").trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp])?/);
  if (!m) return fallback;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const ap = m[3]?.toLowerCase();
  if (ap === "p" && h < 12) h += 12;
  if (ap === "a" && h === 12) h = 0;
  if (h > 23 || min > 59) return fallback;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Calendar window: ~2 months back, ~6 months ahead. Regular Tuesdays are
 *  generated from the weekly schedule; door-app events override them, and
 *  closures remove them. */
export async function getCalendar(): Promise<{ today: string; events: SiteEvent[] }> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("hours");
  const today = todayIso();
  const from = addDays(today, -62);
  const to = addDays(today, 190);

  let door: DoorEvent[] = [];
  let closed = new Set<string>();
  if (supabaseConfigured) {
    const sb = publicClient();
    const [ev, cl] = await Promise.all([
      sb.rpc("site_public_events", { p_from: from, p_to: to }),
      sb.from("site_closures").select("date").gte("date", from).lte("date", to),
    ]);
    if (ev.error) warn("events", ev.error);
    if (cl.error) warn("closures", cl.error);
    door = (ev.data ?? []) as DoorEvent[];
    closed = new Set((cl.data ?? []).map((c: { date: string }) => c.date));
  }

  const byDate = new Map<string, SiteEvent>();
  // Regular Tuesdays first...
  let d = from;
  while (dow(d) !== 2) d = addDays(d, 1);
  for (; d <= to; d = addDays(d, 7)) {
    if (closed.has(d)) continue;
    byDate.set(d, {
      date: d,
      name: WEEKLY_NAME,
      topic: "",
      level: "All levels",
      description: "",
      teachers: "",
      meetupUrl: null,
      fromDoorApp: false,
      start: "19:00",
      end: "22:00",
    });
  }
  // ...then real events from the door app replace or add nights.
  for (const e of door) {
    const isRegular = /tuesday/i.test(e.name) || /social/i.test(e.name);
    byDate.set(e.date, {
      date: e.date,
      name: isRegular && dow(e.date) === 2 ? WEEKLY_NAME : e.name,
      topic: e.topic,
      level: e.level,
      description: e.description,
      teachers: e.lesson_teacher
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .join(", "),
      meetupUrl: e.meetup_url,
      fromDoorApp: true,
      start: to24h(e.lesson_start),
      end: "22:00",
    });
  }
  const events = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  return { today, events };
}

export async function getUpcoming(n = 3): Promise<{ today: string; events: SiteEvent[] }> {
  const { today, events } = await getCalendar();
  return { today, events: events.filter((e) => e.date >= today).slice(0, n) };
}
