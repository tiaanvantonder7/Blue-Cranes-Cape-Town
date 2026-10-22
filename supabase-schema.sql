-- BC/SC Job Tracker database setup
-- Run this whole script in Supabase → SQL Editor → New query → Run.
create table if not exists public.job_records (
  id uuid primary key default gen_random_uuid(),
  client text,
  area text,
  customer text not null,
  po_status text check (po_status is null or po_status in ('PO Received','PO Not Received','In Process')),
  farm_cellar text,
  location text,
  date_scheduled date,
  contact_person text,
  contact_number text,
  inventory text,
  technician text,
  date_completed date,
  job_status text not null default 'In Progress' check (job_status in ('In Progress','Completed','Not Completed')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.job_records enable row level security;
revoke all on table public.job_records from anon;
grant select, insert, update, delete on table public.job_records to authenticated;
drop policy if exists "Signed-in team can view jobs" on public.job_records;
drop policy if exists "Signed-in team can add jobs" on public.job_records;
drop policy if exists "Signed-in team can update jobs" on public.job_records;
drop policy if exists "Signed-in team can delete jobs" on public.job_records;
create policy "Signed-in team can view jobs" on public.job_records for select to authenticated using (true);
create policy "Signed-in team can add jobs" on public.job_records for insert to authenticated with check (true);
create policy "Signed-in team can update jobs" on public.job_records for update to authenticated using (true) with check (true);
create policy "Signed-in team can delete jobs" on public.job_records for delete to authenticated using (true);
-- Enable Realtime for cross-device updates (safe to run again after checking publication membership).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'job_records'
  ) then
    alter publication supabase_realtime add table public.job_records;
  end if;
end $$;
