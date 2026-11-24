"use client";

import { useMemo, useState } from "react";
import { MoveCard } from "@/components/site/MoveCard";
import { CATEGORIES, DIFFICULTIES, type Move } from "@/lib/types";

type Card = Pick<Move, "id" | "slug" | "name" | "category" | "difficulty" | "counts">;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`cursor-pointer border px-3.5 py-2 font-mono text-[11px] tracking-[1px] uppercase select-none hover:border-blue ${
        active ? "border-blue bg-blue text-ink" : "border-line-strong text-body"
      }`}
    >
      {children}
    </button>
  );
}

export function MoveVault({ moves }: { moves: Card[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [diff, setDiff] = useState<string>("All");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return moves.filter(
      (m) =>
        (cat === "All" || m.category === cat) &&
        (diff === "All" || m.difficulty === diff) &&
        (!s || `${m.name} ${m.category} ${m.difficulty}`.toLowerCase().includes(s)),
    );
  }, [moves, q, cat, diff]);

  const label =
    filtered.length === moves.length ? `${moves.length} MOVES IN THE VAULT` : `${filtered.length} OF ${moves.length} MOVES`;

  return (
    <>
      <label htmlFor="vault-search" className="sr-only">
        Search the vault
      </label>
      <input
        id="vault-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="SEARCH THE VAULT…"
        className="mt-8 w-full border border-line-strong bg-card px-[18px] py-4 font-mono text-sm tracking-[1px] text-white focus:border-blue focus:outline-none"
      />

      <div className="mt-[18px] flex flex-wrap gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-0.5 font-mono text-[10px] tracking-[2px] text-muted">CATEGORY</span>
          {["All", ...CATEGORIES].map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-0.5 font-mono text-[10px] tracking-[2px] text-muted">LEVEL</span>
          {["All", ...DIFFICULTIES].map((d) => (
            <Chip key={d} active={diff === d} onClick={() => setDiff(d)}>
              {d}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-[26px] font-mono text-xs tracking-[1px] text-muted" aria-live="polite">
        {label}
      </div>

      {filtered.length ? (
        <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
          {filtered.map((m) => (
            <MoveCard key={m.id} move={m} />
          ))}
        </div>
      ) : (
        <div className="mt-3.5 border border-dashed border-line-strong p-12 text-center">
          <div className="font-display text-[28px] text-white">NOTHING IN THE VAULT MATCHES</div>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("All");
              setDiff("All");
            }}
            className="mt-3.5 inline-block cursor-pointer border border-blue px-4 py-[9px] font-mono text-xs text-blue hover:bg-blue/10"
          >
            CLEAR SEARCH + FILTERS
          </button>
        </div>
      )}
    </>
  );
}
