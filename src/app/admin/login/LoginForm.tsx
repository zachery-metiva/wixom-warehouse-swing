"use client";

import { useActionState } from "react";
import { signIn, type FormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-2 block font-mono text-[11px] tracking-[2px] text-[#8b8f99]">EMAIL</span>
        <input name="email" type="email" required autoComplete="username" className="field" />
      </label>
      <label className="block">
        <span className="mb-2 block font-mono text-[11px] tracking-[2px] text-[#8b8f99]">PASSWORD</span>
        <input name="password" type="password" required autoComplete="current-password" className="field" />
      </label>
      {state && !state.ok ? <p className="font-mono text-[11px] text-[#ff8a63]">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 min-h-[50px] cursor-pointer rounded-[2px] bg-blue text-[15px] font-bold text-ink hover:bg-blue-hover disabled:opacity-60"
      >
        {pending ? "SIGNING IN…" : "SIGN IN"}
      </button>
    </form>
  );
}
