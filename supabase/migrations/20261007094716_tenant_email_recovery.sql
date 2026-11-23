create table public.tenant_password_resets (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id) on delete cascade,
 email text not null, token_hash text unique not null, otp_hash text not null,
 attempts integer not null default 0, expires_at timestamptz not null, consumed_at timestamptz,
 created_at timestamptz not null default now()
);
create index tenant_password_resets_user_idx on public.tenant_password_resets(user_id);
alter table public.tenant_password_resets enable row level security;
revoke all on public.tenant_password_resets from anon,authenticated;
grant all on public.tenant_password_resets to service_role;

create function public.complete_tenant_password_reset(p_token text,p_otp text,p_password_hash text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.tenant_password_resets; u public.users; uid uuid;
begin
 select user_id into uid from public.tenant_password_resets where token_hash=p_token;
 if uid is null then return false; end if;
 select * into u from public.users where id=uid for update;
 select * into r from public.tenant_password_resets where token_hash=p_token for update;
 if r.id is null or r.consumed_at is not null or r.expires_at<=now() or r.attempts>=5 or u.role<>'tenant' or u.property_id is null or u.email<>r.email then return false; end if;
 if r.otp_hash<>p_otp then
  update public.tenant_password_resets set attempts=attempts+1 where id=r.id;
  return false;
 end if;
 update public.users set password_hash=p_password_hash where id=u.id;
 update public.tenant_password_resets set consumed_at=now() where user_id=u.id and consumed_at is null;
 delete from public.app_sessions where user_id=u.id;
 return true;
end; $$;
revoke all on function public.complete_tenant_password_reset(text,text,text) from public,anon,authenticated;
grant execute on function public.complete_tenant_password_reset(text,text,text) to service_role;

create function public.edit_tenant_contact(p_actor uuid,p_tenant uuid,p_name text,p_email text,p_phone text)
returns void language plpgsql security invoker set search_path='' as $$
declare actor public.users; resident public.users; property public.properties;
begin
 select * into actor from public.users where id=p_actor;
 select * into resident from public.users where id=p_tenant for update;
 select * into property from public.properties where id=resident.property_id;
 if resident.id is null or resident.role<>'tenant' or property.id is null or not ((actor.role='owner' and property.owner_id=actor.id) or (actor.role='manager' and actor.property_id=property.id)) then raise exception 'You cannot edit this tenant.'; end if;
 update public.users set full_name=p_name,email=p_email,phone=nullif(p_phone,'') where id=resident.id;
 if p_email<>resident.email then
  delete from public.app_sessions where user_id=resident.id;
  update public.tenant_password_resets set consumed_at=now() where user_id=resident.id and consumed_at is null;
 end if;
 insert into public.property_activity(property_id,actor_id,description) values(property.id,actor.id,'Tenant contact details updated · '||p_name);
end; $$;
revoke all on function public.edit_tenant_contact(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.edit_tenant_contact(uuid,uuid,text,text,text) to service_role;
