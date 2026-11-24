import { addClosure, removeClosure, saveEventNotes } from "@/app/admin/actions";
import { ActionForm, ConfirmButton } from "@/components/admin/forms";
import { AdminTitle, Area, Check, Field, Panel, Select } from "@/components/admin/fields";
import { requireEditor } from "@/lib/admin";
import { addDays, longLabel, todayIso } from "@/lib/dates";
import { LEVELS } from "@/lib/types";

export const metadata = { title: "Events" };

type AdminEvent = {
  id: string;
  date: string;
  name: string;
  lesson_teacher: string;
  capacity: number;
  is_active: boolean;
  checkins: number;
  topic: string;
  level: string;
  description: string;
  meetup_url: string | null;
  hidden: boolean;
};

export default async function EventsPage() {
  const sb = await requireEditor();
  const today = todayIso();
  const [ev, cl] = await Promise.all([
    sb.rpc("site_admin_events", { p_from: addDays(today, -28), p_to: addDays(today, 180) }),
    sb.from("site_closures").select("*").gte("date", today).order("date"),
  ]);
  const events = ((ev.data ?? []) as AdminEvent[]).sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = events.filter((e) => e.date >= today);
  const recent = events.filter((e) => e.date < today).reverse();
  const closures = (cl.data ?? []) as { date: string; reason: string }[];

  return (
    <>
      <AdminTitle kicker="WEBSITE DETAILS FOR DOOR-APP NIGHTS">EVENTS</AdminTitle>
      <p className="mb-6 max-w-[720px] text-sm leading-[1.6] text-body">
        Nights are created in the door app (name, date, times, teachers, price). Every regular Tuesday shows on the public calendar automatically. Use this
        page to add a topic, a short description and a Meetup link to a night, hide one from the website, or mark a Tuesday as off.
      </p>

      {ev.error ? <p className="mb-4 font-mono text-xs text-[#ff8a63]">Could not load events: {ev.error.message}</p> : null}

      <h2 className="display mb-3 text-[28px]">UPCOMING</h2>
      {upcoming.length === 0 ? (
        <Panel className="mb-8">
          <p className="text-sm text-body">No upcoming nights exist in the door app yet.</p>
        </Panel>
      ) : (
        <div className="mb-10 flex flex-col gap-3.5">
          {upcoming.map((e) => (
            <EventEditor key={e.id} e={e} />
          ))}
        </div>
      )}

      <div className="grid gap-3.5 lg:grid-cols-2">
        <Panel>
          <div className="font-mono text-[10px] tracking-[2px] text-blue">SKIP A TUESDAY</div>
          <p className="mt-2 text-[13px] text-body">Removes a regular Tuesday from the public calendar (holidays, venue closed).</p>
          <ActionForm action={addClosure} className="mt-4" submit="MARK AS OFF">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date" name="date" type="date" required />
              <Field label="Reason (internal)" name="reason" placeholder="Thanksgiving week" />
            </div>
          </ActionForm>
          {closures.length ? (
            <ul className="mt-5">
              {closures.map((c) => (
                <li key={c.date} className="flex items-center justify-between gap-3 border-t border-hair py-2.5 text-sm">
                  <span className="text-white">
                    {longLabel(c.date)} <span className="text-muted">{c.reason}</span>
                  </span>
                  <form action={removeClosure}>
                    <input type="hidden" name="date" value={c.date} />
                    <ConfirmButton label="RESTORE" confirm="Put this Tuesday back on the calendar?" />
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>

        <Panel>
          <div className="font-mono text-[10px] tracking-[2px] text-blue">LAST 4 WEEKS</div>
          <ul className="mt-3">
            {recent.map((e) => (
              <li key={e.id} className="flex justify-between gap-3 border-b border-hair py-2.5 text-sm">
                <span className="text-white">{longLabel(e.date)}</span>
                <span className="font-mono text-xs text-body">{e.checkins} CHECKED IN</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

function EventEditor({ e }: { e: AdminEvent }) {
  return (
    <details className="group border border-line bg-ink">
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-3 px-5 py-4 hover:bg-card">
        <span>
          <span className="font-display text-2xl text-white">{longLabel(e.date).toUpperCase()}</span>
          <span className="ml-3 text-sm text-body">{e.topic ? `${e.name}: ${e.topic}` : e.name}</span>
        </span>
        <span className="font-mono text-[10px] tracking-[1px] text-muted">
          {e.hidden ? <span className="text-warn">HIDDEN · </span> : null}
          {e.lesson_teacher ? `${e.lesson_teacher.toUpperCase()} · ` : ""}EDIT ▾
        </span>
      </summary>
      <div className="border-t border-line p-5">
        <ActionForm action={saveEventNotes}>
          <input type="hidden" name="event_id" value={e.id} />
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Topic (shown after the name)" name="topic" defaultValue={e.topic} placeholder="Whip variations" />
            <Select label="Level" name="level" options={LEVELS} defaultValue={e.level} />
          </div>
          <Area label="Description" name="description" defaultValue={e.description} rows={3} />
          <Field label="Meetup link" name="meetup_url" type="url" defaultValue={e.meetup_url} placeholder="https://www.meetup.com/…" />
          <Check label="Hide this night from the public website" name="hidden" defaultChecked={e.hidden} />
        </ActionForm>
      </div>
    </details>
  );
}
