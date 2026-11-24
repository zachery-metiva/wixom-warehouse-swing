"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Dot, Wordmark } from "@/components/ui";

export const NAV = [
  { href: "/calendar", label: "Calendar" },
  { href: "/moves", label: "Moves" },
  { href: "/about", label: "About" },
  { href: "/photos", label: "Photos" },
  { href: "/faq", label: "FAQ", long: "FAQ + Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <Suspense fallback={<NavView path="" />}>
      <NavWithPath />
    </Suspense>
  );
}

function NavWithPath() {
  return <NavView path={usePathname()} />;
}

function NavView({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-[rgba(16,17,20,.92)] backdrop-blur-[8px]">
      <div className="flex items-center justify-between gap-[18px] px-[clamp(20px,4vw,40px)] py-4">
        <Link href="/" aria-label="Warehouse Swing home" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-[26px] min-[980px]:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className="flex items-center gap-[7px] text-sm text-body hover:text-white"
            >
              {active(n.href) ? <Dot /> : null}
              {n.label}
            </Link>
          ))}
        </div>
        <Link
          href="/faq"
          className="hidden rounded-[2px] bg-blue px-[18px] py-2.5 text-[13px] font-bold text-ink hover:bg-blue-hover min-[980px]:inline-block"
        >
          FIRST TIME? START HERE
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] border border-line-strong hover:border-blue min-[980px]:hidden"
        >
          {open ? (
            <span className="text-[19px] leading-none text-blue">✕</span>
          ) : (
            <>
              <span className="h-0.5 w-5 bg-white" />
              <span className="h-0.5 w-5 bg-white" />
              <span className="h-0.5 w-5 bg-blue" />
            </>
          )}
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full flex flex-col border-b border-line bg-[rgba(16,17,20,.97)] px-[clamp(20px,4vw,40px)] pt-1 pb-5 backdrop-blur-[10px] min-[980px]:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[52px] items-center gap-2.5 border-b border-hair text-[17px] font-medium text-white"
            >
              {active(n.href) ? <Dot size={7} /> : null}
              {n.long ?? n.label}
            </Link>
          ))}
          <Link
            href="/faq"
            onClick={() => setOpen(false)}
            className="mt-4 flex min-h-[50px] items-center justify-center bg-blue text-sm font-bold text-ink hover:bg-blue-hover"
          >
            FIRST TIME? START HERE
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
