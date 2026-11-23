create table public.tenant_profiles (
 user_id uuid primary key references public.users(id) on delete cascade,
 bio text not null default '' check(length(bio)<=300), avatar_path text,
 updated_at timestamptz not null default now()
);
create table public.community_posts (
 id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
 author_id uuid not null references public.users(id), body text not null check(length(trim(body)) between 1 and 2000),
 created_at timestamptz not null default now()
);
create index community_posts_property_time on public.community_posts(property_id,created_at desc);
create index community_posts_author on public.community_posts(author_id);
-- Preserve existing resident group messages as the starting community history.
insert into public.community_posts(id,property_id,author_id,body,created_at)
select c.id,c.property_id,c.author_id,left(c.body,2000),c.created_at from public.property_conversations c
join public.users u on u.id=c.author_id where c.channel='Group' and u.role='tenant' and length(trim(c.body))>0;
create table public.communication_campaigns (
 id uuid primary key default gen_random_uuid(), property_id uuid not null references public.properties(id) on delete cascade,
 created_by uuid not null references public.users(id), request_id uuid not null,
 subject text not null check(length(subject) between 1 and 160), body text not null check(length(body) between 1 and 3000),
 channel text not null check(channel in ('Email','SMS','Both')), created_at timestamptz not null default now(),
 unique(created_by,request_id)
);
create index communication_campaigns_property on public.communication_campaigns(property_id,created_at desc);
create table public.communication_deliveries (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.communication_campaigns(id) on delete cascade,
 tenant_id uuid not null references public.users(id), channel text not null check(channel in ('Email','SMS')),
 destination text not null, status text not null default 'Queued' check(status in ('Queued','Sending','Accepted','Sandbox','Failed','Unavailable','Unknown','Skipped')),
 detail text not null default '', provider_id text, updated_at timestamptz not null default now(),
 unique(campaign_id,tenant_id,channel)
);
create index communication_deliveries_status on public.communication_deliveries(campaign_id,status);
create index communication_deliveries_tenant on public.communication_deliveries(tenant_id);
alter table public.tenant_profiles enable row level security;
alter table public.community_posts enable row level security;
alter table public.communication_campaigns enable row level security;
alter table public.communication_deliveries enable row level security;
revoke all on public.tenant_profiles,public.community_posts,public.communication_campaigns,public.communication_deliveries from anon,authenticated;
grant all on public.tenant_profiles,public.community_posts,public.communication_campaigns,public.communication_deliveries to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('community-avatars','community-avatars',false,1048576,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;

create function public.prepare_communication(p_actor uuid,p_property uuid,p_request uuid,p_subject text,p_body text,p_channel text,p_tenants uuid[])
returns uuid language plpgsql security invoker set search_path='' as $$
declare u public.users; p public.properties; result uuid; recipients uuid[];
begin
 select * into u from public.users where id=p_actor;
 select * into p from public.properties where id=p_property;
 if u.id is null or p.id is null or not ((u.role='owner' and p.owner_id=u.id) or (u.role in ('manager','maintenance') and u.property_id=p.id)) then raise exception 'Property team access required.'; end if;
 select id into result from public.communication_campaigns where created_by=p_actor and request_id=p_request;
 if result is not null then return result; end if;
 select array_agg(id) into recipients from public.users where property_id=p.id and role='tenant' and (p_tenants is null or id=any(p_tenants));
 if coalesce(cardinality(recipients),0)=0 then raise exception 'Choose at least one tenant in this property.'; end if;
 if cardinality(recipients)>1000 then raise exception 'Choose at most 1000 tenants per message.'; end if;
 if p_tenants is not null and exists(select 1 from unnest(p_tenants) t where not(t=any(recipients))) then raise exception 'Choose tenants from this property only.'; end if;
 insert into public.communication_campaigns(property_id,created_by,request_id,subject,body,channel) values(p.id,u.id,p_request,p_subject,p_body,p_channel)
 on conflict(created_by,request_id) do nothing returning id into result;
 if result is null then select id into result from public.communication_campaigns where created_by=p_actor and request_id=p_request; return result; end if;
 if p_channel in ('Email','Both') then
 insert into public.communication_deliveries(campaign_id,tenant_id,channel,destination) select result,id,'Email',email from public.users where id=any(recipients);
 end if;
 if p_channel in ('SMS','Both') then
 insert into public.communication_deliveries(campaign_id,tenant_id,channel,destination) select result,id,'SMS',coalesce(phone,'') from public.users where id=any(recipients);
 end if;
 return result;
end $$;
revoke all on function public.prepare_communication(uuid,uuid,uuid,text,text,text,uuid[]) from public,anon,authenticated;
grant execute on function public.prepare_communication(uuid,uuid,uuid,text,text,text,uuid[]) to service_role;

create function public.nesthub_communication_configuration() returns jsonb language sql security invoker set search_path='' as $$
 select coalesce(jsonb_object_agg(name,decrypted_secret),'{}'::jsonb) from vault.decrypted_secrets
 where name in ('nesthub_brevo_api_key','nesthub_reset_email_from','nesthub_at_api_key','nesthub_at_username','nesthub_at_sender','nesthub_at_mode');
$$;
revoke all on function public.nesthub_communication_configuration() from public,anon,authenticated;
grant execute on function public.nesthub_communication_configuration() to service_role;
