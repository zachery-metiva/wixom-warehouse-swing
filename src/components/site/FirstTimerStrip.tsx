"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export function FirstTimerStrip() {
  return (
    <Suspense fallback={<Strip />}>
      <StripWithPath />
    </Suspense>
  );
}

function StripWithPath() {
  return usePathname() === "/faq" ? null : <Strip />;
}

function Strip() {
  return (
    <Link href="/faq" className="flex flex-wrap items-center justify-center gap-3.5 bg-blue px-5 py-[9px] text-center">
      <span className="font-mono text-[11.5px] tracking-[1px] text-ink">
        FIRST TUESDAY? THE 7:30 BEGINNER LESSON GETS YOU DANCE-READY. NO PARTNER NEEDED.
      </span>
      <span className="text-xs font-bold text-ink underline underline-offset-[3px]">PLAN YOUR VISIT →</span>
    </Link>
  );
}
