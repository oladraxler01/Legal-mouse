-- Only signed-in users can read profiles.
-- Before this, anyone with the public site key could list every user's full name.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

alter table public.profiles enable row level security;

-- Remove existing read policies (for example the template default
-- "Public profiles are viewable by everyone."). Insert/update policies are left alone.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.profiles', p.policyname);
  end loop;
end $$;

-- Signed-in users can still see each other's names (study groups, community).
create policy "Profiles are viewable by signed-in users"
  on public.profiles for select
  to authenticated
  using (true);
