import { saveMove } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/forms";
import { Area, Check, Field, Label, Panel, Select } from "@/components/admin/fields";
import { CATEGORIES, DIFFICULTIES, type Move } from "@/lib/types";

type Option = { id: string; name: string };

export function MoveForm({ move, options }: { move?: Move; options: Option[] }) {
  return (
    <ActionForm action={saveMove} submit={move ? "SAVE MOVE" : "CREATE MOVE"}>
      <input type="hidden" name="id" value={move?.id ?? ""} />
      <div className="grid gap-3.5 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Field label="Name" name="name" defaultValue={move?.name} required />
            <Field label="URL slug" name="slug" defaultValue={move?.slug} hint="Leave blank to make one from the name." />
            <Select label="Category" name="category" options={CATEGORIES} defaultValue={move?.category ?? "Basics"} />
            <Select label="Level" name="difficulty" options={DIFFICULTIES} defaultValue={move?.difficulty ?? "Beginner"} />
            <Field label="Counts" name="counts" type="number" defaultValue={move?.counts ?? 6} />
            <Field label="Sort order" name="sort" type="number" defaultValue={move?.sort ?? 0} hint="Lower numbers show first." />
          </div>
          <Area label="Summary" name="summary" defaultValue={move?.summary} rows={3} />
          <Area label="How it works (one step per line)" name="steps" defaultValue={move?.steps.join("\n")} rows={6} />
          <Area
            label="The counts (count | what happens)"
            name="count_rows"
            defaultValue={move?.count_rows.map((r) => `${r.c} | ${r.t}`).join("\n")}
            rows={4}
            placeholder={"1–2 | Walk, walk\n3&4 | Triple step"}
          />
          <Area
            label="Common mistakes (mistake | fix)"
            name="mistakes"
            defaultValue={move?.mistakes.map((m) => `${m.w} | ${m.f}`).join("\n")}
            rows={5}
          />
        </Panel>
        <div className="flex flex-col gap-3.5">
          <Panel>
            <Field label="Video link (YouTube or Vimeo)" name="video_url" type="url" defaultValue={move?.video_url} placeholder="https://youtu.be/…" />
            <Check label="Published on the site" name="published" defaultChecked={move?.published ?? true} />
            <Check label="Featured on the home page" name="featured" defaultChecked={move?.featured ?? false} />
          </Panel>
          <Panel>
            <Label>Learn these first</Label>
            <div className="grid max-h-[340px] gap-1.5 overflow-y-auto">
              {options
                .filter((o) => o.id !== move?.id)
                .map((o) => (
                  <label key={o.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-strong">
                    <input type="checkbox" name="prereqs" value={o.id} defaultChecked={move?.prereqs.includes(o.id)} className="h-4 w-4 accent-[#2eb6f5]" />
                    {o.name}
                  </label>
                ))}
            </div>
          </Panel>
        </div>
      </div>
    </ActionForm>
  );
}
