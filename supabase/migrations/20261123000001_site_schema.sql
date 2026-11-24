-- Warehouse Swing website tables.
-- Additive only: every object is prefixed site_ and nothing in the door app's
-- existing tables, functions or policies is altered.

-- Who may edit the website: any staff member who passes the door app's own
-- permission check for the 'editWebsite' capability (owners always; managers
-- by default; door staff only if granted in venue_settings.permissions).
create or replace function public.site_is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.staff_can('editWebsite'), false);
$$;
-- anon may call it (it simply returns false) so public read policies can
-- reference it safely.
revoke execute on function public.site_is_editor() from public;
grant execute on function public.site_is_editor() to anon, authenticated;

create or replace function public.site_touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end; $$;

-- Settings (single row) -----------------------------------------------------
create table public.site_settings (
  id text primary key default 'default' check (id = 'default'),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Instructors ---------------------------------------------------------------
create table public.site_instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'Instructor',
  bio text not null default '',
  headshot_url text,
  sort int not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Move Vault ----------------------------------------------------------------
create table public.site_moves (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  category text not null check (category in ('Basics','Passes','Turns','Whips','Dips','Aerials')),
  difficulty text not null check (difficulty in ('Beginner','Intermediate','Advanced')),
  counts int not null default 6 check (counts between 1 and 32),
  summary text not null default '',
  steps jsonb not null default '[]'::jsonb,
  count_rows jsonb not null default '[]'::jsonb,
  mistakes jsonb not null default '[]'::jsonb,
  video_url text,
  featured boolean not null default false,
  published boolean not null default true,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.site_move_prereqs (
  move_id uuid not null references public.site_moves(id) on delete cascade,
  prereq_id uuid not null references public.site_moves(id) on delete cascade,
  primary key (move_id, prereq_id),
  check (move_id <> prereq_id)
);
create index site_move_prereqs_prereq_idx on public.site_move_prereqs(prereq_id);

-- FAQ -----------------------------------------------------------------------
create table public.site_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Photos --------------------------------------------------------------------
create table public.site_photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text not null default '',
  taken_on date,
  sort int not null default 0,
  updated_at timestamptz not null default now()
);

-- Website notes layered on the door app's events ---------------------------
create table public.site_event_notes (
  event_id uuid primary key references public.events(id) on delete cascade,
  topic text not null default '',
  level text not null default 'All levels',
  description text not null default '',
  meetup_url text,
  hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Tuesdays that are off (holidays etc.) when no door event exists ----------
create table public.site_closures (
  date date primary key,
  reason text not null default ''
);

-- Newsletter subscribers ----------------------------------------------------
create table public.site_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'active' check (status in ('pending','active','unsubscribed','bounced')),
  source text not null default 'website',
  created_at timestamptz not null default now()
);
create unique index site_subscribers_email_idx on public.site_subscribers (lower(email));

-- updated_at triggers
create trigger site_settings_touch before update on public.site_settings for each row execute function public.site_touch_updated_at();
create trigger site_instructors_touch before update on public.site_instructors for each row execute function public.site_touch_updated_at();
create trigger site_moves_touch before update on public.site_moves for each row execute function public.site_touch_updated_at();
create trigger site_faqs_touch before update on public.site_faqs for each row execute function public.site_touch_updated_at();
create trigger site_photos_touch before update on public.site_photos for each row execute function public.site_touch_updated_at();
create trigger site_event_notes_touch before update on public.site_event_notes for each row execute function public.site_touch_updated_at();

-- RLS -----------------------------------------------------------------------
alter table public.site_settings     enable row level security;
alter table public.site_instructors  enable row level security;
alter table public.site_moves        enable row level security;
alter table public.site_move_prereqs enable row level security;
alter table public.site_faqs         enable row level security;
alter table public.site_photos       enable row level security;
alter table public.site_event_notes  enable row level security;
alter table public.site_closures     enable row level security;
alter table public.site_subscribers  enable row level security;

-- Public reads
create policy site_settings_read     on public.site_settings     for select to anon, authenticated using (true);
create policy site_instructors_read  on public.site_instructors  for select to anon, authenticated using (active or (select public.site_is_editor()));
create policy site_moves_read        on public.site_moves        for select to anon, authenticated using (published or (select public.site_is_editor()));
create policy site_move_prereqs_read on public.site_move_prereqs for select to anon, authenticated using (true);
create policy site_faqs_read         on public.site_faqs         for select to anon, authenticated using (published or (select public.site_is_editor()));
create policy site_photos_read       on public.site_photos       for select to anon, authenticated using (true);
create policy site_closures_read     on public.site_closures     for select to anon, authenticated using (true);
create policy site_event_notes_read  on public.site_event_notes  for select to authenticated using ((select public.site_is_editor()));
create policy site_subscribers_read  on public.site_subscribers  for select to authenticated using ((select public.site_is_editor()));

-- Editor writes
create policy site_settings_write     on public.site_settings     for all to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));
create policy site_instructors_write  on public.site_instructors  for all to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));
create policy site_moves_write        on public.site_moves        for all to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));
create policy site_move_prereqs_write on public.site_move_prereqs for all to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));
create policy site_faqs_write         on public.site_faqs         for all to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));
create policy site_photos_write       on public.site_photos       for all to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));
create policy site_event_notes_write  on public.site_event_notes  for all to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));
create policy site_closures_write     on public.site_closures     for all to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));
create policy site_subscribers_write  on public.site_subscribers  for update to authenticated using ((select public.site_is_editor())) with check ((select public.site_is_editor()));

-- Public event feed: only the safe columns of the door app's events, plus notes.
create or replace function public.site_public_events(p_from date, p_to date)
returns table (
  id uuid, date date, name text, lesson_start text, social_start text,
  lesson_teacher text, topic text, level text, description text, meetup_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, e.date, e.name, e.lesson_start, e.social_start, e.lesson_teacher,
         coalesce(n.topic, ''), coalesce(n.level, 'All levels'),
         coalesce(n.description, ''), n.meetup_url
    from public.events e
    left join public.site_event_notes n on n.event_id = e.id
   where e.date between p_from and least(p_to, p_from + 400)
     and coalesce(n.hidden, false) = false
   order by e.date;
$$;
revoke execute on function public.site_public_events(date, date) from public;
grant execute on function public.site_public_events(date, date) to anon, authenticated;

-- Public prices from the door app's pricing tiers (Door / Student).
create or replace function public.site_public_pricing()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(data->'pricing'->'tiers', '[]'::jsonb)
    from public.venue_settings where id = 'default';
$$;
revoke execute on function public.site_public_pricing() from public;
grant execute on function public.site_public_pricing() to anon, authenticated;

-- Newsletter signup without exposing the table.
create or replace function public.site_subscribe(p_email text, p_source text default 'website')
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'invalid email' using errcode = '22023';
  end if;
  insert into public.site_subscribers (email, source)
  values (v_email, left(coalesce(p_source, 'website'), 40))
  on conflict (lower(email)) do update
    set status = case when site_subscribers.status = 'unsubscribed' then 'active' else site_subscribers.status end;
  return true;
end;
$$;
revoke execute on function public.site_subscribe(text, text) from public;
grant execute on function public.site_subscribe(text, text) to anon, authenticated;

-- Editor view of upcoming door events with notes.
create or replace function public.site_admin_events(p_from date, p_to date)
returns table (
  id uuid, date date, name text, lesson_start text, social_start text, lesson_teacher text,
  capacity int, is_active boolean, checkins bigint,
  topic text, level text, description text, meetup_url text, hidden boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.site_is_editor() then
    raise exception 'forbidden' using errcode = '28000';
  end if;
  return query
  select e.id, e.date, e.name, e.lesson_start, e.social_start, e.lesson_teacher,
         e.capacity, e.is_active,
         (select count(*) from public.check_ins c where c.event_id = e.id),
         coalesce(n.topic, ''), coalesce(n.level, 'All levels'),
         coalesce(n.description, ''), n.meetup_url, coalesce(n.hidden, false)
    from public.events e
    left join public.site_event_notes n on n.event_id = e.id
   where e.date between p_from and p_to
   order by e.date desc;
end;
$$;
revoke execute on function public.site_admin_events(date, date) from public, anon;
grant execute on function public.site_admin_events(date, date) to authenticated;

-- Public image bucket for site photos and headshots.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy site_media_editor_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and (select public.site_is_editor()));
create policy site_media_editor_update on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and (select public.site_is_editor()));
create policy site_media_editor_delete on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and (select public.site_is_editor()));
