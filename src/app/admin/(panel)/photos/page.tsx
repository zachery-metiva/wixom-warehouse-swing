import { addPhoto, deletePhoto, savePhoto } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, ImageUpload } from "@/components/admin/forms";
import { AdminTitle, Field, Label, Panel } from "@/components/admin/fields";
import { requireEditor } from "@/lib/admin";
import { todayIso } from "@/lib/dates";
import type { Photo } from "@/lib/types";

export const metadata = { title: "Photos" };

export default async function PhotosAdmin() {
  const sb = await requireEditor();
  const { data } = await sb.from("site_photos").select("*").order("sort").order("taken_on", { ascending: false });
  const photos = (data ?? []) as Photo[];

  return (
    <>
      <AdminTitle kicker="FROM THE FLOOR">PHOTOS</AdminTitle>
      <Panel className="mb-6 border-blue/40">
        <div className="mb-4 font-mono text-[10px] tracking-[2px] text-blue">ADD A PHOTO</div>
        <ActionForm action={addPhoto} submit="ADD TO GALLERY">
          <div className="mb-4">
            <Label>Photo</Label>
            <ImageUpload name="url" folder="gallery" label="Choose photo" />
          </div>
          <div className="grid gap-x-4 sm:grid-cols-[2fr_1fr_100px]">
            <Field label="Caption (also used as alt text)" name="caption" placeholder="Dips at the end of the night" />
            <Field label="Taken on" name="taken_on" type="date" defaultValue={todayIso()} />
            <Field label="Order" name="sort" type="number" defaultValue={0} />
          </div>
        </ActionForm>
        <p className="mt-3 font-mono text-[11px] text-muted">
          The first photo also appears on the About page. Get permission from anyone clearly identifiable before posting.
        </p>
      </Panel>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
        {photos.map((p) => (
          <div key={p.id} className="border border-line bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption} className="aspect-[4/3] w-full object-cover" />
            <div className="p-4">
              <ActionForm action={savePhoto}>
                <input type="hidden" name="id" value={p.id} />
                <Field label="Caption" name="caption" defaultValue={p.caption} />
                <div className="grid grid-cols-[1fr_90px] gap-x-3">
                  <Field label="Taken on" name="taken_on" type="date" defaultValue={p.taken_on} />
                  <Field label="Order" name="sort" type="number" defaultValue={p.sort} />
                </div>
              </ActionForm>
              <form action={deletePhoto} className="mt-3 flex justify-end">
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton label="DELETE" confirm="Delete this photo?" />
              </form>
            </div>
          </div>
        ))}
      </div>
      {photos.length === 0 ? <p className="text-sm text-body">No photos yet. The public gallery shows placeholder tiles until you add some.</p> : null}
    </>
  );
}
