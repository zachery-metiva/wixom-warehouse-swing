import type { MetadataRoute } from "next";
import { getMoves } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warehouseswing.com";
  const pages = ["", "/calendar", "/moves", "/about", "/photos", "/faq", "/contact", "/links"].map((p) => ({ url: `${base}${p}` }));
  const moves = (await getMoves()).filter((m) => m.published).map((m) => ({ url: `${base}/moves/${m.slug}` }));
  return [...pages, ...moves];
}
