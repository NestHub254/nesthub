ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_subject text UNIQUE;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized ON public.users (lower(email));
CREATE TABLE public.app_sessions (
  token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX app_sessions_expiry ON public.app_sessions(expires_at);
CREATE TABLE public.auth_attempts (
  bucket text NOT NULL, started_at timestamptz NOT NULL, attempts integer NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket, started_at)
);
ALTER TABLE public.app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.app_sessions, public.auth_attempts FROM anon, authenticated;
GRANT ALL ON public.app_sessions, public.auth_attempts TO service_role;
CREATE OR REPLACE FUNCTION public.consume_auth_attempt(bucket_key text, window_start timestamptz)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE result integer;
BEGIN
  DELETE FROM public.auth_attempts WHERE started_at < now() - interval '1 day';
  DELETE FROM public.app_sessions WHERE expires_at < now();
  INSERT INTO public.auth_attempts(bucket,started_at) VALUES(bucket_key,window_start)
  ON CONFLICT(bucket,started_at) DO UPDATE SET attempts=public.auth_attempts.attempts+1
  RETURNING attempts INTO result;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.consume_auth_attempt(text,timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_auth_attempt(text,timestamptz) TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flyway_schema_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.users,public.properties,public.units,public.leases,public.payments,public.tickets,public.ticket_updates,public.announcements,public.staff_messages,public.flyway_schema_history FROM anon,authenticated;
GRANT ALL ON public.users,public.properties TO service_role;
REVOKE ALL ON FUNCTION public.claim_ticket(uuid,uuid) FROM PUBLIC,anon,authenticated;
