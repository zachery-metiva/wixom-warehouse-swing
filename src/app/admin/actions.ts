"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { bool, num, parsePairs, requireEditor, str, url } from "@/lib/admin";
import { SITE_TAG } from "@/lib/data";
import { serverClient } from "@/lib/supabase/server";
import { CATEGORIES, DIFFICULTIES, LEVELS } from "@/lib/types";

export type FormState = { ok: boolean; message: string } | null;

const done = (message = "Saved. The live site is updated."): FormState => {
  updateTag(SITE_TAG);
  return { ok: true, message };
};
const fail = (error: { message: string } | null, fallback = "Could not save."): FormState => ({
  ok: false,
  message: error?.message ? `${fallback} ${error.message}` : fallback,
});

/* ---------- auth ---------- */

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await serverClient();
  const { error } = await sb.auth.signInWithPassword({ email: str(form, "email", 254), password: String(form.get("password") ?? "") });
  if (error) return { ok: false, message: "That email and password didn't match." };
  // Same first-login step the door app runs: links the staff row to this login by email.
  await sb.rpc("get_my_staff_profile");
  const { data: ok } = await sb.rpc("site_is_editor");
  if (!ok) {
    await sb.auth.signOut();
    return { ok: false, message: "This account isn't allowed to edit the website. Ask an owner to grant access." };
  }
  redirect("/admin");
}

export async function signOut() {
  const sb = await serverClient();
  await sb.auth.signOut();
  redirect("/admin/login");
}

/* ---------- events ---------- */

export async function saveEventNotes(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const level = str(form, "level");
  const { error } = await sb.from("site_event_notes").upsert({
    event_id: str(form, "event_id"),
    topic: str(form, "topic", 120),
    level: (LEVELS as readonly string[]).includes(level) ? level : "All levels",
    description: str(form, "description", 2000),
    meetup_url: url(form, "meetup_url"),
    hidden: bool(form, "hidden"),
  });
  return error ? fail(error) : done();
}

export async function addClosure(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const date = str(form, "date", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: "Pick a date." };
  const { error } = await sb.from("site_closures").upsert({ date, reason: str(form, "reason", 200) });
  return error ? fail(error) : done("Night removed from the public calendar.");
}

export async function removeClosure(form: FormData) {
  const sb = await requireEditor();
  await sb.from("site_closures").delete().eq("date", str(form, "date", 10));
  updateTag(SITE_TAG);
}

/* ---------- planned events (website-created nights) ---------- */

function to12h(t: string, fallback: string) {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return fallback;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

function addWeeks(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 7 * n);
  return d.toISOString().slice(0, 10);
}

export async function savePlannedEvent(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const id = str(form, "id");
  const date = str(form, "date", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: "Pick a date." };
  const name = str(form, "name", 120);
  if (!name) return { ok: false, message: "Give the night a name." };
  const level = str(form, "level");
  const row = {
    name,
    night_type: str(form, "night_type", 40) || null,
    doors_open: to12h(str(form, "doors_open", 5), "7:00 PM"),
    lesson_start: to12h(str(form, "lesson_start", 5), ""),
    social_start: to12h(str(form, "social_start", 5), "7:45 PM"),
    lesson_teacher: str(form, "lesson_teacher", 200),
    capacity: Math.max(1, Math.round(num(form, "capacity", 100))),
    price_cents: Math.max(0, Math.round(num(form, "price", 10) * 100)),
    topic: str(form, "topic", 120),
    level: (LEVELS as readonly string[]).includes(level) ? level : "All levels",
    description: str(form, "description", 2000),
    meetup_url: url(form, "meetup_url"),
    hidden: bool(form, "hidden"),
  };

  if (id) {
    const { error } = await sb.from("site_planned_events").update({ ...row, date }).eq("id", id);
    if (error) return fail(error, "Could not save (nights already sent to the door app can't be edited here).");
  } else {
    const weeks = Math.min(26, Math.max(1, Math.round(num(form, "repeat", 1))));
    const dates = Array.from({ length: weeks }, (_, i) => addWeeks(date, i));
    // Skip dates that already have a night, planned here or in the door app.
    const [planned, door] = await Promise.all([
      sb.from("site_planned_events").select("date").in("date", dates),
      sb.rpc("site_admin_events", { p_from: dates[0], p_to: dates.at(-1)! }),
    ]);
    if (planned.error) return fail(planned.error);
    const taken = new Set([...(planned.data ?? []).map((r) => r.date as string), ...((door.data ?? []) as { date: string }[]).map((r) => r.date)]);
    const fresh = dates.filter((d) => !taken.has(d));
    if (!fresh.length) return { ok: false, message: "Every one of those dates already has a night." };
    const { error } = await sb.from("site_planned_events").insert(fresh.map((d) => ({ ...row, date: d })));
    if (error) return fail(error);
    const skipped = dates.length - fresh.length;
    const { data: released } = await sb.rpc("site_release_due_events");
    updateTag(SITE_TAG);
    return {
      ok: true,
      message:
        `Added ${fresh.length} night${fresh.length === 1 ? "" : "s"}` +
        (skipped ? `, skipped ${skipped} date${skipped === 1 ? "" : "s"} that already had one` : "") +
        (released ? `. ${released} within a week went to the door app now.` : "."),
    };
  }
  const { data: released } = await sb.rpc("site_release_due_events");
  return done(released ? "Saved, and sent to the door app (it's within a week)." : "Saved. The live site is updated.");
}

export async function deletePlannedEvent(form: FormData) {
  const sb = await requireEditor();
  await sb.from("site_planned_events").delete().eq("id", str(form, "id"));
  updateTag(SITE_TAG);
}

/* ---------- moves ---------- */

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function saveMove(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const id = str(form, "id");
  const name = str(form, "name", 80);
  if (!name) return { ok: false, message: "Give the move a name." };
  const category = str(form, "category");
  const difficulty = str(form, "difficulty");
  if (!(CATEGORIES as readonly string[]).includes(category)) return { ok: false, message: "Pick a category." };
  if (!(DIFFICULTIES as readonly string[]).includes(difficulty)) return { ok: false, message: "Pick a level." };

  const row = {
    name,
    slug: slugify(str(form, "slug") || name),
    category,
    difficulty,
    counts: Math.min(32, Math.max(1, Math.round(num(form, "counts", 6)))),
    summary: str(form, "summary", 600),
    steps: str(form, "steps", 6000)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
    count_rows: parsePairs(str(form, "count_rows", 3000), "c", "t"),
    mistakes: parsePairs(str(form, "mistakes", 6000), "w", "f"),
    video_url: url(form, "video_url"),
    featured: bool(form, "featured"),
    published: bool(form, "published"),
    sort: Math.round(num(form, "sort", 0)),
  };

  const res = id ? await sb.from("site_moves").update(row).eq("id", id).select("id").single() : await sb.from("site_moves").insert(row).select("id").single();
  if (res.error) return fail(res.error, res.error.code === "23505" ? "That URL slug is already used." : "Could not save.");
  const moveId = res.data.id as string;

  const prereqs = form.getAll("prereqs").map(String).filter((p) => p && p !== moveId);
  const del = await sb.from("site_move_prereqs").delete().eq("move_id", moveId);
  if (del.error) return fail(del.error);
  if (prereqs.length) {
    const ins = await sb.from("site_move_prereqs").insert(prereqs.map((p) => ({ move_id: moveId, prereq_id: p })));
    if (ins.error) return fail(ins.error);
  }
  updateTag(SITE_TAG);
  if (!id) redirect(`/admin/moves/${moveId}?created=1`);
  return { ok: true, message: "Saved. The live site is updated." };
}

export async function deleteMove(form: FormData) {
  const sb = await requireEditor();
  await sb.from("site_moves").delete().eq("id", str(form, "id"));
  updateTag(SITE_TAG);
  redirect("/admin/moves");
}

/* ---------- FAQs ---------- */

export async function saveFaq(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const id = str(form, "id");
  const row = {
    question: str(form, "question", 300),
    answer: str(form, "answer", 3000),
    sort: Math.round(num(form, "sort", 0)),
    published: bool(form, "published"),
  };
  if (!row.question || !row.answer) return { ok: false, message: "Both a question and an answer are needed." };
  const { error } = id ? await sb.from("site_faqs").update(row).eq("id", id) : await sb.from("site_faqs").insert(row);
  return error ? fail(error) : done();
}

export async function deleteFaq(form: FormData) {
  const sb = await requireEditor();
  await sb.from("site_faqs").delete().eq("id", str(form, "id"));
  updateTag(SITE_TAG);
}

/* ---------- instructors ---------- */

export async function saveInstructor(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const id = str(form, "id");
  const row = {
    name: str(form, "name", 80),
    role: str(form, "role", 80) || "Instructor",
    bio: str(form, "bio", 1000),
    headshot_url: url(form, "headshot_url"),
    sort: Math.round(num(form, "sort", 0)),
    active: bool(form, "active"),
  };
  if (!row.name) return { ok: false, message: "Name is required." };
  const { error } = id ? await sb.from("site_instructors").update(row).eq("id", id) : await sb.from("site_instructors").insert(row);
  return error ? fail(error) : done();
}

export async function deleteInstructor(form: FormData) {
  const sb = await requireEditor();
  await sb.from("site_instructors").delete().eq("id", str(form, "id"));
  updateTag(SITE_TAG);
}

/* ---------- photos ---------- */

export async function addPhoto(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const src = url(form, "url");
  if (!src) return { ok: false, message: "Upload a photo first." };
  const { error } = await sb.from("site_photos").insert({
    url: src,
    caption: str(form, "caption", 200),
    taken_on: str(form, "taken_on", 10) || null,
    sort: Math.round(num(form, "sort", 0)),
  });
  return error ? fail(error) : done("Photo added.");
}

export async function savePhoto(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const { error } = await sb
    .from("site_photos")
    .update({ caption: str(form, "caption", 200), taken_on: str(form, "taken_on", 10) || null, sort: Math.round(num(form, "sort", 0)) })
    .eq("id", str(form, "id"));
  return error ? fail(error) : done();
}

export async function deletePhoto(form: FormData) {
  const sb = await requireEditor();
  const id = str(form, "id");
  const { data } = await sb.from("site_photos").select("url").eq("id", id).maybeSingle();
  await sb.from("site_photos").delete().eq("id", id);
  const marker = "/storage/v1/object/public/site-media/";
  if (data?.url?.includes(marker)) {
    await sb.storage.from("site-media").remove([decodeURIComponent(data.url.split(marker)[1])]);
  }
  updateTag(SITE_TAG);
}

/* ---------- settings ---------- */

export async function saveSettings(_prev: FormState, form: FormData): Promise<FormState> {
  const sb = await requireEditor();
  const schedule = str(form, "schedule", 2000)
    .split("\n")
    .map((l) => l.split("|").map((p) => p.trim()))
    .filter((p) => p[0] && p[1])
    .map(([time, label, blurb = ""]) => ({ time, label, blurb }));
  const data = {
    tagline: str(form, "tagline", 400),
    firstTimerStrip: bool(form, "firstTimerStrip"),
    email: str(form, "email", 254),
    locationName: str(form, "locationName", 80),
    locationNote: str(form, "locationNote", 400),
    mapUrl: url(form, "mapUrl") ?? "",
    monthlyPass: { enabled: bool(form, "passEnabled"), price: num(form, "passPrice", 32), label: str(form, "passLabel", 40) || "/ 4 TUESDAYS" },
    schedule,
    links: {
      meetup: url(form, "meetup") ?? "",
      instagram: url(form, "instagram") ?? "",
      facebook: url(form, "facebook") ?? "",
      discord: url(form, "discord") ?? "",
      waiver: url(form, "waiver") ?? "",
    },
  };
  const { error } = await sb.from("site_settings").upsert({ id: "default", data });
  return error ? fail(error) : done();
}

/* ---------- subscribers ---------- */

export async function setSubscriberStatus(form: FormData) {
  const sb = await requireEditor();
  const status = str(form, "status");
  if (!["active", "unsubscribed", "bounced"].includes(status)) return;
  await sb.from("site_subscribers").update({ status }).eq("id", str(form, "id"));
}
