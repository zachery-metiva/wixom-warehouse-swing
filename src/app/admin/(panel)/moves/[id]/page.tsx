import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteMove } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/forms";
import { AdminTitle } from "@/components/admin/fields";
import { MoveForm } from "@/components/admin/MoveForm";
import { requireEditor } from "@/lib/admin";
import type { Move } from "@/lib/types";

export const metadata = { title: "Edit move" };

export default async function EditMove({ params, searchParams }: PageProps<"/admin/moves/[id]">) {
  const sb = await requireEditor();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [move, all, pre] = await Promise.all([
    sb.from("site_moves").select("*").eq("id", id).maybeSingle(),
    sb.from("site_moves").select("id,name").order("name"),
    sb.from("site_move_prereqs").select("prereq_id").eq("move_id", id),
  ]);
  if (!move.data) notFound();
  const m = { ...(move.data as Omit<Move, "prereqs">), prereqs: (pre.data ?? []).map((p) => p.prereq_id as string) };

  return (
    <>
      <Link href="/admin/moves" className="font-mono text-[11px] tracking-[2px] text-[#8b8f99] hover:text-blue">
        ‹ ALL MOVES
      </Link>
      <div className="mt-4">
        <AdminTitle
          kicker={sp.created ? "CREATED · NOW LIVE IN THE VAULT" : "EDIT MOVE"}
          actions={
            <div className="flex items-center gap-3">
              <a href={`/moves/${m.slug}`} target="_blank" className="font-mono text-[11px] tracking-[1px] text-blue hover:text-blue-hover">
                VIEW ON SITE ↗
              </a>
              <form action={deleteMove}>
                <input type="hidden" name="id" value={m.id} />
                <ConfirmButton label="DELETE" confirm={`Delete “${m.name}” from the vault? This can't be undone.`} />
              </form>
            </div>
          }
        >
          {m.name.toUpperCase()}
        </AdminTitle>
      </div>
      <MoveForm key={m.id} move={m} options={all.data ?? []} />
    </>
  );
}
