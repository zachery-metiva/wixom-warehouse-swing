// Generates supabase/migrations/..._site_seed.sql from the JSON content files.
import { readFileSync, writeFileSync } from 'node:fs';
const q = (s) => s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`;
const j = (o) => `${q(JSON.stringify(o))}::jsonb`;
const moves = JSON.parse(readFileSync('supabase/seed/moves.json', 'utf8'));
const faqs = JSON.parse(readFileSync('supabase/seed/faqs.json', 'utf8'));
const settings = JSON.parse(readFileSync('supabase/seed/settings.json', 'utf8'));
const instructors = JSON.parse(readFileSync('supabase/seed/instructors.json', 'utf8'));
let sql = '-- Seed content for the website (safe to re-run: skips rows that exist)\n\n';
sql += `insert into public.site_settings (id, data) values ('default', ${j(settings)}) on conflict (id) do nothing;\n\n`;
moves.forEach((m, i) => {
  sql += `insert into public.site_moves (slug, name, category, difficulty, counts, summary, steps, count_rows, mistakes, featured, sort) values (${q(m.slug)}, ${q(m.name)}, ${q(m.category)}, ${q(m.difficulty)}, ${m.counts}, ${q(m.summary)}, ${j(m.steps)}, ${j(m.countRows)}, ${j(m.mistakes)}, ${m.featured}, ${i * 10}) on conflict (slug) do nothing;\n`;
});
sql += '\n';
moves.forEach((m) => m.prereqs.forEach((p) => {
  sql += `insert into public.site_move_prereqs (move_id, prereq_id) select a.id, b.id from public.site_moves a, public.site_moves b where a.slug = ${q(m.slug)} and b.slug = ${q(p)} on conflict do nothing;\n`;
}));
sql += '\ninsert into public.site_faqs (question, answer, sort)\nselect * from (values\n' + faqs.map((f, i) => `  (${q(f.q)}, ${q(f.a)}, ${i * 10})`).join(',\n') + '\n) v(question, answer, sort) where not exists (select 1 from public.site_faqs);\n';
sql += '\ninsert into public.site_instructors (name, role, bio, sort)\nselect * from (values\n' + instructors.map((t, i) => `  (${q(t.name)}, ${q(t.role)}, ${q(t.bio)}, ${i * 10})`).join(',\n') + '\n) v(name, role, bio, sort) where not exists (select 1 from public.site_instructors);\n';
writeFileSync('supabase/migrations/20261123000002_site_seed.sql', sql);
console.log(sql.length, 'bytes');
