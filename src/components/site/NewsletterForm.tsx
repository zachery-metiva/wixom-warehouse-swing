"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeState } from "@/app/actions";

export function NewsletterForm({ source, align = "start" }: { source: string; align?: "start" | "end" }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, null);
  return (
    <form action={action} className={`flex flex-1 flex-wrap gap-2.5 ${align === "end" ? "justify-end" : ""}`}>
      <input type="hidden" name="source" value={source} />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="sr-only" htmlFor={`email-${source}`}>
        Email address
      </label>
      <input
        id={`email-${source}`}
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="min-w-[180px] flex-1 border border-line-strong bg-transparent px-4 py-[13px] font-mono text-[13px] text-white focus:border-blue focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer bg-blue px-5 py-[13px] text-[13px] font-bold text-ink hover:bg-blue-hover disabled:opacity-60"
      >
        {pending ? "SIGNING UP…" : "SIGN UP"}
      </button>
      {state ? (
        <p role="status" className={`w-full font-mono text-[11px] tracking-[1px] ${state.ok ? "text-blue" : "text-[#ff8a63]"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
