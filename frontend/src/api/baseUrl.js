/**
 * Resolve the API origin for fetch calls.
 *
 * Path B (Firebase Hosting + Cloud Run rewrites): missing/empty VITE_API_URL
 * means same-origin relative requests (browser calls /api/... on the Hosting host).
 *
 * Explicit staging/production Cloud Run URLs remain supported.
 * Call sites always pass paths that start with "/api/...".
 *
 * Pure function — pass import.meta.env.VITE_API_URL from the Vite client entrypoint.
 */
export function resolveApiBaseUrl(raw) {
  if (raw == null) return '';
  const trimmed = String(raw).trim();
  if (trimmed === '' || trimmed === '/') return '';

  let base = trimmed.replace(/\/+$/, '');
  // Avoid https://host/api + /api/auth → https://host/api/api/auth
  if (/\/api$/i.test(base)) {
    base = base.slice(0, -4).replace(/\/+$/, '');
  }
  return base;
}
