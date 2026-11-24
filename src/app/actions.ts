"use server";

import { publicClient } from "@/lib/supabase/public";
import { supabaseConfigured } from "@/lib/supabase/env";

export type SubscribeState = { ok: boolean; message: string } | null;

export async function subscribe(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  const email = String(form.get("email") ?? "").trim();
  const source = String(form.get("source") ?? "website").slice(0, 40);
  // Honeypot: bots fill every field.
  if (form.get("company")) return { ok: true, message: "You're on the list. See you Tuesday." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return { ok: false, message: "That email doesn't look right." };
  }
  if (!supabaseConfigured) return { ok: false, message: "Signup is not connected yet." };
  const { error } = await publicClient().rpc("site_subscribe", { p_email: email, p_source: source });
  if (error) {
    console.error("[subscribe]", error);
    return { ok: false, message: "Something went wrong. Try again in a minute." };
  }
  return { ok: true, message: "You're on the list. See you Tuesday." };
}
