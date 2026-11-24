import Image from "next/image";
import { EventRow } from "@/components/site/EventRow";
import { MoveCard } from "@/components/site/MoveCard";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { ButtonLink, Heading, MonoLink } from "@/components/ui";
import { getMoves, getSettings, getUpcoming } from "@/lib/data";

export default async function Home() {
  "use cache";
  const [settings, { today, events }, moves] = await Promise.all([getSettings(), getUpcoming(3), getMoves()]);
  const live = moves.filter((m) => m.published);
  const featured = (live.some((m) => m.featured) ? live.filter((m) => m.featured) : live).slice(0, 4);

  return (
    <>
      {/* hero */}
      <section className="wrap blueprint flex flex-wrap items-center gap-12 py-[clamp(48px,6vw,80px)]">
        <div className="min-w-0 flex-[1_1_520px]">
          <div className="eyebrow mb-5 text-[13px]">WIXOM, MICHIGAN · EVERY TUESDAY NIGHT</div>
          <h1 className="display m-0 text-[clamp(60px,8.5vw,110px)] leading-[.92]">
            MODERN SWING.
            <br />
            <span className="text-blue">EVERY TUESDAY.</span>
          </h1>
          <p className="mt-6 max-w-[480px] text-lg leading-[1.6] text-body">{settings.tagline}</p>
          <div className="mt-9 flex flex-wrap gap-3.5">
            <ButtonLink href="/calendar" size="lg">
              SEE THE CALENDAR
            </ButtonLink>
            <ButtonLink href="/moves" size="lg" variant="secondary">
              LEARN THE MOVES
            </ButtonLink>
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_340px] items-center justify-center">
          <Image
            src="/logo.png"
            alt="Warehouse Swing logo"
            width={1200}
            height={675}
            priority
            className="block h-auto w-full max-w-[420px] border border-line"
          />
        </div>
      </section>

      {/* tuesday strip */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(230px,1fr))]">
          <div className="flex flex-col justify-center border-r border-line px-7 py-6">
            <div className="font-display text-[38px] leading-none text-blue">TUESDAYS</div>
            <div className="mt-1 font-mono text-xs text-muted">7:00 PM – 10:00 PM</div>
          </div>
          {settings.schedule.map((s, i) => (
            <div key={s.label} className={`px-7 py-6 ${i < settings.schedule.length - 1 ? "border-r border-line" : ""}`}>
              <div className="font-mono text-[13px] text-blue">{s.time.replace("–", " – ")}</div>
              <div className="mt-1.5 text-[17px] font-bold text-white">{s.label}</div>
              <div className="mt-1 text-[13px] text-body">{s.blurb}</div>
            </div>
          ))}
        </div>
      </section>

      {/* upcoming */}
      <section className="wrap py-16">
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
          <Heading hi="EVENTS" className="text-[clamp(38px,4.5vw,48px)]">
            UPCOMING
          </Heading>
          <MonoLink href="/calendar">FULL CALENDAR →</MonoLink>
        </div>
        <div className="flex flex-col border-b border-line">
          {events.map((ev) => (
            <EventRow key={ev.date} ev={ev} today={today} />
          ))}
        </div>
      </section>

      {/* move vault preview */}
      {featured.length ? (
        <section className="wrap pb-16">
          <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-4">
            <Heading hi="VAULT" className="text-[clamp(38px,4.5vw,48px)]">
              THE MOVE
            </Heading>
            <MonoLink href="/moves">BROWSE ALL MOVES →</MonoLink>
          </div>
          <p className="mb-7 max-w-[560px] text-[15px] text-body">
            Video breakdowns, counts, and the fixes for every mistake we see on the floor, from your first sugar push to workshop-only aerials.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {featured.map((m) => (
              <MoveCard key={m.id} move={m} tall />
            ))}
          </div>
        </section>
      ) : null}

      {/* about teaser + newsletter */}
      <section className="border-t border-line">
        <div className="wrap flex flex-wrap gap-10 py-14">
          <div className="min-w-0 flex-[1_1_380px]">
            <Heading hi="WIXOM" className="text-[40px]">
              BUILT IN
            </Heading>
            <p className="mt-3.5 max-w-[440px] text-[15px] leading-[1.7] text-body">
              Warehouse Swing is a modern swing community in Wixom, Michigan. Every Tuesday we open the floor for lessons and social dancing: beginners,
              veterans, and everyone in between.
            </p>
            <MonoLink href="/about" className="mt-[18px] inline-block">
              OUR STORY + INSTRUCTORS →
            </MonoLink>
          </div>
          <div className="min-w-0 flex-[1_1_380px] border border-line bg-card p-7">
            <div className="font-display text-[26px] text-white">GET THE WEEKLY RUNDOWN</div>
            <div className="mt-1.5 mb-[18px] text-[13px] text-body">One email a week. Events, playlists, and the move of the week.</div>
            <NewsletterForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
}
