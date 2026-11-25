-- Student contributions: notes students upload for review before they are published.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Safe to re-run.

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid(),
  title text not null,
  folder text,                         -- Summary Notes folder slug suggested by the student
  file_url text not null,
  file_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  published_note_id uuid,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists contributions_author_idx on public.contributions (author_id, created_at desc);
create index if not exists contributions_status_idx on public.contributions (status, created_at);

-- Students see and submit only their own; reviews happen in the admin portal (server side).
alter table public.contributions enable row level security;
drop policy if exists "contributions_select_own" on public.contributions;
drop policy if exists "contributions_insert_own" on public.contributions;
create policy "contributions_select_own" on public.contributions for select to authenticated
  using (author_id = auth.uid());
create policy "contributions_insert_own" on public.contributions for insert to authenticated
  with check (author_id = auth.uid() and status = 'pending');

-- Students may upload files only into their own folder of the contributions bucket.
insert into storage.buckets (id, name, public) values ('contributions', 'contributions', true)
  on conflict (id) do nothing;
drop policy if exists "contributions_student_upload" on storage.objects;
create policy "contributions_student_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'contributions' and (storage.foldername(name))[1] = auth.uid()::text);

-- Live status updates on the Contribute page.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'contributions') then
    alter publication supabase_realtime add table public.contributions;
  end if;
end $$;
