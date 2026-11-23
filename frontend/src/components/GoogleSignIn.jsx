import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveSession } from '../api/client.js';

let scriptPromise;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => { script.remove(); scriptPromise = null; reject(new Error('Google could not load. Please use email login or try again.')); };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export default function GoogleSignIn({ register = false, portal = 'staff' }) {
  const target = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let active = true;
    if (!clientId) return;
    loadGoogle().then(() => {
      if (!active) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: false,
        callback: async ({ credential }) => {
          if (!active) return;
          setBusy(true);
          setError('');
          try {
            const result = await api('/api/auth/google', {
              method: 'POST', body: JSON.stringify({ credential, portal, register }),
            });
            if ((portal === 'tenant') !== (result.role === 'tenant')) {
              throw new Error('Please use the portal for your account.');
            }
            saveSession(result);
            navigate('/app');
          } catch (err) { if (active) setError(err.message); }
          finally { if (active) setBusy(false); }
        },
      });
      target.current.replaceChildren();
      window.google.accounts.id.renderButton(target.current, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
        width: Math.min(340, target.current.clientWidth || 280),
      });
    }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [clientId, navigate, portal, register]);

  return <div style={{ margin: '16px 0' }}>
    {clientId ? <div ref={target} aria-label="Continue with Google" />
      : <button type="button" className="oauth-btn" disabled>Google sign-in is being configured</button>}
    {busy && <p role="status">Signing in…</p>}
    {error && <p role="alert" style={{ color: '#a44545', fontSize: 13 }}>{error}</p>}
  </div>;
}
