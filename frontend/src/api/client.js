// Talks directly to the Spring Boot backend. Set VITE_API_URL in a .env file
// (e.g. VITE_API_URL=http://localhost:8080) - never hardcode the deployed URL here.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('nesthub-token');
}

export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

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
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem('nesthub-token');
  localStorage.removeItem('nesthub-user');
}
