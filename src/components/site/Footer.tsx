import Link from "next/link";
import { Wordmark } from "@/components/ui";
import type { SiteSettings } from "@/lib/types";

const SITE = [
  { href: "/calendar", label: "Calendar" },
  { href: "/moves", label: "Move Vault" },
  { href: "/about", label: "About" },
  { href: "/photos", label: "Photos" },
  { href: "/faq", label: "FAQ + Pricing" },
  { href: "/contact", label: "Contact" },
];

export function socialLinks(s: SiteSettings) {
  return [
    { label: "Meetup", href: s.links.meetup },
    { label: "Instagram", href: s.links.instagram },
    { label: "Facebook", href: s.links.facebook },
    { label: "Discord", href: s.links.discord },
  ].filter((l) => l.href);
}

export function Footer({ settings, year }: { settings: SiteSettings; year: string }) {
  const social = socialLinks(settings);
  return (
    <footer className="mt-auto border-t border-line bg-recess">
      <div className="wrap flex flex-wrap gap-10 pt-11">
        <div className="min-w-0 flex-[1_1_300px]">
          <Wordmark size={24} />
          <p className="mt-3 max-w-[320px] text-[13.5px] leading-[1.65] text-muted">
            Modern swing in Wixom, Michigan. Every Tuesday, 7–10 PM. No partner needed.
          </p>
        </div>
        <div>
          <div className="mb-3.5 font-mono text-[11px] tracking-[2px] text-muted">SITE</div>
          <div className="flex flex-col gap-[9px]">
            {SITE.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-body hover:text-blue">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3.5 font-mono text-[11px] tracking-[2px] text-muted">EVERY TUESDAY</div>
          <div className="flex flex-col gap-[9px] font-mono text-[12.5px] uppercase text-body">
            {settings.schedule.map((s) => (
              <span key={s.label}>
                {s.time.split(/[–-]/)[0]} {s.label}
              </span>
            ))}
          </div>
        </div>
        {social.length ? (
          <div>
            <div className="mb-3.5 font-mono text-[11px] tracking-[2px] text-muted">FOLLOW</div>
            <div className="flex flex-col gap-[9px]">
              {social.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-body hover:text-blue">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="wrap mt-6 flex flex-wrap justify-between gap-3 border-t border-hair py-[18px] font-mono text-[11px] text-muted">
        <span>© {year} WAREHOUSE SWING · WIXOM, MI</span>
        <span>SEE YOU TUESDAY.</span>
      </div>
    </footer>
  );
}
