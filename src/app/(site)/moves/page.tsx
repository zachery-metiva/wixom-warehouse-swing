import type { Metadata } from "next";
import { MoveVault } from "@/components/site/MoveVault";
import { PageHeader } from "@/components/ui";
import { getMoves } from "@/lib/data";

export const metadata: Metadata = {
  title: "The Move Vault",
  description: "Every modern swing move we teach on Tuesdays, with counts, prerequisites, and the common mistakes (and how to fix them).",
};

export default async function MovesPage() {
  "use cache";
  const moves = (await getMoves()).filter((m) => m.published);
  return (
    <div className="wrap pt-12 pb-[72px]">
      <PageHeader
        eyebrow="THE REPERTOIRE"
        lead="Every move we teach on Tuesdays, with video, counts, prerequisites, and the mistakes everyone makes (and how to fix them)."
      >
        THE MOVE VAULT
      </PageHeader>
      <MoveVault moves={moves.map(({ id, slug, name, category, difficulty, counts }) => ({ id, slug, name, category, difficulty, counts }))} />
    </div>
  );
}
