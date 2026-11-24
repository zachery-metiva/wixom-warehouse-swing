import type { ReactNode } from "react";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block font-mono text-[11px] tracking-[2px] text-[#8b8f99] uppercase">
      {children}
    </label>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  hint,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  const id = `f-${name}-${Math.abs(hash(String(defaultValue ?? "") + label))}`;
  return (
    <div className="mb-4">
      <Label htmlFor={id}>{label}</Label>
      <input id={id} name={name} type={type} defaultValue={defaultValue ?? ""} placeholder={placeholder} required={required} className="field" />
      {hint ? <p className="mt-1.5 font-mono text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function Area({ label, name, defaultValue, rows = 4, hint, placeholder }: { label: string; name: string; defaultValue?: string | null; rows?: number; hint?: string; placeholder?: string }) {
  const id = `a-${name}-${Math.abs(hash(String(defaultValue ?? "") + label))}`;
  return (
    <div className="mb-4">
      <Label htmlFor={id}>{label}</Label>
      <textarea id={id} name={name} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} className="field leading-[1.5]" />
      {hint ? <p className="mt-1.5 font-mono text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function Select({ label, name, options, defaultValue }: { label: string; name: string; options: readonly string[]; defaultValue?: string }) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      <select name={name} defaultValue={defaultValue} aria-label={label} className="field bg-ink">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-strong">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#2eb6f5]" />
      {label}
    </label>
  );
}

export function AdminTitle({ kicker, children, actions }: { kicker: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="font-mono text-[11px] tracking-[3px] text-blue">{kicker}</div>
        <h1 className="display mt-2 text-[42px] leading-none">{children}</h1>
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`border border-line bg-ink p-6 ${className}`}>{children}</section>;
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
