import { resolveApiBaseUrl } from './baseUrl.js';

// Set VITE_API_URL for deployment; leave unset for the local Spring Boot API.
const BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_URL) || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('nesthub-token');
}

export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(30000),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  }).catch(error => { throw new Error(error.name==='TimeoutError'?'The connection is taking too long. Please try again.':'Unable to connect. Check your internet connection and try again.'); });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Something went wrong.');
  }
  return body;
}

export function saveSession(authResponse) {
  localStorage.setItem('nesthub-token', authResponse.token);
  localStorage.setItem('nesthub-user', JSON.stringify({
    userId: authResponse.userId,
    fullName: authResponse.fullName,
    email: authResponse.email,
    role: authResponse.role
  }));
}

export function getSession() {
  const raw = localStorage.getItem('nesthub-user');
  try { return raw ? JSON.parse(raw) : null; }
  catch { clearSession(); return null; }
}

export async function logout() {
  try { await api('/api/auth/logout', { method: 'POST', body: '{}' }); }
  finally { clearSession(); }
}

export function clearSession() {
  localStorage.removeItem('nesthub-token');
  localStorage.removeItem('nesthub-user');
}

export { resolveApiBaseUrl };
