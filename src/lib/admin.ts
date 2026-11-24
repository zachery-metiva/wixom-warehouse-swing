import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "./supabase/server";

/** Returns a Supabase client for a signed-in staff member allowed to edit the
 *  website, or redirects to the login page. Call at the top of every admin page
 *  and server action. */
export async function requireEditor() {
  const sb = await serverClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/admin/login");
  const { data: ok } = await sb.rpc("site_is_editor");
  if (!ok) redirect("/admin/login?error=forbidden");
  return Object.assign(sb, { userEmail: auth.user.email ?? "" });
}

/** Lines of "left | right" text <-> objects, used by the move editor. */
export function parsePairs<K extends string>(text: string, a: K, b: K) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("|");
      const left = (i === -1 ? l : l.slice(0, i)).trim();
      const right = (i === -1 ? "" : l.slice(i + 1)).trim();
      return { [a]: left, [b]: right } as Record<K, string>;
    });
}

export function str(form: FormData, key: string, max = 5000) {
  return String(form.get(key) ?? "")
    .trim()
    .slice(0, max);
}

export function num(form: FormData, key: string, fallback = 0) {
  const n = Number(form.get(key));
  return Number.isFinite(n) ? n : fallback;
}

export function bool(form: FormData, key: string) {
  return form.get(key) === "on" || form.get(key) === "true";
}

export function url(form: FormData, key: string): string | null {
  const v = str(form, key, 500);
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
