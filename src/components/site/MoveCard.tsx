import Link from "next/link";
import { DiffTag, PlayBadge, Tag } from "@/components/ui";
import type { Move } from "@/lib/types";

export function MoveCard({ move, tall = false }: { move: Pick<Move, "slug" | "name" | "difficulty" | "category" | "counts">; tall?: boolean }) {
  return (
    <Link href={`/moves/${move.slug}`} className="block border border-line bg-card hover:border-blue">
      <div className={`hatch flex items-center justify-center ${tall ? "h-[150px]" : "h-[140px]"}`}>
        <PlayBadge size={tall ? 44 : 40} />
      </div>
      <div className="px-[18px] py-4">
        <div className="mb-2 flex flex-wrap gap-2">
          <DiffTag d={move.difficulty} />
          <Tag>{move.category}</Tag>
        </div>
        <div className="text-[17px] font-bold text-white">{move.name}</div>
        <div className="mt-1 font-mono text-[11px] text-muted">{move.counts} COUNTS</div>
      </div>
    </Link>
  );
}
