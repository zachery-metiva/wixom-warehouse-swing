import type { Metadata } from "next";
import { socialLinks } from "@/components/site/Footer";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { PageHeader } from "@/components/ui";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email Warehouse Swing, find us on Meetup and social, and get directions to the Warehouse in Wixom, MI.",
};

const HANDLE: Record<string, string> = {
  Meetup: "RSVP + ADDRESS →",
  Instagram: "@WAREHOUSESWING →",
  Facebook: "WAREHOUSE SWING →",
  Discord: "JOIN THE SERVER →",
};

export default async function ContactPage() {
  "use cache";
  const s = await getSettings();
  const social = socialLinks(s);

  return (
    <div className="wrap pt-12 pb-[72px]">
      <PageHeader eyebrow="GET IN TOUCH" hi="HELLO">
        SAY
      </PageHeader>

      <div className="mt-9 flex flex-wrap items-stretch gap-7">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4">
          <a href={`mailto:${s.email}`} className="block border border-line bg-card p-[26px] hover:border-blue">
            <div className="font-mono text-[11px] tracking-[2px] text-muted">EMAIL</div>
            <div className="mt-2 text-[clamp(18px,2.4vw,24px)] font-bold break-all text-blue">{s.email}</div>
          </a>
          {social.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-line px-[26px] py-5 hover:border-blue"
            >
              <span className="text-base font-bold text-white">{l.label}</span>
              <span className="font-mono text-xs text-blue">{HANDLE[l.label]}</span>
            </a>
          ))}
        </div>

        <div className="flex min-w-0 flex-[1_1_420px] flex-col border border-line bg-card">
          <a
            href={s.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-[240px] flex-1 flex-col items-center justify-center gap-2.5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,#1a1c21 0,#1a1c21 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#1a1c21 0,#1a1c21 1px,transparent 1px,transparent 40px)",
            }}
          >
            <span
              aria-hidden
              className="h-4 w-4 rounded-full bg-blue"
              style={{ boxShadow: "0 0 0 6px rgba(46,182,245,.2), 0 0 0 14px rgba(46,182,245,.08)" }}
            />
            <span className="font-mono text-[11px] tracking-[1px] text-muted group-hover:text-blue">OPEN IN GOOGLE MAPS ↗</span>
          </a>
          <div className="border-t border-line p-6">
            <div className="text-[17px] font-bold text-white">{s.locationName}, Wixom, Michigan</div>
            <div className="mt-1.5 text-[13.5px] leading-[1.6] text-body">{s.locationNote}</div>
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-5 border border-line bg-card p-7">
        <div className="min-w-[240px]">
          <div className="font-display text-[26px] text-white">GET THE WEEKLY RUNDOWN</div>
          <div className="mt-1 text-[13px] text-body">One email a week. Events, playlists, and the move of the week.</div>
        </div>
        <div className="flex flex-[1_1_320px]">
          <NewsletterForm source="contact" align="end" />
        </div>
      </div>
    </div>
  );
}
