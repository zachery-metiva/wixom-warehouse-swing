import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";

export async function GET() {
  const sb = await serverClient();
  const { data: ok } = await sb.rpc("site_is_editor");
  if (!ok) return new NextResponse("Forbidden", { status: 403 });
  const { data } = await sb.from("site_subscribers").select("email,status,source,created_at").eq("status", "active").order("created_at");
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = ["email,status,source,joined", ...(data ?? []).map((r) => [r.email, r.status, r.source, r.created_at].map(esc).join(","))].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="warehouse-swing-subscribers.csv"',
      "Cache-Control": "no-store",
    },
  });
}
