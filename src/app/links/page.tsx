import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/ui";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Links",
  description: "Warehouse Swing: RSVP, the weekly schedule, first-timer info, and where to find us.",
};

const utm = (url: string) => {
  if (!url || url.startsWith("mailto:")) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "links");
    return u.toString();
  } catch {
    return url;
  }
};

const primary = "flex min-h-14 w-full items-center justify-center gap-2.5 bg-blue text-center text-[15px] font-bold tracking-[.5px] text-ink hover:bg-blue-hover";
const secondary =
  "flex min-h-14 w-full items-center justify-center gap-2.5 border border-line-strong bg-card/85 text-center text-[15px] font-bold tracking-[.5px] text-white hover:border-blue hover:text-blue";

export default async function LinksPage() {
  "use cache";
  const s = await getSettings();
  const ext = [
    { label: "INSTAGRAM", href: s.links.instagram },
    { label: "FACEBOOK", href: s.links.facebook },
    { label: "JOIN THE DISCORD", href: s.links.discord },
  ].filter((l) => l.href);

  return (
    <main
      className="flex min-h-screen flex-col items-center px-6 pt-14 pb-11"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg,rgba(46,182,245,.045) 0,rgba(46,182,245,.045) 1px,transparent 1px,transparent 64px),repeating-linear-gradient(90deg,rgba(46,182,245,.045) 0,rgba(46,182,245,.045) 1px,transparent 1px,transparent 64px)",
      }}
    >
      <div className="flex w-full max-w-[400px] flex-col items-center">
        <Image src="/logo.png" alt="Warehouse Swing logo" width={108} height={108} priority className="h-[108px] w-[108px] border border-line object-cover" />
        <div className="mt-5">
          <Wordmark size={32} />
        </div>
        <div className="mt-2 text-center font-mono text-[11.5px] tracking-[2px] text-muted">WIXOM, MI · TUESDAYS 7:00–10:00 PM</div>

        <div className="mt-8 flex w-full flex-col gap-3">
          {s.links.meetup ? (
            <a href={utm(s.links.meetup)} target="_blank" rel="noopener noreferrer" className={primary}>
              RSVP ON MEETUP <span className="font-mono text-[13px]">↗</span>
            </a>
          ) : null}
          <Link href="/calendar" className={s.links.meetup ? secondary : primary}>
            THE WEEKLY SCHEDULE <span className="font-mono text-[13px]">→</span>
          </Link>
          <Link href="/faq" className={secondary}>
            FIRST TIME? WHAT TO EXPECT <span className="font-mono text-[13px]">→</span>
          </Link>
          <Link href="/moves" className={secondary}>
            LEARN THE MOVES <span className="font-mono text-[13px]">→</span>
          </Link>
          {s.links.waiver ? (
            <a href={utm(s.links.waiver)} className={secondary}>
              SIGN THE WAIVER <span className="font-mono text-[13px]">↗</span>
            </a>
          ) : null}
          {ext.map((l) => (
            <a key={l.label} href={utm(l.href)} target="_blank" rel="noopener noreferrer" className={secondary}>
              {l.label} <span className="font-mono text-[13px]">↗</span>
            </a>
          ))}
          <a href={`mailto:${s.email}`} className={secondary}>
            EMAIL US <span className="font-mono text-[13px]">↗</span>
          </a>
        </div>

        <Link href="/" className="mt-[30px] font-mono text-[11px] tracking-[2px] text-muted hover:text-blue">
          WAREHOUSESWING.COM →
        </Link>
        <div className="mt-2.5 font-mono text-[11px] tracking-[2px] text-line-strong">SEE YOU TUESDAY.</div>
      </div>
    </main>
  );
}
