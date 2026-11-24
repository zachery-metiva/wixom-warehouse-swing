import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink, Heading } from "@/components/ui";
import { getInstructors, getPhotos } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description: "Warehouse Swing is a modern swing community in Wixom, Michigan. Meet the instructors and learn what modern swing is.",
};

function Placeholder({ label }: { label: string }) {
  return (
    <div className="hatch flex h-full w-full items-center justify-center">
      <span className="font-mono text-[11px] tracking-[1px] text-muted">{label}</span>
    </div>
  );
}

export default async function AboutPage() {
  "use cache";
  const [instructors, photos] = await Promise.all([getInstructors(), getPhotos()]);
  const hero = photos[0];

  return (
    <>
      <div className="wrap pt-12 pb-16">
        <div className="eyebrow">WHO WE ARE</div>
        <div className="mt-2 flex flex-wrap items-start gap-12">
          <div className="min-w-0 flex-[1_1_460px]">
            <Heading as="h1" hi="WIXOM" className="text-[clamp(48px,6vw,72px)] leading-none">
              BUILT IN
            </Heading>
            <p className="mt-5 text-base leading-[1.75] text-body">
              Warehouse Swing started with a speaker, a concrete floor, and a handful of dancers who wanted a regular Tuesday night. It grew into a weekly
              social that draws dancers from all over southeast Michigan, and keeps its doors wide open to people who have never danced a step.
            </p>
            <p className="mt-4 text-base leading-[1.75] text-body">
              The rule of the floor is simple: anyone can ask anyone to dance, and every level dances with every level. Show up three Tuesdays in a row
              and you&apos;ll know half the room by name.
            </p>
          </div>
          <div className="relative h-[340px] min-w-[280px] flex-[1_1_380px] border border-line">
            {hero ? (
              <Image src={hero.url} alt={hero.caption || "Dancers at Warehouse Swing"} fill sizes="(max-width: 900px) 100vw, 600px" className="object-cover" />
            ) : (
              <Placeholder label="PHOTO OF THE FLOOR COMING SOON" />
            )}
          </div>
        </div>
      </div>

      <section className="border-y border-line bg-card">
        <div className="wrap flex flex-wrap items-baseline gap-8 py-10">
          <h2 className="display m-0 flex-none text-[32px]">
            WHAT IS <span className="text-blue">MODERN SWING?</span>
          </h2>
          <p className="m-0 flex-[1_1_420px] text-[15px] leading-[1.7] text-body">
            A smooth, slotted partner dance that grew out of swing, danced to the music you actually listen to: pop, R&amp;B, blues. It&apos;s improvised,
            not choreographed: leads and follows build every dance together, one count at a time.
          </p>
        </div>
      </section>

      {instructors.length ? (
        <section className="wrap pt-14 pb-6">
          <Heading hi="INSTRUCTORS" className="text-[clamp(36px,4.5vw,46px)]">
            THE
          </Heading>
          <div className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
            {instructors.map((t) => (
              <article key={t.id} className="border border-line bg-card">
                <div className="relative h-[260px]">
                  {t.headshot_url ? (
                    <Image src={t.headshot_url} alt={t.name} fill sizes="(max-width: 700px) 100vw, 400px" className="object-cover" />
                  ) : (
                    <Placeholder label="HEADSHOT COMING SOON" />
                  )}
                </div>
                <div className="px-5 py-[18px]">
                  <div className="text-lg font-bold text-white">{t.name}</div>
                  <div className="mt-1 font-mono text-[11px] tracking-[1px] text-blue uppercase">{t.role}</div>
                  {t.bio ? <p className="mt-2.5 text-[13.5px] leading-[1.6] text-body">{t.bio}</p> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="wrap pt-10 pb-[72px]">
        <div className="flex flex-wrap items-center justify-between gap-5 border border-line bg-card p-7">
          <div>
            <Heading hi="FLOOR" className="text-[28px]">
              FROM THE
            </Heading>
            <div className="mt-1 text-sm text-body">Photos from past Tuesdays: the floor, the people, the dips that landed.</div>
          </div>
          <ButtonLink href="/photos" className="px-6 py-3.5 text-sm">
            SEE THE PHOTOS →
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
