import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DiffTag, PlayBadge, Tag } from "@/components/ui";
import { getMoves } from "@/lib/data";
import { DIFF_COLOR, type Move } from "@/lib/types";

export async function generateStaticParams() {
  const moves = await getMoves();
  const live = moves.filter((m) => m.published);
  // At least one param is required for a prerendered dynamic route.
  return live.length ? live.map((m) => ({ slug: m.slug })) : [{ slug: "sugar-push" }];
}

async function findMove(slug: string) {
  const moves = (await getMoves()).filter((m) => m.published);
  const move = moves.find((m) => m.slug === slug);
  return { move, moves };
}

export async function generateMetadata({ params }: PageProps<"/moves/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { move } = await findMove(slug);
  if (!move) return { title: "Move not found" };
  return { title: `${move.name} · Move Vault`, description: move.summary };
}

function videoEmbed(url: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function LinkList({ title, moves }: { title: string; moves: Move[] }) {
  if (!moves.length) return null;
  return (
    <div className="border border-line p-6">
      <div className="font-mono text-[11px] tracking-[2px] text-muted">{title}</div>
      <div className="mt-3 flex flex-col gap-2">
        {moves.map((m) => (
          <Link
            key={m.id}
            href={`/moves/${m.slug}`}
            className="flex items-center justify-between gap-2.5 border border-line-strong px-3.5 py-[11px] hover:border-blue"
          >
            <span className="text-sm font-medium text-white">{m.name}</span>
            <span className="font-mono text-[10px] uppercase" style={{ color: DIFF_COLOR[m.difficulty] }}>
              {m.difficulty}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function MovePage({ params }: PageProps<"/moves/[slug]">) {
  const { slug } = await params;
  return <MoveDetail slug={slug} />;
}

async function MoveDetail({ slug }: { slug: string }) {
  "use cache";
  const { move, moves } = await findMove(slug);
  if (!move) notFound();
  const prereqs = move.prereqs.map((id) => moves.find((m) => m.id === id)).filter((m): m is Move => Boolean(m));
  const unlocks = moves.filter((m) => m.prereqs.includes(move.id));
  const embed = videoEmbed(move.video_url);

  return (
    <div className="wrap pt-10 pb-[72px]">
      <Link href="/moves" className="font-mono text-xs tracking-[1px] text-muted hover:text-blue">
        ← ALL MOVES
      </Link>

      <div className="mt-[18px] flex flex-wrap items-end justify-between gap-5">
        <h1 className="display m-0 text-[clamp(52px,7vw,84px)]">{move.name}</h1>
        <div className="flex flex-wrap gap-2 pb-2">
          <DiffTag d={move.difficulty} />
          <Tag>{move.category}</Tag>
          <Tag>{move.counts} counts</Tag>
        </div>
      </div>
      <p className="mt-4 max-w-[680px] text-[17px] leading-[1.6] text-body">{move.summary}</p>

      <div className="mt-8 flex flex-wrap items-start gap-7">
        <div className="min-w-0 flex-[1_1_600px]">
          {embed ? (
            <div className="aspect-video border border-line">
              <iframe
                src={embed}
                title={`${move.name} demo video`}
                className="h-full w-full"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className="flex aspect-video flex-col items-center justify-center gap-3.5 border border-line"
              style={{ background: "repeating-linear-gradient(45deg,#1a1c21 0,#1a1c21 12px,#15161a 12px,#15161a 24px)" }}
            >
              <PlayBadge size={64} />
              <div className="font-mono text-[11px] tracking-[1px] text-muted">DEMO VIDEO COMING SOON</div>
            </div>
          )}

          {move.steps.length ? (
            <section className="mt-9">
              <h2 className="display m-0 text-[30px]">
                HOW IT <span className="text-blue">WORKS</span>
              </h2>
              <ol className="m-0 mt-2.5 flex list-none flex-col p-0">
                {move.steps.map((s, i) => (
                  <li key={i} className="grid grid-cols-[44px_1fr] gap-4 border-b border-line py-4">
                    <span className="font-display text-[26px] leading-none text-blue">{i + 1}</span>
                    <span className="text-[15px] leading-[1.65] text-strong">{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {move.mistakes.length ? (
            <section className="mt-9">
              <h2 className="display m-0 text-[30px]">
                COMMON <span className="text-advanced">MISTAKES</span>
              </h2>
              <div className="mt-3.5 flex flex-col gap-3.5">
                {move.mistakes.map((mk, i) => (
                  <div key={i} className="border border-line bg-card px-5 py-[18px]">
                    <div className="flex items-baseline gap-3">
                      <span className="flex-none font-mono text-[13px] text-advanced" aria-label="Mistake">
                        ✗
                      </span>
                      <span className="text-[15px] font-medium leading-normal text-white">{mk.w}</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="flex-none font-mono text-[11px] text-blue">FIX</span>
                      <span className="text-sm leading-[1.55] text-body">{mk.f}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="flex min-w-[280px] flex-[1_1_300px] flex-col min-[980px]:flex-[0_1_320px] gap-4">
          {move.count_rows.length ? (
            <div className="border border-line bg-card p-6">
              <div className="font-mono text-[11px] tracking-[2px] text-muted">THE COUNTS</div>
              <div className="mt-1.5 flex flex-col">
                {move.count_rows.map((r, i) => (
                  <div key={i} className="grid grid-cols-[64px_1fr] items-baseline gap-3 border-b border-line py-[11px]">
                    <span className="font-mono text-[13px] text-blue">{r.c}</span>
                    <span className="text-[13.5px] leading-[1.45] text-strong">{r.t}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <LinkList title="LEARN THESE FIRST" moves={prereqs} />
          <LinkList title="THIS UNLOCKS" moves={unlocks} />
          <div className="border border-blue/40 bg-blue/5 px-6 py-5">
            <div className="font-mono text-[11px] tracking-[2px] text-blue">DRILL IT</div>
            <div className="mt-2 text-[13.5px] leading-[1.6] text-strong">
              Ask any instructor to run this with you during the social. That&apos;s what Tuesdays are for.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
