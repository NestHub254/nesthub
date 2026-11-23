-- Workflow audit rows are append-only; preserve the service API's read/insert needs.
revoke update, delete, truncate on public.workflow_events from service_role;
grant select, insert on public.workflow_events to service_role;
