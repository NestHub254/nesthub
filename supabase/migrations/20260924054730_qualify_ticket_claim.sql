CREATE OR REPLACE FUNCTION public.claim_ticket(target_ticket uuid, worker_id uuid)
RETURNS public.tickets LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  UPDATE public.tickets SET claimed_by = worker_id, status = 'IN_PROGRESS'
  WHERE id = target_ticket AND claimed_by IS NULL AND status = 'OPEN'
  RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.claim_ticket(uuid,uuid) FROM PUBLIC,anon,authenticated;
