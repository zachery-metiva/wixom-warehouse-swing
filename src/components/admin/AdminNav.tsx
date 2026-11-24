"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/admin/actions";
import { Wordmark } from "@/components/ui";

const ITEMS = [
  { href: "/admin", label: "DASHBOARD" },
  { href: "/admin/events", label: "EVENTS" },
  { href: "/admin/moves", label: "MOVES" },
  { href: "/admin/faqs", label: "FAQS" },
  { href: "/admin/instructors", label: "INSTRUCTORS" },
  { href: "/admin/photos", label: "PHOTOS" },
  { href: "/admin/subscribers", label: "SUBSCRIBERS" },
  { href: "/admin/settings", label: "SETTINGS" },
];

export function AdminNav() {
  return (
    <Suspense fallback={<AdminNavView path="" />}>
      <AdminNavWithPath />
    </Suspense>
  );
}

function AdminNavWithPath() {
  return <AdminNavView path={usePathname()} />;
}

function AdminNavView({ path }: { path: string }) {
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <aside className="flex flex-none flex-col border-b border-line bg-ink md:sticky md:top-0 md:h-screen md:w-56 md:border-r md:border-b-0">
      <div className="border-b border-line px-5 pt-[22px] pb-5">
        <Link href="/admin">
          <Wordmark size={20} />
        </Link>
      </div>
      <nav className="flex gap-0.5 overflow-x-auto px-3 py-2 md:flex-col md:py-3">
        {ITEMS.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={`border-l-2 px-3 py-2.5 font-mono text-[11px] tracking-[2px] whitespace-nowrap hover:bg-card hover:text-white ${
              active(i.href) ? "border-blue bg-card text-white" : "border-transparent text-[#8b8f99]"
            }`}
          >
            {i.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto hidden flex-col md:flex">
        <a href="/" target="_blank" className="border-t border-line px-5 py-3.5 font-mono text-[10px] tracking-[2px] text-muted hover:text-blue">
          VIEW LIVE SITE ↗
        </a>
        <form action={signOut} className="border-t border-line px-5 py-3.5">
          <button type="submit" className="cursor-pointer font-mono text-[10px] tracking-[2px] text-muted hover:text-blue">
            SIGN OUT
          </button>
        </form>
      </div>
    </aside>
  );
}
