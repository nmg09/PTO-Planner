create table if not exists public.planner_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.planner_states enable row level security;

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists planner_states_set_updated_at on public.planner_states;
create trigger planner_states_set_updated_at
before update on public.planner_states
for each row
execute function public.set_updated_at_timestamp();

drop policy if exists "Users can select own planner state" on public.planner_states;
create policy "Users can select own planner state"
on public.planner_states
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own planner state" on public.planner_states;
create policy "Users can insert own planner state"
on public.planner_states
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own planner state" on public.planner_states;
create policy "Users can update own planner state"
on public.planner_states
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own planner state" on public.planner_states;
create policy "Users can delete own planner state"
on public.planner_states
for delete
using (auth.uid() = user_id);
