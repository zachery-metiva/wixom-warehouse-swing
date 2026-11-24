import type { Metadata } from "next";
import { Faqs } from "@/components/site/Faqs";
import { Heading, PageHeader } from "@/components/ui";
import { getFaqs, getPricing, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "First Tuesday? Start here",
  description: "What to expect on your first night at Warehouse Swing, what it costs, and answers to common questions.",
};

export default async function FaqPage() {
  "use cache";
  const [faqs, pricing, settings] = await Promise.all([getFaqs(), getPricing(), getSettings()]);
  const door = `$${pricing.door}`;

  const steps = [
    { t: "7:20", h: "Walk in", p: `Say hi at the door, pay ${door}, sign the waiver if it's your first night, change shoes if you brought them.` },
    { t: "7:30", h: "Beginner lesson", p: "Fifteen minutes, rotating partners: everything you need for your first social." },
    { t: "7:45", h: "Social dance", p: "Open floor until 10. Anyone can ask anyone, including you." },
    { t: "NEXT TUE", h: "Come back", p: "Three Tuesdays in and you'll know half the room by name." },
  ];

  const tiers = [
    { k: "DROP-IN", price: door, unit: "/ NIGHT", body: "Both lessons and the full social. Pay at the door, cash or card.", main: true },
    settings.monthlyPass.enabled
      ? { k: "MONTHLY PASS", price: `$${settings.monthlyPass.price}`, unit: settings.monthlyPass.label, body: "A month of Tuesdays at a discount. Grab one at the door." }
      : null,
    pricing.student != null
      ? { k: "STUDENTS", price: `$${pricing.student}`, unit: "/ NIGHT W/ ID", body: "Student discount every week. Bring your school ID." }
      : null,
  ].filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="wrap pt-12 pb-[72px]">
      <PageHeader eyebrow="NEW HERE?" hi="START HERE.">
        FIRST TUESDAY?
      </PageHeader>

      <div className="mt-9 flex flex-wrap gap-px border border-line bg-line">
        {steps.map((s) => (
          <div key={s.t} className="min-w-0 flex-[1_1_230px] bg-card p-6">
            <div className="font-display text-[30px] text-blue">{s.t}</div>
            <div className="mt-1.5 text-base font-bold text-white">{s.h}</div>
            <div className="mt-[5px] text-[13.5px] leading-[1.6] text-body">{s.p}</div>
          </div>
        ))}
      </div>

      <Heading hi="COSTS" className="mt-14 text-[clamp(36px,4.5vw,46px)]">
        WHAT IT
      </Heading>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {tiers.map((t) => (
          <div key={t.k} className={`border p-7 ${t.main ? "border-blue bg-blue/[.04]" : "border-line bg-card"}`}>
            <div className={`font-mono text-[11px] tracking-[2px] ${t.main ? "text-blue" : "text-muted"}`}>{t.k}</div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-display text-[54px] leading-none text-white">{t.price}</span>
              <span className="font-mono text-xs text-muted">{t.unit}</span>
            </div>
            <div className="mt-3 text-sm leading-[1.65] text-body">{t.body}</div>
          </div>
        ))}
      </div>

      <Heading hi="ANSWERED" className="mt-14 text-[clamp(36px,4.5vw,46px)]">
        QUESTIONS,
      </Heading>
      <Faqs faqs={faqs.map((f) => ({ id: f.id, q: f.question, a: f.answer.replaceAll("{door}", door) }))} />
    </div>
  );
}
