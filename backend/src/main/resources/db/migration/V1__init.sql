-- NestHub schema, adapted for Spring Boot (own auth, no Supabase Auth/RLS dependency).
-- Authorization now happens in the Java service layer, not in Postgres policies.

create extension if not exists "pgcrypto";

create type user_role as enum ('tenant', 'owner', 'manager', 'maintenance');
create type ticket_status as enum ('OPEN', 'IN_PROGRESS', 'AWAITING_PARTS', 'DONE', 'CLOSED');

create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role user_role not null default 'tenant',
  property_id uuid,
  phone text,
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id),
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

alter table users add constraint users_property_fk foreign key (property_id) references properties(id);

create table units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  unit_number text not null,
  unit_code text not null unique,
  status text not null default 'occupied'
);

create table leases (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id),
  tenant_id uuid not null references users(id),
  rent_amount integer not null,
  due_day integer not null check (due_day between 1 and 31),
  starts_on date not null,
  ends_on date
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  lease_id uuid not null references leases(id),
  amount integer not null,
  method text not null,
  status text not null,
  transaction_ref text unique,
  receipt_url text,
  created_at timestamptz not null default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  unit_id uuid not null references units(id),
  category text not null,
  description text not null,
  status ticket_status not null default 'OPEN',
  claimed_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table ticket_updates (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  author_id uuid not null references users(id),
  note text,
  status ticket_status,
  created_at timestamptz not null default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  author_id uuid not null references users(id),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table staff_messages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id),
  author_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- Atomic maintenance claim: only succeeds if the ticket is still open and unclaimed.
-- Called from TicketService with the current user's id — no DB-level auth.uid() needed.
create or replace function claim_ticket(target_ticket uuid, worker_id uuid) returns tickets
language sql as $$
  update tickets set claimed_by = worker_id, status = 'IN_PROGRESS'
  where id = target_ticket and claimed_by is null and status = 'OPEN'
  returning *;
$$;
