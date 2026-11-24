import Link from "next/link";
import { AdminTitle } from "@/components/admin/fields";
import { MoveForm } from "@/components/admin/MoveForm";
import { requireEditor } from "@/lib/admin";

export const metadata = { title: "New move" };

export default async function NewMove() {
  const sb = await requireEditor();
  const { data } = await sb.from("site_moves").select("id,name").order("name");
  return (
    <>
      <Link href="/admin/moves" className="font-mono text-[11px] tracking-[2px] text-[#8b8f99] hover:text-blue">
        ‹ ALL MOVES
      </Link>
      <div className="mt-4">
        <AdminTitle kicker="THE MOVE VAULT">ADD MOVE</AdminTitle>
      </div>
      <MoveForm options={data ?? []} />
    </>
  );
}
