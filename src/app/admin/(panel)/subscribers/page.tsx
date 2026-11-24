import { setSubscriberStatus } from "@/app/admin/actions";
import { AdminTitle } from "@/components/admin/fields";
import { requireEditor } from "@/lib/admin";

export const metadata = { title: "Subscribers" };

type Sub = { id: string; email: string; status: string; source: string; created_at: string };

export default async function SubscribersAdmin() {
  const sb = await requireEditor();
  const { data } = await sb.from("site_subscribers").select("*").order("created_at", { ascending: false }).limit(1000);
  const subs = (data ?? []) as Sub[];
  const active = subs.filter((s) => s.status === "active").length;

  return (
    <>
      <AdminTitle
        kicker={`${active} ACTIVE · ${subs.length} TOTAL`}
        actions={
          <a href="/admin/subscribers/export" className="border border-blue px-4 py-2 font-mono text-xs text-blue hover:bg-blue/10">
            EXPORT CSV ↓
          </a>
        }
      >
        SUBSCRIBERS
      </AdminTitle>
      <p className="mb-6 max-w-[720px] text-sm text-body">
        Signups from the &quot;Weekly Rundown&quot; forms on the site. Sending the newsletter from here is the next build phase; for now, export the list
        to your email tool.
      </p>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="bg-cell text-left font-mono text-[10.5px] tracking-[2px] text-[#8b8f99]">
              {["EMAIL", "SOURCE", "JOINED", "STATUS", ""].map((h) => (
                <th key={h} className="border-b border-line px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td className="border-b border-hair px-4 py-3 text-white">{s.email}</td>
                <td className="border-b border-hair px-4 py-3 font-mono text-xs text-body">{s.source}</td>
                <td className="border-b border-hair px-4 py-3 font-mono text-xs text-body">{s.created_at.slice(0, 10)}</td>
                <td className={`border-b border-hair px-4 py-3 font-mono text-[11px] ${s.status === "active" ? "text-good" : "text-warn"}`}>
                  {s.status.toUpperCase()}
                </td>
                <td className="border-b border-hair px-4 py-3 text-right">
                  <form action={setSubscriberStatus}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value={s.status === "active" ? "unsubscribed" : "active"} />
                    <button type="submit" className="cursor-pointer font-mono text-[10px] tracking-[1px] text-muted hover:text-blue">
                      {s.status === "active" ? "UNSUBSCRIBE" : "REACTIVATE"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {subs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-body">
                  No signups yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
