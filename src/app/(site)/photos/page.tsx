import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui";
import { getPhotos, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Photos",
  description: "Photos from past Tuesdays at Warehouse Swing in Wixom, MI.",
};

// Repeating mosaic from the design: big, small, tall, small, tall, small...
const SPANS = [
  "col-span-2 row-span-2",
  "",
  "row-span-2",
  "",
  "row-span-2",
  "",
  "col-span-2 row-span-2",
  "",
  "",
  "row-span-2",
  "",
  "col-span-2",
];

export default async function PhotosPage() {
  "use cache";
  const [photos, settings] = await Promise.all([getPhotos(), getSettings()]);
  const tiles = photos.length ? photos : Array.from({ length: 12 }, () => null);

  return (
    <div className="wrap pt-12 pb-[72px]">
      <PageHeader eyebrow="THE GALLERY" hi="FLOOR" lead="Tuesdays, as they happened.">
        FROM THE
      </PageHeader>

      <div className="mt-8 grid grid-flow-dense auto-rows-[110px] grid-cols-2 gap-2.5 min-[700px]:auto-rows-[150px] min-[700px]:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] min-[700px]:gap-3.5">
        {tiles.map((p, i) => (
          <div key={p?.id ?? i} className={`relative border border-line ${SPANS[i % SPANS.length]}`}>
            {p ? (
              <Image
                src={p.url}
                alt={p.caption || "Dancers at Warehouse Swing"}
                fill
                sizes="(max-width: 700px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="hatch h-full w-full" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3.5 border border-blue/40 bg-blue/5 px-6 py-5">
        <div className="text-sm text-strong">Got shots from a past Tuesday? We&apos;d love to add them.</div>
        <a
          href={`mailto:${settings.email}?subject=Photos%20from%20Tuesday`}
          className="border border-blue px-4 py-[9px] font-mono text-xs text-blue hover:bg-blue/10"
        >
          SEND US YOUR PHOTOS →
        </a>
      </div>
    </div>
  );
}
