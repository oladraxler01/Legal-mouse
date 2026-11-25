-- Group chat: replies and voice notes.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Safe to re-run.
-- Needs 20261123_study_groups_secure_realtime.sql to have been run first.

alter table public.group_messages
  add column if not exists reply_to_id uuid references public.group_messages (id) on delete set null,
  add column if not exists kind text not null default 'text',
  add column if not exists media_path text,
  add column if not exists media_duration int;

-- Only text and voice messages for now.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'group_messages_kind_check') then
    alter table public.group_messages add constraint group_messages_kind_check check (kind in ('text', 'voice'));
  end if;
end $$;

-- Voice notes are stored in the private group-materials bucket at <group_id>/voice/<file>,
-- so the existing member-only storage rules already protect them.
