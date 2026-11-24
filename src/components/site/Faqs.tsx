"use client";

import { useState } from "react";

export function Faqs({ faqs }: { faqs: { id: string; q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mt-5 flex max-w-[860px] flex-col border-b border-line">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.id} className="border-t border-line">
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-${f.id}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-5 px-1 py-5 text-left hover:bg-blue/[.03]"
              >
                <span className="text-[17px] font-bold text-white">{f.q}</span>
                <span className="flex-none font-mono text-lg text-blue" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div id={`faq-${f.id}`} hidden={!isOpen} className="max-w-[720px] px-1 pb-[22px] text-[15px] leading-[1.7] text-body">
              {f.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
