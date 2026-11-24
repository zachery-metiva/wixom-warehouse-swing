"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/admin/actions";
import { browserClient } from "@/lib/supabase/browser";

type Action = (prev: FormState, form: FormData) => Promise<FormState>;

/** A form bound to a server action that shows a saved / error line. */
export function ActionForm({ action, children, className = "", submit = "SAVE" }: { action: Action; children: ReactNode; className?: string; submit?: string }) {
  const [state, run] = useActionState<FormState, FormData>(action, null);
  return (
    <form action={run} className={className}>
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <SaveButton label={submit} />
        {state ? (
          <span role="status" className={`font-mono text-[11px] tracking-[1px] ${state.ok ? "text-good" : "text-[#ff8a63]"}`}>
            {state.ok ? "✓ " : ""}
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function SaveButton({ label = "SAVE" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer rounded-[2px] bg-blue px-5 py-2.5 text-[13px] font-bold text-ink hover:bg-blue-hover disabled:opacity-60"
    >
      {pending ? "SAVING…" : label}
    </button>
  );
}

export function ConfirmButton({ label, confirm }: { label: string; confirm: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      className="cursor-pointer border border-line-strong px-3 py-2 font-mono text-[11px] tracking-[1px] text-muted hover:border-advanced hover:text-advanced"
    >
      {pending ? "…" : label}
    </button>
  );
}

/** Uploads an image straight from the browser to the public site-media bucket
 *  (storage policies only allow website editors), then fills a hidden input
 *  with its public URL for the surrounding form. */
export function ImageUpload({ name, initial, folder, label = "Upload image" }: { name: string; initial?: string | null; folder: string; label?: string }) {
  const [value, setValue] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErr("");
    if (!file.type.startsWith("image/")) return setErr("Choose an image file.");
    if (file.size > 10 * 1024 * 1024) return setErr("Images must be under 10 MB.");
    setBusy(true);
    try {
      const blob = await shrink(file, 2000);
      const ext = blob.type === "image/webp" ? "webp" : file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const sb = browserClient();
      const { error } = await sb.storage.from("site-media").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (error) throw error;
      setValue(sb.storage.from("site-media").getPublicUrl(path).data.publicUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <input type="hidden" name={name} value={value} />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-20 w-20 border border-line object-cover" />
      ) : (
        <div className="hatch h-20 w-20 border border-line" />
      )}
      <label className="cursor-pointer border border-line-strong px-3.5 py-2 font-mono text-[11px] tracking-[1px] text-body hover:border-blue hover:text-blue">
        {busy ? "UPLOADING…" : label.toUpperCase()}
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} disabled={busy} />
      </label>
      {value ? (
        <button type="button" onClick={() => setValue("")} className="cursor-pointer font-mono text-[11px] text-muted hover:text-advanced">
          REMOVE
        </button>
      ) : null}
      {err ? <span className="font-mono text-[11px] text-[#ff8a63]">{err}</span> : null}
    </div>
  );
}

/** Resize large photos in the browser before upload (keeps storage and page weight down). */
async function shrink(file: File, max: number): Promise<Blob> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b ?? file), "image/webp", 0.85));
}
