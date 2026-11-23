-- Extend the existing tenant recovery tokens to every property role.
-- Tokens remain hashed, time-limited, single-use, and session-revoking.
create function public.complete_account_password_reset(p_token text,p_otp text,p_password_hash text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.tenant_password_resets; u public.users; uid uuid;
begin
 select user_id into uid from public.tenant_password_resets where token_hash=p_token;
 if uid is null then return false; end if;
 select * into u from public.users where id=uid for update;
 select * into r from public.tenant_password_resets where token_hash=p_token for update;
 if r.id is null or r.consumed_at is not null or r.expires_at<=now() or r.attempts>=5 or u.id is null or lower(u.email)<>lower(r.email) then return false; end if;
 if r.otp_hash<>p_otp then
  update public.tenant_password_resets set attempts=attempts+1 where id=r.id;
  return false;
 end if;
 update public.users set password_hash=p_password_hash where id=u.id;
 update public.tenant_password_resets set consumed_at=now() where user_id=u.id and consumed_at is null;
 delete from public.app_sessions where user_id=u.id;
 return true;
end;
$$;
revoke all on function public.complete_account_password_reset(text,text,text) from public,anon,authenticated;
grant execute on function public.complete_account_password_reset(text,text,text) to service_role;
