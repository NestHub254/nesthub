const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const SESSION_KEY = 'nesthub_tenant_session';

export async function api(path, options = {}) {
  const session = getSession();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  let body = null;
  try { body = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    throw new Error(body?.error || 'Unexpected server error. Please try again.');
  }
  return body;
}

// NOTE: Storing the session token in localStorage means any script running on
// this page (e.g. via an XSS bug) can read it. The real fix is an httpOnly
// cookie issued by the backend — that can't be done from the frontend alone.
// Until the backend supports that, keep this as the single choke point for
// reading/writing the session so swapping the storage strategy later only
// means editing this file.
export function saveSession(result) {
  if (!result || typeof result !== 'object') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
}

export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// Basic shared input guards used across the auth forms.
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

export function isValidKenyanPhone(value) {
  // Accepts 07XXXXXXXX, 01XXXXXXXX, or +2547XXXXXXXX / +2541XXXXXXXX
  return /^(?:\+254|0)(7|1)\d{8}$/.test((value || '').trim());
}
