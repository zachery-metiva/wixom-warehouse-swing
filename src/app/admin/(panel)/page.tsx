import Link from "next/link";
import { AdminTitle, Panel } from "@/components/admin/fields";
import { requireEditor } from "@/lib/admin";
import { addDays, longLabel, todayIso } from "@/lib/dates";

export const metadata = { title: "Dashboard" };

type AdminEvent = { id: string; date: string; name: string; lesson_teacher: string; capacity: number; checkins: number; topic: string };

export default async function Dashboard() {
  const sb = await requireEditor();
  const today = todayIso();
  const [events, moves, subs, photos] = await Promise.all([
    sb.rpc("site_admin_events", { p_from: addDays(today, -56), p_to: addDays(today, 60) }),
    sb.from("site_moves").select("id", { count: "exact", head: true }),
    sb.from("site_subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
    sb.from("site_photos").select("id", { count: "exact", head: true }),
  ]);
  const all = (events.data ?? []) as AdminEvent[];
  const past = all.filter((e) => e.date < today && e.checkins > 0);
  const upcoming = all.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const avg = past.length ? Math.round(past.slice(0, 8).reduce((s, e) => s + Number(e.checkins), 0) / Math.min(8, past.length)) : null;

  const kpis = [
    { label: "AVG ATTENDANCE", value: avg ?? "–", note: "LAST 8 NIGHTS (DOOR APP)", href: "/admin/events" },
    { label: "SUBSCRIBERS", value: subs.count ?? 0, note: "ACTIVE", href: "/admin/subscribers" },
    { label: "MOVES", value: moves.count ?? 0, note: "IN THE VAULT", href: "/admin/moves" },
    { label: "PHOTOS", value: photos.count ?? 0, note: "IN THE GALLERY", href: "/admin/photos" },
  ];

  return (
    <>
      <AdminTitle kicker={`SIGNED IN AS ${sb.userEmail.toUpperCase()}`}>DASHBOARD</AdminTitle>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="border border-line bg-ink px-5 py-[18px] hover:border-blue">
            <div className="font-mono text-[10px] tracking-[2px] text-muted">{k.label}</div>
            <div className="mt-2 font-display text-[40px] leading-none text-white">{k.value}</div>
            <div className="mt-1 font-mono text-[10px] text-muted">{k.note}</div>
          </Link>
        ))}
      </div>

      <div className="mt-3.5 grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-[10px] tracking-[2px] text-blue">COMING UP (FROM THE DOOR APP)</div>
            <Link href="/admin/events" className="font-mono text-[10px] text-muted hover:text-blue">
              ALL EVENTS →
            </Link>
          </div>
          {upcoming.length ? (
            <ul className="mt-3">
              {upcoming.slice(0, 5).map((e) => (
                <li key={e.id} className="flex justify-between gap-3 border-b border-hair py-2.5 text-sm">
                  <span className="text-white">{longLabel(e.date)}</span>
                  <span className="text-body">{e.topic || e.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-body">
              No upcoming nights have been created in the door app yet. The public calendar still shows every regular Tuesday automatically; create a night
              in the door app when you want to add a topic, description or Meetup link.
            </p>
          )}
        </Panel>
        <Panel>
          <div className="font-mono text-[10px] tracking-[2px] text-blue">QUICK ACTIONS</div>
          <div className="mt-3 flex flex-col gap-2">
            {[
              ["/admin/moves/new", "Add a move to the vault"],
              ["/admin/photos", "Upload photos from last Tuesday"],
              ["/admin/events", "Add a topic or skip a Tuesday"],
              ["/admin/settings", "Update links, prices note, schedule"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="flex justify-between border border-line-strong px-3.5 py-[11px] text-sm text-white hover:border-blue">
                {label} <span className="text-blue">→</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
