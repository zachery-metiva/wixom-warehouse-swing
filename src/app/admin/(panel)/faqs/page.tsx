import { deleteFaq, saveFaq } from "@/app/admin/actions";
import { ActionForm, ConfirmButton } from "@/components/admin/forms";
import { AdminTitle, Area, Check, Field, Panel } from "@/components/admin/fields";
import { requireEditor } from "@/lib/admin";
import type { Faq } from "@/lib/types";

export const metadata = { title: "FAQs" };

export default async function FaqsAdmin() {
  const sb = await requireEditor();
  const { data } = await sb.from("site_faqs").select("*").order("sort");
  const faqs = (data ?? []) as Faq[];
  const nextSort = (faqs.at(-1)?.sort ?? 0) + 10;

  return (
    <>
      <AdminTitle kicker="FIRST TUESDAY? START HERE">FAQS</AdminTitle>
      <p className="mb-6 text-sm text-body">
        Type <code className="font-mono text-blue">{"{door}"}</code> in an answer to show the current door price from the door app.
      </p>
      <div className="flex flex-col gap-3.5">
        {faqs.map((f) => (
          <Panel key={f.id}>
            <ActionForm action={saveFaq}>
              <input type="hidden" name="id" value={f.id} />
              <div className="grid gap-x-4 sm:grid-cols-[1fr_120px]">
                <Field label="Question" name="question" defaultValue={f.question} />
                <Field label="Order" name="sort" type="number" defaultValue={f.sort} />
              </div>
              <Area label="Answer" name="answer" defaultValue={f.answer} rows={3} />
              <Check label="Published" name="published" defaultChecked={f.published} />
            </ActionForm>
            <form action={deleteFaq} className="mt-3 flex justify-end">
              <input type="hidden" name="id" value={f.id} />
              <ConfirmButton label="DELETE" confirm="Delete this question?" />
            </form>
          </Panel>
        ))}
        <Panel className="border-blue/40">
          <div className="mb-4 font-mono text-[10px] tracking-[2px] text-blue">ADD A QUESTION</div>
          <ActionForm action={saveFaq} submit="ADD">
            <div className="grid gap-x-4 sm:grid-cols-[1fr_120px]">
              <Field label="Question" name="question" />
              <Field label="Order" name="sort" type="number" defaultValue={nextSort} />
            </div>
            <Area label="Answer" name="answer" rows={3} />
            <Check label="Published" name="published" defaultChecked />
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
