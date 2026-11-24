-- Events planned on the website. They stay website-only until they are within
-- 7 days (Wixom time); then site_release_due_events() creates the matching
-- row in the door app's events table and links it. After release the door app
-- owns the night; the website keeps its topic/description in site_event_notes.

create table public.site_planned_events (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  name text not null check (length(trim(name)) > 0),
  night_type text,
  doors_open text not null default '7:00 PM',
  lesson_start text not null default '7:00 PM',
  social_start text not null default '7:45 PM',
  lesson_teacher text not null default '',
  capacity int not null default 100 check (capacity >= 1),
  price_cents int not null default 1000 check (price_cents >= 0),
  topic text not null default '',
  level text not null default 'All levels',
  description text not null default '',
  meetup_url text,
  hidden boolean not null default false,
  door_event_id uuid unique references public.events(id) on delete set null,
  released_at timestamptz,
  created_by text,            -- staff.id of whoever planned it
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index site_planned_events_date_idx on public.site_planned_events(date);
create trigger site_planned_events_touch before update on public.site_planned_events
  for each row execute function public.site_touch_updated_at();

alter table public.site_planned_events enable row level security;
create policy site_planned_events_read on public.site_planned_events for select to authenticated
  using ((select public.site_is_editor()));
-- Editors may change or delete a night only until it has been released.
create policy site_planned_events_insert on public.site_planned_events for insert to authenticated
  with check ((select public.site_is_editor()) and door_event_id is null);
create policy site_planned_events_update on public.site_planned_events for update to authenticated
  using ((select public.site_is_editor()) and door_event_id is null and released_at is null)
  with check ((select public.site_is_editor()) and door_event_id is null and released_at is null);
create policy site_planned_events_delete on public.site_planned_events for delete to authenticated
  using ((select public.site_is_editor()) and released_at is null);

-- Stamp who planned it.
create or replace function public.site_planned_events_stamp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is null then
    select id into new.created_by from public.staff where auth_id = auth.uid();
  end if;
  return new;
end; $$;
revoke execute on function public.site_planned_events_stamp() from public, anon, authenticated;
create trigger site_planned_events_stamp before insert on public.site_planned_events
  for each row execute function public.site_planned_events_stamp();

-- Today in Wixom.
create or replace function public.site_today()
returns date language sql stable set search_path = public as $$
  select (now() at time zone 'America/Detroit')::date;
$$;

-- Release every planned night that is 0 to 7 days out and not yet in the door app.
-- If the door app already has an event that day, link to it instead of duplicating.
create or replace function public.site_release_due_events()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.site_planned_events%rowtype;
  v_id uuid;
  v_count int := 0;
  v_today date := public.site_today();
begin
  for r in
    select * from public.site_planned_events
     where door_event_id is null and released_at is null
       and date between v_today and v_today + 7
     order by date
     for update skip locked
  loop
    select id into v_id from public.events where date = r.date order by created_at limit 1;
    if v_id is null then
      insert into public.events (name, date, is_active, doors_open, lesson_start, social_start,
                                 lesson_teacher, capacity, price_cents, night_type)
      values (r.name, r.date, false, r.doors_open, r.lesson_start, r.social_start,
              r.lesson_teacher, r.capacity, r.price_cents, r.night_type)
      returning id into v_id;

      insert into public.audit_log (staff_id, staff_name, action, subject_id, details)
      values (coalesce(r.created_by, 'website'), 'Website (auto-release)', 'event_create', v_id::text,
              jsonb_build_object('name', r.name, 'date', r.date, 'source', 'website', 'planned_id', r.id));
    end if;

    insert into public.site_event_notes (event_id, topic, level, description, meetup_url, hidden)
    values (v_id, r.topic, r.level, r.description, r.meetup_url, r.hidden)
    on conflict (event_id) do update
      set topic = excluded.topic, level = excluded.level, description = excluded.description,
          meetup_url = excluded.meetup_url, hidden = excluded.hidden;

    update public.site_planned_events set door_event_id = v_id, released_at = now() where id = r.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
revoke execute on function public.site_release_due_events() from public, anon;
-- Editors may trigger it right after saving (it only ever releases due nights).
grant execute on function public.site_release_due_events() to authenticated;

-- Hourly safety net (the website also calls it after every save).
select cron.schedule('site-release-events', '7 * * * *', 'select public.site_release_due_events()');

-- Door-app night templates (names, times, capacity, price) for the planner form.
create or replace function public.site_event_templates()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.site_is_editor() then raise exception 'forbidden' using errcode = '28000'; end if;
  return coalesce((select data->'eventDefaults' from public.venue_settings where id = 'default'), '[]'::jsonb);
end; $$;
revoke execute on function public.site_event_templates() from public, anon;
grant execute on function public.site_event_templates() to authenticated;

-- Public feed now includes planned (not yet released) nights too.
drop function public.site_public_events(date, date);
create function public.site_public_events(p_from date, p_to date)
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
  union all
  select p.id, p.date, p.name, p.lesson_start, p.social_start, p.lesson_teacher,
         p.topic, p.level, p.description, p.meetup_url
    from public.site_planned_events p
   where p.door_event_id is null and p.hidden = false
     and p.date between p_from and least(p_to, p_from + 400)
     and not exists (select 1 from public.events e2 where e2.date = p.date)
   order by 2;
$$;
revoke execute on function public.site_public_events(date, date) from public;
grant execute on function public.site_public_events(date, date) to anon, authenticated;
