-- Draft upload mistakes may be removed, but completion locks evidence permanently.
-- Serialize removal with completion on the repair row, then remove the object via Storage API.
create function public.remove_draft_repair_photo(p_actor uuid,p_photo uuid) returns text language plpgsql security invoker set search_path='' as $$
declare u public.users; ph public.repair_photos; r public.property_repairs; p public.properties;
begin
 select * into u from public.users where id=p_actor;
 select * into ph from public.repair_photos where id=p_photo;
 if ph.id is null then raise exception 'Photo not found.'; end if;
 select * into r from public.property_repairs where id=ph.repair_id for update;
 select * into p from public.properties where id=r.property_id;
 if u.id is null or not coalesce((u.role='owner' and p.owner_id=u.id) or (u.property_id=p.id and (u.role='manager' or (ph.created_by=u.id and ((u.role='tenant' and r.tenant_id=u.id) or (u.role='maintenance' and r.assigned_to=u.id))))),false) then raise exception 'You cannot remove this photo.'; end if;
 if r.completed_by is not null or r.status in ('Awaiting verification','Verified','Completed') then raise exception 'Submitted repair evidence is retained. It cannot be deleted.'; end if;
 delete from public.repair_photos where id=ph.id;
 return ph.object_path;
end $$;
revoke all on function public.remove_draft_repair_photo(uuid,uuid) from public,anon,authenticated;
grant execute on function public.remove_draft_repair_photo(uuid,uuid) to service_role;
