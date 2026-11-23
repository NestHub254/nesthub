create table public.workspace_records (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.users(id) on delete cascade,
 property_id uuid references public.properties(id) on delete cascade,
 category text not null check(length(category) between 1 and 80),
 title text not null check(length(title) between 1 and 255),
 status text not null default 'Draft',
 details jsonb not null default '{}'::jsonb,
 archived boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index workspace_owner_category on public.workspace_records(owner_id, category, created_at desc);
create index workspace_property on public.workspace_records(property_id);
alter table public.workspace_records enable row level security;
revoke all on public.workspace_records from anon, authenticated;
grant all on public.workspace_records to service_role;
