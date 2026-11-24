import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { DIFF_COLOR, type Difficulty } from "@/lib/types";

export function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-display text-white" style={{ fontSize: size, letterSpacing: 2 }}>
        WAREHOUSE
      </span>
      <span className="font-wordmark text-blue" style={{ fontSize: size * 0.92 }}>
        SWING
      </span>
    </span>
  );
}

type BtnProps = ComponentProps<typeof Link> & { variant?: "primary" | "secondary"; size?: "md" | "lg" };

export function ButtonLink({ variant = "primary", size = "md", className = "", ...rest }: BtnProps) {
  const pad = size === "lg" ? "px-7 py-4 text-[15px]" : "px-[18px] py-2.5 text-[13px]";
  const look =
    variant === "primary"
      ? "bg-blue text-ink hover:bg-blue-hover"
      : "border border-line-strong text-white hover:border-blue hover:text-blue";
  return <Link className={`inline-block rounded-[2px] font-bold uppercase ${pad} ${look} ${className}`} {...rest} />;
}

/** Display heading with one blue keyword: <Heading hi="EVENTS">UPCOMING</Heading> */
export function Heading({
  as: Tag = "h2",
  children,
  hi,
  className = "",
}: {
  as?: "h1" | "h2" | "h3";
  children?: ReactNode;
  hi?: ReactNode;
  className?: string;
}) {
  return (
    <Tag className={`display m-0 ${className}`}>
      {children}
      {hi ? (
        <>
          {children ? " " : null}
          <span className="text-blue">{hi}</span>
        </>
      ) : null}
    </Tag>
  );
}

export function PageHeader({ eyebrow, children, hi, lead }: { eyebrow: string; children?: ReactNode; hi?: ReactNode; lead?: ReactNode }) {
  return (
    <header>
      <div className="eyebrow">{eyebrow}</div>
      <Heading as="h1" hi={hi} className="mt-2 text-[clamp(48px,6vw,72px)] leading-none">
        {children}
      </Heading>
      {lead ? <p className="mt-3 max-w-[620px] text-base text-body">{lead}</p> : null}
    </header>
  );
}

export function MonoLink({ className = "", ...rest }: ComponentProps<typeof Link>) {
  return <Link className={`font-mono text-[13px] tracking-[1px] text-blue hover:text-blue-hover ${className}`} {...rest} />;
}

export function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-block border px-2 py-[3px] font-mono text-[10px] uppercase"
      style={color ? { color, borderColor: color } : { color: "var(--ws-text-muted)", borderColor: "var(--ws-line-strong)" }}
    >
      {children}
    </span>
  );
}

export function DiffTag({ d }: { d: Difficulty }) {
  return <Tag color={DIFF_COLOR[d]}>{d}</Tag>;
}

export function PlayBadge({ size = 44 }: { size?: number }) {
  const tri = size * 0.27;
  return (
    <span
      aria-hidden
      className="flex items-center justify-center rounded-full border border-line-strong bg-ink/60"
      style={{ width: size, height: size }}
    >
      <span
        style={{
          width: 0,
          height: 0,
          borderLeft: `${tri}px solid var(--ws-blue)`,
          borderTop: `${tri * 0.58}px solid transparent`,
          borderBottom: `${tri * 0.58}px solid transparent`,
          marginLeft: 3,
        }}
      />
    </span>
  );
}

export function Dot({ size = 6, className = "" }: { size?: number; className?: string }) {
  return <span aria-hidden className={`inline-block flex-none rounded-full bg-blue ${className}`} style={{ width: size, height: size }} />;
}
