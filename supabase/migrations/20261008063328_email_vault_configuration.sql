-- Only the server's service role can read this fixed pair of email settings.
create function public.nesthub_email_configuration()
returns jsonb language sql security invoker set search_path='' as $$
 select coalesce(jsonb_object_agg(name,decrypted_secret),'{}'::jsonb)
 from vault.decrypted_secrets
 where name in ('nesthub_brevo_api_key','nesthub_reset_email_from');
$$;
revoke all on function public.nesthub_email_configuration() from public,anon,authenticated;
grant execute on function public.nesthub_email_configuration() to service_role;
