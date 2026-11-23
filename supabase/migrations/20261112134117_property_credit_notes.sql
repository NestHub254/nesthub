-- Append-only bill corrections. Existing charges and payments are unchanged.
create table public.rental_credit_notes (
 id uuid primary key default gen_random_uuid(),
 property_id uuid not null references public.properties(id) on delete cascade,
 charge_id uuid not null references public.rental_charges(id),
 tenant_id uuid not null references public.users(id),
 amount numeric(12,2) not null check(amount>0),
 reason text not null check(length(trim(reason)) between 10 and 2000),
 created_by uuid not null references public.users(id),
 created_at timestamptz not null default now()
);
create index rental_credit_notes_charge_created_idx on public.rental_credit_notes(charge_id,created_at desc);
create index rental_credit_notes_property_created_idx on public.rental_credit_notes(property_id,created_at desc);
alter table public.rental_credit_notes enable row level security;
revoke all on public.rental_credit_notes from public,anon,authenticated;
grant select,insert on public.rental_credit_notes to service_role;

-- Serialize credit notes with payments using the bill row as the common lock.
create function public.enforce_credited_payment_limit()
returns trigger language plpgsql security invoker set search_path='' as $$
declare gross numeric(12,2); credits numeric(12,2); paid numeric(12,2);
begin
 if new.status not in ('Pending','Confirmed') then return new; end if;
 select amount into gross from public.rental_charges where id=new.charge_id for update;
 if gross is null then raise exception 'The bill no longer exists.'; end if;
 select coalesce(sum(amount),0) into credits from public.rental_credit_notes where charge_id=new.charge_id;
 select coalesce(sum(amount),0) into paid from public.rental_payments where charge_id=new.charge_id and status in ('Pending','Confirmed') and id<>new.id;
 if paid+new.amount>gross-credits then raise exception 'Payments exceed the bill balance after credit notes.'; end if;
 return new;
end;
$$;
create trigger rental_payment_credit_limit before insert or update of amount,charge_id,status on public.rental_payments
for each row execute function public.enforce_credited_payment_limit();
revoke all on function public.enforce_credited_payment_limit() from public,anon,authenticated;

create function public.issue_rental_credit_note(p_actor uuid,p_property uuid,p_charge uuid,p_amount numeric,p_reason text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare u public.users; p public.properties; c public.rental_charges; credit public.rental_credit_notes; paid numeric(12,2); credited numeric(12,2); reason_text text;
begin
 select * into u from public.users where id=p_actor;
 select * into p from public.properties where id=p_property;
 if u.id is null or p.id is null or not ((u.role='owner' and p.owner_id=u.id) or (u.role='manager' and u.property_id=p.id)) then raise exception 'Management access required.'; end if;
 select * into c from public.rental_charges where id=p_charge and property_id=p.id for update;
 if c.id is null then raise exception 'Bill not found in this property.'; end if;
 if c.kind='Deposit' then raise exception 'Security deposits use the move-out settlement workflow.'; end if;
 if p_amount is null or p_amount<=0 then raise exception 'Enter a positive credit amount.'; end if;
 reason_text=trim(coalesce(p_reason,''));
 if length(reason_text) not between 10 and 2000 then raise exception 'Explain the correction in 10 to 2000 characters.'; end if;
 select coalesce(sum(amount),0) into paid from public.rental_payments where charge_id=c.id and status in ('Pending','Confirmed');
 select coalesce(sum(amount),0) into credited from public.rental_credit_notes where charge_id=c.id;
 if p_amount>c.amount-paid-credited then raise exception 'Resolve pending payments first or reduce the credit to the remaining bill balance.'; end if;
 insert into public.rental_credit_notes(property_id,charge_id,tenant_id,amount,reason,created_by)
 values(p.id,c.id,c.tenant_id,p_amount,reason_text,u.id) returning * into credit;
 insert into public.workflow_events(property_id,actor_id,entity_type,entity_id,action,before_data,after_data,reason)
 values(p.id,u.id,'credit-note',credit.id,'credit-note',null,to_jsonb(credit),reason_text);
 insert into public.property_activity(property_id,actor_id,description)
 values(p.id,u.id,'Credit note · '||c.description||' · KES '||to_char(p_amount,'FM9999999990.00'));
 insert into public.property_conversations(property_id,author_id,recipient_id,channel,body)
 values(p.id,u.id,c.tenant_id,'Private','A credit note of KES '||to_char(p_amount,'FM9999999990.00')||' was applied to '||c.description||'. Reason: '||reason_text||' Your balance has been updated.');
 return jsonb_build_object('id',credit.id,'message','Credit note applied to the bill.');
end;
$$;
revoke all on function public.issue_rental_credit_note(uuid,uuid,uuid,numeric,text) from public,anon,authenticated;
grant execute on function public.issue_rental_credit_note(uuid,uuid,uuid,numeric,text) to service_role;
