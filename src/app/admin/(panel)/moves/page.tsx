import Link from "next/link";
import { AdminTitle } from "@/components/admin/fields";
import { requireEditor } from "@/lib/admin";
import { DIFF_COLOR, type Difficulty } from "@/lib/types";

export const metadata = { title: "Moves" };

type Row = { id: string; slug: string; name: string; category: string; difficulty: Difficulty; counts: number; featured: boolean; published: boolean; sort: number };

export default async function MovesAdmin() {
  const sb = await requireEditor();
  const { data, error } = await sb.from("site_moves").select("id,slug,name,category,difficulty,counts,featured,published,sort").order("sort").order("name");
  const rows = (data ?? []) as Row[];
  return (
    <>
      <AdminTitle
        kicker="THE MOVE VAULT"
        actions={
          <Link href="/admin/moves/new" className="rounded-[2px] bg-blue px-5 py-2.5 text-[13px] font-bold text-ink hover:bg-blue-hover">
            + ADD MOVE
          </Link>
        }
      >
        MOVES
      </AdminTitle>
      {error ? <p className="mb-4 font-mono text-xs text-[#ff8a63]">{error.message}</p> : null}
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="bg-cell text-left font-mono text-[10.5px] tracking-[2px] text-[#8b8f99]">
              {["ORDER", "NAME", "CATEGORY", "LEVEL", "COUNTS", "STATUS"].map((h) => (
                <th key={h} className="border-b border-line px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-blue/5">
                <td className="border-b border-hair px-4 py-3 font-mono text-xs text-muted">{m.sort}</td>
                <td className="border-b border-hair px-4 py-3">
                  <Link href={`/admin/moves/${m.id}`} className="font-medium text-white hover:text-blue">
                    {m.name}
                  </Link>
                  {m.featured ? <span className="ml-2 font-mono text-[10px] text-blue">★ HOME</span> : null}
                </td>
                <td className="border-b border-hair px-4 py-3 text-body">{m.category}</td>
                <td className="border-b border-hair px-4 py-3 font-mono text-[11px]" style={{ color: DIFF_COLOR[m.difficulty] }}>
                  {m.difficulty.toUpperCase()}
                </td>
                <td className="border-b border-hair px-4 py-3 font-mono text-xs text-body">{m.counts}</td>
                <td className="border-b border-hair px-4 py-3 font-mono text-[11px]">
                  {m.published ? <span className="text-good">LIVE</span> : <span className="text-warn">DRAFT</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
