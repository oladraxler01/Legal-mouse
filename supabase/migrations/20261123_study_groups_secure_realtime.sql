-- Study groups: member-only privacy, invite links, shared materials and live chat.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.

create extension if not exists pgcrypto;

-- ─── 1. Columns ─────────────────────────────────────────────
alter table public.study_groups
  add column if not exists invite_code text,
  alter column created_by set default auth.uid();

update public.study_groups
  set invite_code = encode(gen_random_bytes(6), 'hex')
  where invite_code is null;

alter table public.study_groups
  alter column invite_code set default encode(gen_random_bytes(6), 'hex'),
  alter column invite_code set not null;

create unique index if not exists study_groups_invite_code_key on public.study_groups (invite_code);

alter table public.group_members
  add column if not exists role text not null default 'member';

-- One membership per person per group (remove duplicates first).
delete from public.group_members a
  using public.group_members b
  where a.ctid < b.ctid and a.group_id = b.group_id and a.user_id = b.user_id;
create unique index if not exists group_members_group_user_key on public.group_members (group_id, user_id);

-- Shared materials (files or links) per group.
create table if not exists public.group_materials (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups (id) on delete cascade,
  uploaded_by uuid not null default auth.uid(),
  title text not null,
  storage_path text,
  external_url text,
  created_at timestamptz not null default now()
);
create index if not exists group_materials_group_idx on public.group_materials (group_id, created_at desc);

-- ─── 2. Membership check (security definer avoids policy recursion) ───
create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

-- ─── 3. Keep member_count accurate ──────────────────────────
create or replace function public.sync_group_member_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare gid uuid := coalesce(new.group_id, old.group_id);
begin
  update public.study_groups
    set member_count = (select count(*) from public.group_members where group_id = gid)
    where id = gid;
  return null;
end;
$$;

drop trigger if exists group_members_count on public.group_members;
create trigger group_members_count
  after insert or delete on public.group_members
  for each row execute function public.sync_group_member_count();

-- ─── 4. Create / join / leave functions ─────────────────────
create or replace function public.create_study_group(p_name text, p_description text, p_is_private boolean)
returns table (id uuid, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare new_id uuid; new_code text;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Group name is required'; end if;

  insert into public.study_groups (name, description, is_private, created_by, member_count)
    values (trim(p_name), coalesce(p_description, ''), coalesce(p_is_private, false), auth.uid(), 0)
    returning study_groups.id, study_groups.invite_code into new_id, new_code;

  insert into public.group_members (group_id, user_id, role) values (new_id, auth.uid(), 'owner');
  return query select new_id, new_code;
end;
$$;

create or replace function public.join_group_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare gid uuid;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select g.id into gid from public.study_groups g where g.invite_code = lower(trim(p_code));
  if gid is null then raise exception 'Invite link is invalid or has been reset'; end if;
  insert into public.group_members (group_id, user_id) values (gid, auth.uid())
    on conflict (group_id, user_id) do nothing;
  return gid;
end;
$$;

grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.create_study_group(text, text, boolean) to authenticated;
grant execute on function public.join_group_by_code(text) to authenticated;

-- ─── 5. Row-level security ──────────────────────────────────
alter table public.study_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_messages enable row level security;
alter table public.group_materials enable row level security;

-- Replace any older policies on these tables with the set below.
do $$
declare p record;
begin
  for p in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('study_groups', 'group_members', 'group_messages', 'group_materials')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- Groups: public groups are discoverable by signed-in users; private groups only by members.
create policy "groups_select" on public.study_groups for select to authenticated
  using (not is_private or public.is_group_member(id));
create policy "groups_update_owner" on public.study_groups for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "groups_delete_owner" on public.study_groups for delete to authenticated
  using (created_by = auth.uid());
-- (Groups are created through create_study_group().)

-- Members: only fellow members see the member list. Anyone can join a public group;
-- private groups are joined through an invite link (join_group_by_code). Members can leave.
create policy "members_select" on public.group_members for select to authenticated
  using (public.is_group_member(group_id));
create policy "members_join_public" on public.group_members for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.study_groups g where g.id = group_id and not g.is_private)
  );
create policy "members_leave" on public.group_members for delete to authenticated
  using (user_id = auth.uid());

-- Messages: members only, and you can only post as yourself.
create policy "messages_select" on public.group_messages for select to authenticated
  using (public.is_group_member(group_id));
create policy "messages_insert" on public.group_messages for insert to authenticated
  with check (user_id = auth.uid() and public.is_group_member(group_id));
create policy "messages_delete_own" on public.group_messages for delete to authenticated
  using (user_id = auth.uid());

-- Materials: members only; uploader can delete.
create policy "materials_select" on public.group_materials for select to authenticated
  using (public.is_group_member(group_id));
create policy "materials_insert" on public.group_materials for insert to authenticated
  with check (uploaded_by = auth.uid() and public.is_group_member(group_id));
create policy "materials_delete_own" on public.group_materials for delete to authenticated
  using (uploaded_by = auth.uid());

-- ─── 6. Private file storage for materials ──────────────────
-- Files live at group-materials/<group_id>/<file>. Only that group's members can read or upload.
insert into storage.buckets (id, name, public, file_size_limit)
  values ('group-materials', 'group-materials', false, 26214400) -- 25 MB per file
  on conflict (id) do update set public = false;

drop policy if exists "group_materials_read" on storage.objects;
drop policy if exists "group_materials_upload" on storage.objects;
drop policy if exists "group_materials_delete" on storage.objects;

create policy "group_materials_read" on storage.objects for select to authenticated
  using (bucket_id = 'group-materials' and public.is_group_member(((storage.foldername(name))[1])::uuid));
create policy "group_materials_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'group-materials' and public.is_group_member(((storage.foldername(name))[1])::uuid));
create policy "group_materials_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'group-materials' and owner = auth.uid());

-- ─── 7. Live updates ────────────────────────────────────────
-- Realtime respects the policies above, so only members receive a group's messages.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'group_messages') then
    alter publication supabase_realtime add table public.group_messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'group_materials') then
    alter publication supabase_realtime add table public.group_materials;
  end if;
end $$;
