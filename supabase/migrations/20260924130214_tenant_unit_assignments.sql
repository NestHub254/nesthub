create table public.unit_assignments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id),
  property_id uuid not null references public.properties(id) on delete cascade,
  unit_id uuid not null references public.workspace_records(id),
  tenant_id uuid not null references public.users(id),
  rent_amount numeric(12,2) not null check (rent_amount >= 0),
  deposit_amount numeric(12,2) not null default 0 check (deposit_amount >= 0),
  due_day integer not null check (due_day between 1 and 28),
  starts_on date not null,
  ends_on date check (ends_on is null or ends_on >= starts_on),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index unit_assignment_current_unit on public.unit_assignments(unit_id) where ended_at is null;
create unique index unit_assignment_current_tenant on public.unit_assignments(tenant_id) where ended_at is null;
create index unit_assignment_owner on public.unit_assignments(owner_id,created_at desc);
create index unit_assignment_property on public.unit_assignments(property_id);
create index unit_assignment_unit on public.unit_assignments(unit_id);
create index unit_assignment_tenant on public.unit_assignments(tenant_id);
alter table public.unit_assignments enable row level security;
revoke all on public.unit_assignments from anon,authenticated;
grant all on public.unit_assignments to service_role;

create function public.assign_workspace_unit(p_owner uuid,p_unit uuid,p_tenant uuid,p_rent numeric,p_deposit numeric,p_due integer,p_start date,p_end date default null)
returns public.unit_assignments language plpgsql security invoker set search_path='' as $$
declare u public.workspace_records; t public.users; result public.unit_assignments;
begin
  select * into u from public.workspace_records where id=p_unit and owner_id=p_owner for update;
  if not found or u.category<>'units/inventory' or u.archived or u.property_id is null then
    raise exception 'Choose an active unit linked to a property.' using errcode='P0001';
  end if;
  if not exists(select 1 from public.properties where id=u.property_id and owner_id=p_owner) then
    raise exception 'You do not own this property.' using errcode='P0001';
  end if;
  select * into t from public.users where id=p_tenant for update;
  if not found or t.role<>'tenant' or t.property_id is distinct from u.property_id then
    raise exception 'Choose a tenant from the same property.' using errcode='P0001';
  end if;
  if u.status<>'Vacant' or exists(select 1 from public.unit_assignments where ended_at is null and (unit_id=p_unit or tenant_id=p_tenant)) then
    raise exception 'This unit or tenant already has an active assignment. End it before assigning again.' using errcode='P0001';
  end if;
  insert into public.unit_assignments(owner_id,property_id,unit_id,tenant_id,rent_amount,deposit_amount,due_day,starts_on,ends_on)
  values(p_owner,u.property_id,p_unit,p_tenant,p_rent,p_deposit,p_due,p_start,p_end) returning * into result;
  update public.workspace_records set status='Occupied',updated_at=now() where id=p_unit;
  update public.users set unit_label=u.title where id=p_tenant;
  return result;
end; $$;

create function public.end_workspace_assignment(p_owner uuid,p_assignment uuid)
returns public.unit_assignments language plpgsql security invoker set search_path='' as $$
declare a public.unit_assignments;
begin
  select * into a from public.unit_assignments where id=p_assignment and owner_id=p_owner;
  if not found then raise exception 'Assignment not found.' using errcode='P0001'; end if;
  perform 1 from public.workspace_records where id=a.unit_id for update;
  perform 1 from public.users where id=a.tenant_id for update;
  update public.unit_assignments set ended_at=now() where id=a.id and ended_at is null returning * into a;
  if not found then raise exception 'This assignment has already ended.' using errcode='P0001'; end if;
  update public.workspace_records set status='Vacant',updated_at=now() where id=a.unit_id;
  update public.users set unit_label=null where id=a.tenant_id;
  return a;
end; $$;

-- Guard direct record edits as well as assignment actions, including concurrent edits.
create function public.protect_assigned_workspace_unit() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if exists(select 1 from public.unit_assignments where unit_id=old.id and ended_at is null) and
    (new.property_id is distinct from old.property_id or new.category<>old.category or new.archived or new.status<>'Occupied' or new.title<>old.title) then
    raise exception 'End the active tenant assignment before renaming, moving, archiving, or vacating this unit.' using errcode='P0001';
  end if;
  return new;
end; $$;
create trigger guard_assigned_unit before update on public.workspace_records for each row execute function public.protect_assigned_workspace_unit();
revoke all on function public.assign_workspace_unit(uuid,uuid,uuid,numeric,numeric,integer,date,date) from public,anon,authenticated;
revoke all on function public.end_workspace_assignment(uuid,uuid) from public,anon,authenticated;
revoke all on function public.protect_assigned_workspace_unit() from public,anon,authenticated;
grant execute on function public.assign_workspace_unit(uuid,uuid,uuid,numeric,numeric,integer,date,date) to service_role;
grant execute on function public.end_workspace_assignment(uuid,uuid) to service_role;
grant execute on function public.protect_assigned_workspace_unit() to service_role;
