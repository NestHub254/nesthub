-- Account creation and unit assignment either both succeed or both roll back.
create function public.create_tenant_with_unit(
 p_owner uuid,p_property uuid,p_name text,p_email text,p_password_hash text,
 p_unit uuid,p_rent numeric,p_deposit numeric,p_due integer,p_start date,p_end date default null
) returns public.users language plpgsql security invoker set search_path='' as $$
declare tenant public.users;
begin
 if not exists(select 1 from public.properties where id=p_property and owner_id=p_owner) then
   raise exception 'You do not own this property.' using errcode='P0001';
 end if;
 if not exists(select 1 from public.workspace_records where id=p_unit and owner_id=p_owner and property_id=p_property and category='units/inventory') then
   raise exception 'Choose a registered unit or room from this property.' using errcode='P0001';
 end if;
 insert into public.users(full_name,email,password_hash,role,property_id)
 values(p_name,p_email,p_password_hash,'tenant',p_property) returning * into tenant;
 perform public.assign_workspace_unit(p_owner,p_unit,tenant.id,p_rent,p_deposit,p_due,p_start,p_end);
 select * into tenant from public.users where id=tenant.id;
 return tenant;
end; $$;
revoke all on function public.create_tenant_with_unit(uuid,uuid,text,text,text,uuid,numeric,numeric,integer,date,date) from public,anon,authenticated;
grant execute on function public.create_tenant_with_unit(uuid,uuid,text,text,text,uuid,numeric,numeric,integer,date,date) to service_role;
