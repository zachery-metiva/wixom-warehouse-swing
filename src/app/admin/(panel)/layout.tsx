import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1 px-[clamp(16px,3vw,40px)] pt-8 pb-16">
        <Suspense fallback={<div className="font-mono text-xs tracking-[2px] text-muted">LOADING…</div>}>{children}</Suspense>
      </div>
    </div>
  );
}
