-- Personal activity, study streaks and usage counters.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Safe to re-run.

-- ─── 1. Profile columns used by the profile page ────────────
alter table public.profiles add column if not exists current_streak int not null default 0;
alter table public.profiles add column if not exists longest_streak int not null default 0;
alter table public.profiles add column if not exists last_active_date date;
alter table public.profiles add column if not exists notes_read int not null default 0;
alter table public.profiles add column if not exists cases_reviewed int not null default 0;
alter table public.profiles add column if not exists questions_asked int not null default 0;
alter table public.profiles add column if not exists answers_given int not null default 0;
alter table public.profiles add column if not exists contributions int not null default 0;
alter table public.profiles add column if not exists reputation int not null default 0;

-- People can create and edit their own profile (name, role, year of study).
alter table public.profiles enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert_own') then
    create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own') then
    create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
  end if;
end $$;

-- ─── 2. Activity log (what each person opened, newest first) ─
create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  kind text not null,            -- note, template, case, statute, dictionary, video, coach, question, group
  title text not null,
  subtitle text,
  href text,
  file_url text,
  item_key text not null,        -- identifies the item so repeats can be grouped
  created_at timestamptz not null default now()
);
create index if not exists user_activity_user_time on public.user_activity (user_id, created_at desc);

alter table public.user_activity enable row level security;
drop policy if exists "activity_select_own" on public.user_activity;
drop policy if exists "activity_delete_own" on public.user_activity;
create policy "activity_select_own" on public.user_activity for select to authenticated using (user_id = auth.uid());
create policy "activity_delete_own" on public.user_activity for delete to authenticated using (user_id = auth.uid());
-- (Rows are added through record_activity below.)

-- ─── 3. Daily streak ────────────────────────────────────────
-- Days roll over at midnight Lagos time.
create or replace function public.touch_streak()
returns table (current_streak int, longest_streak int)
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'Africa/Lagos')::date;
  p record;
begin
  if auth.uid() is null then return; end if;

  insert into public.profiles (id) values (auth.uid()) on conflict (id) do nothing;
  select pr.last_active_date, pr.current_streak, pr.longest_streak into p from public.profiles pr where pr.id = auth.uid();

  if p.last_active_date is distinct from today then
    update public.profiles pr
      set current_streak = case when p.last_active_date = today - 1 then coalesce(p.current_streak, 0) + 1 else 1 end,
          longest_streak = greatest(coalesce(p.longest_streak, 0),
                                    case when p.last_active_date = today - 1 then coalesce(p.current_streak, 0) + 1 else 1 end),
          last_active_date = today
      where pr.id = auth.uid();
  end if;

  return query select pr.current_streak, pr.longest_streak from public.profiles pr where pr.id = auth.uid();
end;
$$;

-- ─── 4. Record an activity (also counts streak and usage) ───
create or replace function public.record_activity(
  p_kind text, p_title text, p_subtitle text, p_href text, p_file_url text, p_item_key text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare first_time boolean;
begin
  if auth.uid() is null or coalesce(p_item_key, '') = '' then return; end if;

  perform public.touch_streak();

  first_time := not exists (
    select 1 from public.user_activity where user_id = auth.uid() and item_key = p_item_key
  );

  insert into public.user_activity (user_id, kind, title, subtitle, href, file_url, item_key)
    values (auth.uid(), p_kind, left(coalesce(p_title, 'Untitled'), 300), left(p_subtitle, 300), p_href, p_file_url, p_item_key);

  -- Count each note or case once, the first time it is opened.
  if first_time then
    if p_kind in ('note', 'template') then
      update public.profiles set notes_read = notes_read + 1 where id = auth.uid();
    elsif p_kind in ('case', 'coach') then
      update public.profiles set cases_reviewed = cases_reviewed + 1 where id = auth.uid();
    end if;
  end if;
end;
$$;

grant execute on function public.touch_streak() to authenticated;
grant execute on function public.record_activity(text, text, text, text, text, text) to authenticated;

-- ─── 5. Count questions and answers automatically ───────────
create or replace function public.count_community_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.author_id is null then return new; end if;
  if tg_table_name = 'questions' then
    update public.profiles set questions_asked = questions_asked + 1 where id = new.author_id;
  else
    update public.profiles set answers_given = answers_given + 1 where id = new.author_id;
  end if;
  return new;
end;
$$;

drop trigger if exists questions_count_author on public.questions;
create trigger questions_count_author after insert on public.questions
  for each row execute function public.count_community_post();
drop trigger if exists answers_count_author on public.answers;
create trigger answers_count_author after insert on public.answers
  for each row execute function public.count_community_post();
