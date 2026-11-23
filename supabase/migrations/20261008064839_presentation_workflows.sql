alter table public.property_conversations drop constraint property_conversations_channel_check;
alter table public.property_conversations add constraint property_conversations_channel_check check(channel in ('Group','Announcements','Private','Staff'));
create table public.repair_photos(
 id uuid primary key default gen_random_uuid(), repair_id uuid not null references public.property_repairs(id) on delete cascade,
 property_id uuid not null references public.properties(id) on delete cascade,
 object_path text unique not null, caption text not null default '', created_by uuid not null references public.users(id),
 created_at timestamptz not null default now()
);
create index repair_photos_repair_idx on public.repair_photos(repair_id);
create index repair_photos_property_idx on public.repair_photos(property_id);
alter table public.repair_photos enable row level security;
revoke all on public.repair_photos from anon,authenticated;
grant all on public.repair_photos to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('repair-photos','repair-photos',false,3145728,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;

create function public.reserve_repair_photo(p_actor uuid,p_repair uuid,p_path text,p_caption text)
returns uuid language plpgsql security invoker set search_path='' as $$
declare u public.users; r public.property_repairs; p public.properties; result uuid;
begin
 select * into u from public.users where id=p_actor;
 select * into r from public.property_repairs where id=p_repair for update;
 select * into p from public.properties where id=r.property_id;
 if u.id is null or r.id is null or p.id is null or not coalesce((u.role='owner' and p.owner_id=u.id) or (u.property_id=p.id and (u.role='manager' or (u.role='tenant' and r.tenant_id=u.id) or (u.role='maintenance' and r.assigned_to=u.id))),false) then raise exception 'You cannot add a photo to this repair.'; end if;
 if (select count(*) from public.repair_photos where repair_id=r.id)>=5 then raise exception 'A repair can have up to five photos.'; end if;
 insert into public.repair_photos(repair_id,property_id,object_path,caption,created_by) values(r.id,p.id,p_path,left(p_caption,200),u.id) returning id into result;
 return result;
end $$;
revoke all on function public.reserve_repair_photo(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.reserve_repair_photo(uuid,uuid,text,text) to service_role;
create or replace function public.rental_action(p_actor uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare u public.users; p public.properties; c public.rental_charges; pay public.rental_payments; exp public.property_expenses; rep public.property_repairs;
 v uuid; tenant uuid; amt numeric(12,2); total numeric(12,2); msg text; ref text; target uuid; begin
 select * into u from public.users where id=p_actor;
 select * into p from public.properties where id=(p_data->>'propertyId')::uuid;
 if u.id is null or p.id is null or not ((u.role='owner' and p.owner_id=u.id) or (u.role<>'owner' and u.property_id=p.id)) then raise exception 'You do not have access to this property.'; end if;
 if p_action='rent' then
 if u.role not in ('owner','manager','tenant') then raise exception 'Rent access denied.'; end if;
 perform public.run_rent_cycle(p.id); return '{"ok":true}';
 elsif p_action='payment' then
 if u.role not in ('owner','manager','tenant') then raise exception 'Payment access denied.'; end if;
 select * into c from public.rental_charges where id=(p_data->>'chargeId')::uuid and property_id=p.id for update;
 if c.id is null or (u.role='tenant' and c.tenant_id<>u.id) then raise exception 'Choose your own bill.'; end if;
 amt=(p_data->>'amount')::numeric; ref=upper(trim(p_data->>'reference'));
 if amt is null or amt<=0 or length(coalesce(ref,'')) not between 3 and 120 then raise exception 'Enter a positive amount and a payment reference.'; end if;
 if (p_data->>'paidOn')::date>(now() at time zone 'Africa/Nairobi')::date then raise exception 'Payment date cannot be in the future.'; end if;
 select coalesce(sum(amount),0) into total from public.rental_payments where charge_id=c.id and status in ('Pending','Confirmed');
 if amt>c.amount-total then raise exception 'Amount exceeds the bill balance, including payments awaiting review.'; end if;
 if u.role='tenant' and p_data->>'method'='Cash' then raise exception 'Ask management to record a cash payment.'; end if;
 insert into public.rental_payments(property_id,charge_id,tenant_id,amount,method,reference,paid_on,submitted_by)
 values(p.id,c.id,c.tenant_id,amt,p_data->>'method',ref,(p_data->>'paidOn')::date,u.id) returning id into v;
 msg='Payment submitted for confirmation';
 elsif p_action='review-payment' then
 if u.role not in ('owner','manager') then raise exception 'Management access required.'; end if;
 select * into pay from public.rental_payments where id=(p_data->>'id')::uuid and property_id=p.id for update;
 if pay.id is null or pay.status<>'Pending' then raise exception 'This payment is no longer awaiting review.'; end if;
 if p_data->>'status' not in ('Confirmed','Rejected') then raise exception 'Choose confirm or reject.'; end if;
 perform 1 from public.rental_charges where id=pay.charge_id for update;
 update public.rental_payments set status=p_data->>'status',reviewed_by=u.id where id=pay.id returning id into v;
 insert into public.property_conversations(property_id,author_id,recipient_id,channel,body) values(p.id,u.id,pay.tenant_id,'Private','Your payment reference '||pay.reference||' was '||lower(p_data->>'status')||'. View My money for details.');
 msg='Payment '||lower(p_data->>'status')||' · '||pay.reference;
 elsif p_action='charge' then
 if u.role not in ('owner','manager') then raise exception 'Management access required.'; end if;
 tenant=(p_data->>'tenantId')::uuid;
 if not exists(select 1 from public.users where id=tenant and role='tenant' and property_id=p.id) then raise exception 'Choose a tenant in this property.'; end if;
 insert into public.rental_charges(property_id,tenant_id,kind,description,amount,due_on) values(p.id,tenant,p_data->>'kind',p_data->>'description',(p_data->>'amount')::numeric,(p_data->>'dueOn')::date) returning id into v;
 msg='Tenant bill added · '||(p_data->>'kind');
 elsif p_action='expense' then
 if u.role not in ('owner','manager') then raise exception 'Management access required.'; end if;
 insert into public.property_expenses(property_id,category,description,amount,supplier,due_on,submitted_by)
 values(p.id,p_data->>'category',p_data->>'description',(p_data->>'amount')::numeric,p_data->>'supplier',(p_data->>'dueOn')::date,u.id) returning id into v;
 msg='Expense submitted for owner approval';
 elsif p_action='review-expense' then
 if u.role<>'owner' then raise exception 'Only the owner can approve expenses or mark them paid.'; end if;
 select * into exp from public.property_expenses where id=(p_data->>'id')::uuid and property_id=p.id for update;
 if exp.id is null or not ((exp.status='Pending' and p_data->>'status' in ('Approved','Rejected')) or (exp.status='Approved' and p_data->>'status'='Paid')) then raise exception 'This expense cannot move to that status.'; end if;
 update public.property_expenses set status=p_data->>'status',paid_on=case when p_data->>'status'='Paid' then (now() at time zone 'Africa/Nairobi')::date else null end where id=exp.id returning id into v;
 msg='Expense '||lower(p_data->>'status')||' · '||exp.description;
 elsif p_action='instructions' then
 if u.role<>'owner' then raise exception 'Owner access required.'; end if;
 update public.properties set payment_instructions=coalesce(p_data->>'instructions','') where id=p.id;
 msg='Payment instructions updated';
 elsif p_action='message' then
 if u.role='maintenance' and coalesce(p_data->>'channel','')<>'Staff' then raise exception 'Maintenance staff can use team chat only.'; end if;
 if u.role='tenant' and p_data->>'channel'='Staff' then raise exception 'Staff chat is private to the property team.'; end if;
 if p_data->>'channel'='Announcements' and u.role='tenant' then raise exception 'Only management can publish announcements.'; end if;
 target=nullif(p_data->>'recipientId','')::uuid;
 if p_data->>'channel'='Private' then
 if u.role='tenant' then target=u.id;
 elsif not exists(select 1 from public.users where id=target and role='tenant' and property_id=p.id) then raise exception 'Choose a tenant in this property.'; end if;
 else target=null; end if;
 insert into public.property_conversations(property_id,author_id,recipient_id,channel,body) values(p.id,u.id,target,p_data->>'channel',p_data->>'body') returning id into v;
 msg='Message sent in NestHub';
 elsif p_action='remind' then
 if u.role not in ('owner','manager') then raise exception 'Management access required.'; end if;
 select * into c from public.rental_charges where id=(p_data->>'id')::uuid and property_id=p.id;
 if c.id is null then raise exception 'Bill not found.'; end if;
 select c.amount-coalesce(sum(amount),0) into total from public.rental_payments where charge_id=c.id and status='Confirmed';
 if total<=0 then raise exception 'This bill is already paid.'; end if;
 insert into public.property_conversations(property_id,author_id,recipient_id,channel,body) values(p.id,u.id,c.tenant_id,'Private','Payment reminder: '||c.description||'. Outstanding KES '||total||', due '||c.due_on||'. Open My money to see payment instructions.');
 msg='Rent / bill reminder sent in NestHub';
 elsif p_action='repair' then
 if u.role='maintenance' then raise exception 'Only residents or management can report a repair.'; end if;
 tenant=case when u.role='tenant' then u.id else nullif(p_data->>'tenantId','')::uuid end;
 if tenant is not null and not exists(select 1 from public.users where id=tenant and property_id=p.id and role='tenant') then raise exception 'Choose a tenant in this property.'; end if;
 select unit_id into target from public.unit_assignments where tenant_id=tenant and property_id=p.id and ended_at is null;
 insert into public.property_repairs(property_id,tenant_id,unit_id,title,description,priority) values(p.id,tenant,target,p_data->>'title',p_data->>'description',p_data->>'priority') returning id into v;
 msg='Repair reported · '||(p_data->>'title');
 elsif p_action='update-repair' then
 select * into rep from public.property_repairs where id=(p_data->>'id')::uuid and property_id=p.id for update;
 if rep.id is null or not (u.role in ('owner','manager') or (u.role='maintenance' and rep.assigned_to=u.id)) then raise exception 'Only management or assigned staff may update this repair.'; end if;
 target=nullif(p_data->>'assignedTo','')::uuid;
 if u.role='maintenance' then target=rep.assigned_to; end if;
 if target is not null and not exists(select 1 from public.users where id=target and property_id=p.id and role in ('manager','maintenance')) then raise exception 'Choose staff in this property.'; end if;
 update public.property_repairs set status=p_data->>'status',assigned_to=target,update_note=p_data->>'note',updated_at=now() where id=rep.id returning id into v;
 if rep.tenant_id is not null then insert into public.property_conversations(property_id,author_id,recipient_id,channel,body) values(p.id,u.id,rep.tenant_id,'Private','Repair update: '||rep.title||' · '||(p_data->>'status')||'. '||(p_data->>'note')); end if;
 msg='Repair updated · '||rep.title||' · '||(p_data->>'status');
 else raise exception 'Unknown action.'; end if;
 insert into public.property_activity(property_id,actor_id,description) values(p.id,u.id,msg);
 return jsonb_build_object('id',v,'message',msg);
end $$;
