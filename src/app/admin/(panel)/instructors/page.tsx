import { deleteInstructor, saveInstructor } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, ImageUpload } from "@/components/admin/forms";
import { AdminTitle, Area, Check, Field, Label, Panel } from "@/components/admin/fields";
import { requireEditor } from "@/lib/admin";
import type { Instructor } from "@/lib/types";

export const metadata = { title: "Instructors" };

function InstructorFields({ t }: { t?: Instructor }) {
  return (
    <>
      <div className="grid gap-x-4 sm:grid-cols-[1fr_1fr_100px]">
        <Field label="Name" name="name" defaultValue={t?.name} />
        <Field label="Role" name="role" defaultValue={t?.role ?? "Instructor"} placeholder="Lead instructor · Founder" />
        <Field label="Order" name="sort" type="number" defaultValue={t?.sort ?? 0} />
      </div>
      <Area label="Bio (a line or two)" name="bio" defaultValue={t?.bio} rows={2} />
      <div className="mb-4">
        <Label>Headshot</Label>
        <ImageUpload name="headshot_url" initial={t?.headshot_url} folder="instructors" label="Upload headshot" />
      </div>
      <Check label="Show on the About page" name="active" defaultChecked={t?.active ?? true} />
    </>
  );
}

export default async function InstructorsAdmin() {
  const sb = await requireEditor();
  const { data } = await sb.from("site_instructors").select("*").order("sort");
  const list = (data ?? []) as Instructor[];
  return (
    <>
      <AdminTitle kicker="ABOUT PAGE">INSTRUCTORS</AdminTitle>
      <div className="flex flex-col gap-3.5">
        {list.map((t) => (
          <Panel key={t.id}>
            <ActionForm action={saveInstructor}>
              <input type="hidden" name="id" value={t.id} />
              <InstructorFields t={t} />
            </ActionForm>
            <form action={deleteInstructor} className="mt-3 flex justify-end">
              <input type="hidden" name="id" value={t.id} />
              <ConfirmButton label="DELETE" confirm={`Remove ${t.name}?`} />
            </form>
          </Panel>
        ))}
        <Panel className="border-blue/40">
          <div className="mb-4 font-mono text-[10px] tracking-[2px] text-blue">ADD AN INSTRUCTOR</div>
          <ActionForm action={saveInstructor} submit="ADD">
            <InstructorFields />
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
