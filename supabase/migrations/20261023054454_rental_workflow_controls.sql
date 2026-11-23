-- Additive workflow controls. Existing bills, receipts and completed jobs are preserved.
alter table public.properties add column cash_enabled boolean not null default false;
alter table public.unit_assignments add column moveout_notes text;
alter table public.property_repairs drop constraint property_repairs_status_check;
alter table public.property_repairs add constraint property_repairs_status_check check(status in ('Reported','Assigned','In progress','Awaiting verification','Verified','Completed'));
alter table public.property_repairs add column completed_by uuid references public.users(id);
alter table public.property_repairs add column verified_by uuid references public.users(id);
alter table public.property_repairs add column verified_at timestamptz;
alter table public.property_repairs add column evidence_waiver text;
create index on public.property_repairs(completed_by);
create index on public.property_repairs(verified_by);
alter table public.repair_photos add column stage text not null default 'Before' check(stage in ('Before','After'));
alter table public.repair_photos add column content_hash text;
alter table public.repair_photos add column ready boolean not null default true;

create table public.workflow_events (
 id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
 actor_id uuid references public.users(id), entity_type text not null, entity_id uuid not null,
 action text not null, before_data jsonb, after_data jsonb, reason text not null default '', created_at timestamptz not null default now()
);
create index on public.workflow_events(property_id,created_at desc);
create index on public.workflow_events(actor_id);
create table public.billing_runs (
 id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
 status text not null, charges_created integer not null default 0, detail text not null default '', created_at timestamptz not null default now()
);
create index on public.billing_runs(property_id,created_at desc);
create table public.deposit_settlements (
 id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
 assignment_id uuid not null unique references public.unit_assignments(id), tenant_id uuid not null references public.users(id),
 received numeric(12,2) not null check(received>=0), deduction numeric(12,2) not null check(deduction>=0 and deduction<=received),
 reason text not null, evidence text not null, status text not null check(status in ('Proposed','Accepted','Disputed','Settled')),
 response text not null default '', refund_reference text, refund_method text, created_by uuid not null references public.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), settled_at timestamptz
);
create index on public.deposit_settlements(property_id);
create index on public.deposit_settlements(tenant_id);
create index on public.deposit_settlements(created_by);
do $$ declare t text; begin foreach t in array array['workflow_events','billing_runs','deposit_settlements'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select,insert,update,delete on public.%I to service_role',t);
end loop; end $$;
revoke update on public.workflow_events from service_role;

-- Keep evidence once it has been offered for verification, including after a dispute.
create function public.guard_repair_evidence() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from public.property_repairs where id=old.repair_id and completed_by is not null) then
 raise exception 'Submitted repair evidence is retained. Add another photo instead.'; end if;
 return old;
end $$;
create trigger repair_evidence_delete before delete on public.repair_photos for each row execute function public.guard_repair_evidence();

-- The old RPC remains private; the public API always uses the guarded wrapper.
alter function public.rental_action(uuid,text,jsonb) rename to rental_action_legacy;
revoke all on function public.rental_action_legacy(uuid,text,jsonb) from public,anon,authenticated;
create function public.rental_action(p_actor uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare u public.users; p public.properties; r public.property_repairs; pay public.rental_payments; a public.unit_assignments; s public.deposit_settlements;
 v uuid; target uuid; next_status text; note text; waiver text; held numeric(12,2); deduction numeric(12,2); before_row jsonb; result jsonb;
begin
 select * into u from public.users where id=p_actor;
 select * into p from public.properties where id=(p_data->>'propertyId')::uuid;
 if u.id is null or p.id is null or not coalesce((u.role='owner' and p.owner_id=u.id) or (u.role<>'owner' and u.property_id=p.id),false) then raise exception 'You do not have access to this property.'; end if;
 perform set_config('nesthub.actor',u.id::text,true);
 if p_action='cash-settings' then
  if u.role<>'owner' then raise exception 'Owner access required.'; end if;
  update public.properties set cash_enabled=(p_data->>'enabled')::boolean where id=p.id;
  insert into public.workflow_events(property_id,actor_id,entity_type,entity_id,action,before_data,after_data) values(p.id,u.id,'property',p.id,p_action,jsonb_build_object('cash_enabled',p.cash_enabled),jsonb_build_object('cash_enabled',(p_data->>'enabled')::boolean));
  return jsonb_build_object('message','Cash policy updated. Cash needs a different management user to confirm.');
 elsif p_action in ('update-repair','verify-repair') then
  select * into r from public.property_repairs where id=(p_data->>'id')::uuid and property_id=p.id for update;
  if r.id is null then raise exception 'Repair not found.'; end if;
  before_row=to_jsonb(r); note=trim(coalesce(p_data->>'note','')); waiver=trim(coalesce(p_data->>'waiver',''));
  if length(note) not between 3 and 2000 then raise exception 'Add an update or verification note.'; end if;
  if p_action='update-repair' then
   if not (u.role in ('owner','manager') or (u.role='maintenance' and r.assigned_to=u.id)) then raise exception 'Only management or assigned staff may update this job.'; end if;
   if r.status in ('Awaiting verification','Verified','Completed') then raise exception 'Use verification to accept or reopen this repair.'; end if;
   next_status=p_data->>'status';
   if next_status='Completed' then next_status='Awaiting verification'; end if;
   if next_status is null or next_status not in ('Reported','Assigned','In progress','Awaiting verification') then raise exception 'Choose a valid progress status.'; end if;
   target=case when u.role='maintenance' then r.assigned_to else nullif(p_data->>'assignedTo','')::uuid end;
   if target is not null and not exists(select 1 from public.users where id=target and property_id=p.id and role in ('manager','maintenance')) then raise exception 'Choose staff in this property.'; end if;
   if next_status in ('Assigned','In progress','Awaiting verification') and target is null then raise exception 'Assign a responsible staff member first.'; end if;
   if next_status='Awaiting verification' and not (
    exists(select 1 from public.repair_photos where repair_id=r.id and stage='Before' and ready) and
    exists(select 1 from public.repair_photos where repair_id=r.id and stage='After' and ready)) then
     if u.role<>'owner' or length(waiver)<10 then raise exception 'Upload before and after photos. Only the owner can waive evidence with a reason.'; end if;
   end if;
   update public.property_repairs set status=next_status,assigned_to=target,update_note=note,updated_at=now(),completed_by=case when next_status='Awaiting verification' then u.id else completed_by end,evidence_waiver=case when next_status='Awaiting verification' then nullif(waiver,'') else evidence_waiver end where id=r.id returning * into r;
  else
   if not ((u.role='tenant' and r.tenant_id=u.id) or u.role='owner') then raise exception 'The affected tenant or owner must verify the work.'; end if;
   if r.status<>'Awaiting verification' then raise exception 'This job is not awaiting verification.'; end if;
   next_status=p_data->>'status';
   if next_status is null or next_status not in ('Verified','In progress') then raise exception 'Accept the work or request more work.'; end if;
   if next_status='Verified' and u.id=r.completed_by and length(waiver)<10 then raise exception 'Self-verification requires an explicit owner override reason.'; end if;
   update public.property_repairs set status=next_status,update_note=note,updated_at=now(),verified_by=case when next_status='Verified' then u.id else null end,verified_at=case when next_status='Verified' then now() else null end where id=r.id returning * into r;
  end if;
  insert into public.workflow_events(property_id,actor_id,entity_type,entity_id,action,before_data,after_data,reason) values(p.id,u.id,'repair',r.id,p_action,before_row,to_jsonb(r),note||case when waiver<>'' then ' Override: '||waiver else '' end);
  insert into public.property_activity(property_id,actor_id,description) values(p.id,u.id,'Repair: '||r.title||' · '||r.status);
  if r.tenant_id is not null then insert into public.property_conversations(property_id,author_id,recipient_id,channel,body) values(p.id,u.id,r.tenant_id,'Private','Repair: '||r.title||' · '||r.status||'. '||note); end if;
  return jsonb_build_object('id',r.id,'message','Repair updated · '||r.status);
 elsif p_action in ('deposit-propose','deposit-respond','deposit-refund') then
  select * into a from public.unit_assignments where id=(p_data->>'assignmentId')::uuid and property_id=p.id for update;
  if a.id is null then raise exception 'Tenancy not found.'; end if;
  if a.ended_at is null then raise exception 'Record the move-out inspection and end this tenancy first.'; end if;
  select coalesce(sum(rp.amount),0) into held from public.rental_payments rp join public.rental_charges c on c.id=rp.charge_id where c.assignment_id=a.id and c.kind='Deposit' and rp.status='Confirmed';
  select * into s from public.deposit_settlements where assignment_id=a.id for update;
  before_row=case when s.id is null then null else to_jsonb(s) end;
  note=trim(coalesce(p_data->>'note',''));
  if p_action='deposit-propose' then
   if u.role<>'owner' then raise exception 'Only the owner can propose deposit deductions.'; end if;
   if s.id is not null and s.status not in ('Proposed','Disputed') then raise exception 'This settlement has already been accepted.'; end if;
   if exists(select 1 from public.rental_payments rp join public.rental_charges c on c.id=rp.charge_id where c.assignment_id=a.id and c.kind='Deposit' and rp.status='Pending') then raise exception 'Review pending deposit payments first.'; end if;
   deduction=(p_data->>'deduction')::numeric;
   if held<=0 or deduction is null or deduction<0 or deduction>held then raise exception 'Deductions cannot exceed the confirmed deposit held.'; end if;
   if length(note)<10 or length(trim(coalesce(p_data->>'evidence','')))<10 then raise exception 'Add an explanation and an inspection/evidence reference.'; end if;
   insert into public.deposit_settlements(property_id,assignment_id,tenant_id,received,deduction,reason,evidence,status,created_by)
    values(p.id,a.id,a.tenant_id,held,deduction,note,p_data->>'evidence','Proposed',u.id)
    on conflict(assignment_id) do update set received=excluded.received,deduction=excluded.deduction,reason=excluded.reason,evidence=excluded.evidence,status='Proposed',response='',updated_at=now() returning * into s;
  elsif p_action='deposit-respond' then
   if u.role<>'tenant' or a.tenant_id<>u.id then raise exception 'Only this tenant can respond.'; end if;
   if s.id is null or s.status<>'Proposed' then raise exception 'No proposal is awaiting your response.'; end if;
   if coalesce(p_data->>'status','') not in ('Accepted','Disputed') or length(note)<3 then raise exception 'Accept or dispute with a comment.'; end if;
   update public.deposit_settlements set status=p_data->>'status',response=note,updated_at=now() where id=s.id returning * into s;
  else
   if u.role<>'owner' then raise exception 'Only the owner can record the refund.'; end if;
   if s.id is null or s.status<>'Accepted' then raise exception 'The tenant must accept this proposal before settlement.'; end if;
   if held<>s.received then raise exception 'Deposit receipts changed. Review the settlement before refunding.'; end if;
   if s.received>s.deduction and (length(trim(coalesce(p_data->>'reference','')))<3 or coalesce(p_data->>'method','') not in ('M-Pesa','Bank transfer')) then raise exception 'Enter the actual refund method and reference.'; end if;
   update public.deposit_settlements set status='Settled',refund_reference=p_data->>'reference',refund_method=p_data->>'method',settled_at=now(),updated_at=now() where id=s.id returning * into s;
  end if;
  insert into public.workflow_events(property_id,actor_id,entity_type,entity_id,action,before_data,after_data,reason) values(p.id,u.id,'deposit',s.id,p_action,before_row,to_jsonb(s),note);
  insert into public.property_conversations(property_id,author_id,recipient_id,channel,body) values(p.id,u.id,a.tenant_id,'Private','Deposit settlement: '||s.status||'. Open Money & deposits for the details.');
  return jsonb_build_object('id',s.id,'message','Deposit settlement · '||s.status);
 end if;
 if p_action='payment' and p_data->>'method'='Cash' and not p.cash_enabled then raise exception 'Cash is disabled. The owner must enable two-person cash handling first.'; end if;
 if p_action in ('payment','review-payment') then
  -- Lock the tenancy before reviewing a deposit to serialize with settlement.
  if p_action='review-payment' then select * into pay from public.rental_payments where id=(p_data->>'id')::uuid and property_id=p.id; v=pay.charge_id;
  else v=(p_data->>'chargeId')::uuid; end if;
  select ua.* into a from public.unit_assignments ua join public.rental_charges c on c.assignment_id=ua.id where c.id=v and c.kind='Deposit' for update of ua;
  if a.id is not null and exists(select 1 from public.deposit_settlements where assignment_id=a.id) then raise exception 'This deposit is already in settlement; no additional payments can be recorded or confirmed.'; end if;
  if p_action='review-payment' and pay.method='Cash' and pay.submitted_by=u.id and p_data->>'status'='Confirmed' then raise exception 'A different owner or manager must confirm this cash payment.'; end if;
 end if;
 result=public.rental_action_legacy(p_actor,p_action,p_data);
 return result;
end $$;
revoke all on function public.rental_action(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.rental_action(uuid,text,jsonb) to service_role;

-- Scheduled, idempotent billing. Each property failure is isolated and visible to its owner.
create function public.run_scheduled_rent() returns void language plpgsql security invoker set search_path='' as $$
declare p record; n integer;
begin
 if not pg_try_advisory_xact_lock(80231023) then return; end if;
 for p in select id from public.properties loop
  begin
   n=public.run_rent_cycle(p.id);
   insert into public.billing_runs(property_id,status,charges_created) values(p.id,'Succeeded',n);
  exception when others then
   insert into public.billing_runs(property_id,status,detail) values(p.id,'Failed',left(sqlerrm,500));
  end;
 end loop;
end $$;
revoke all on function public.run_scheduled_rent() from public,anon,authenticated;
grant execute on function public.run_scheduled_rent() to service_role;
create extension if not exists pg_cron;
select cron.schedule('nesthub-daily-rent','5 21 * * *','select public.run_scheduled_rent()');

create function public.finish_tenancy(p_actor uuid,p_assignment uuid,p_notes text) returns public.unit_assignments language plpgsql security invoker set search_path='' as $$
declare a public.unit_assignments; old_row jsonb;
begin
 if length(trim(coalesce(p_notes,''))) not between 10 and 3000 then raise exception 'Record the inspection, keys returned and remaining issues before ending the tenancy.'; end if;
 select * into a from public.unit_assignments where id=p_assignment and owner_id=p_actor for update;
 if a.id is null then raise exception 'Owner access required.'; end if;
 old_row=to_jsonb(a);
 a=public.end_workspace_assignment(p_actor,p_assignment);
 update public.unit_assignments set moveout_notes=p_notes where id=a.id returning * into a;
 insert into public.workflow_events(property_id,actor_id,entity_type,entity_id,action,before_data,after_data,reason) values(a.property_id,p_actor,'tenancy',a.id,'move-out',old_row,to_jsonb(a),p_notes);
 return a;
end $$;
revoke all on function public.finish_tenancy(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.finish_tenancy(uuid,uuid,text) to service_role;

-- Reserve metadata before upload, but do not count it as proof until upload finishes.
create or replace function public.reserve_repair_photo(p_actor uuid,p_repair uuid,p_path text,p_caption text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare u public.users; r public.property_repairs; p public.properties; result uuid;
begin
 select * into u from public.users where id=p_actor;
 select * into r from public.property_repairs where id=p_repair for update;
 select * into p from public.properties where id=r.property_id;
 if u.id is null or r.id is null or not coalesce((u.role='owner' and p.owner_id=u.id) or (u.property_id=p.id and (u.role='manager' or (u.role='tenant' and r.tenant_id=u.id) or (u.role='maintenance' and r.assigned_to=u.id))),false) then raise exception 'You cannot add evidence to this repair.'; end if;
 if r.status in ('Awaiting verification','Verified','Completed') then raise exception 'Evidence is frozen during verification. Request more work before adding new evidence.'; end if;
 if (select count(*) from public.repair_photos where repair_id=r.id)>=20 then raise exception 'A repair can have up to twenty evidence photos.'; end if;
 insert into public.repair_photos(repair_id,property_id,object_path,caption,created_by,ready) values(r.id,p.id,p_path,left(p_caption,200),u.id,false) returning id into result;
 return result;
end $$;

-- Financial changes leave before/after records; a full accounting ledger is a later migration.
create function public.audit_rental_money() returns trigger language plpgsql set search_path='' as $$
declare actor uuid;
begin
 actor=nullif(current_setting('nesthub.actor',true),'')::uuid;
 insert into public.workflow_events(property_id,actor_id,entity_type,entity_id,action,before_data,after_data)
 values(new.property_id,actor,TG_TABLE_NAME,new.id,TG_OP,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end $$;
create trigger rental_charge_audit after insert or update on public.rental_charges for each row execute function public.audit_rental_money();
create trigger rental_payment_audit after insert or update on public.rental_payments for each row execute function public.audit_rental_money();
create trigger rental_expense_audit after insert or update on public.property_expenses for each row execute function public.audit_rental_money();
revoke all on function public.audit_rental_money() from public,anon,authenticated;
revoke all on function public.guard_repair_evidence() from public,anon,authenticated;
