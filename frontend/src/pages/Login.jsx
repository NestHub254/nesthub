import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Wrench } from 'lucide-react';
import { api, saveSession } from '../api/client.js';
import { GoogleIcon, AppleIcon, GithubIcon } from '../components/SocialIcons.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const values = Object.fromEntries(new FormData(event.target));
    try {
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(values) });
      saveSession(result);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // OAuth is handled server-side — this just sends the browser to the provider's
  // consent screen, and the backend redirects back to /app with a session.
  function handleOAuth(provider) {
    window.location.href = `/api/auth/${provider}`;
  }

  return (
    <div className="auth-page">
      <header>
        <span className="brand"><span>n</span>NestHub</span>
        <Link className="text-button" to="/">← Back to home</Link>
      </header>
      <main className="auth-wrap">
        <section className="auth-copy">
          <p className="eyebrow">STAFF PORTAL</p>
          <h1>Welcome back.</h1>
          <p>Log in with the account your owner or reception team set up for you.</p>

          <div className="auth-visual">
            <img
              src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
              alt="Modern residential building"
              loading="lazy"
            />
            <span className="auth-chip c1"><ShieldCheck size={15} /> Secure role access</span>
            <span className="auth-chip c2"><Wrench size={15} /> Live maintenance sync</span>
          </div>
        </section>

        <section className="auth-card">
          <h2>Log in to NestHub</h2>

          <div className="oauth-row">
            <button type="button" className="oauth-btn" onClick={() => handleOAuth('google')}>
              <GoogleIcon /> Continue with Google
            </button>
            <button type="button" className="oauth-btn" onClick={() => handleOAuth('apple')}>
              <AppleIcon /> Continue with Apple
            </button>
            <button type="button" className="oauth-btn" onClick={() => handleOAuth('github')}>
              <GithubIcon /> Continue with GitHub
            </button>
          </div>

          <div className="or"><i></i>or continue with email<i></i></div>

          <form onSubmit={handleSubmit}>
            <label>Email<input type="email" name="email" required /></label>
            <label>Password<input type="password" name="password" required minLength={6} /></label>
            {error && <p style={{ color: '#a44545', fontSize: 12 }}>{error}</p>}
            <button className="button full" disabled={loading}>
              {loading ? 'Logging in…' : (<><KeyRound size={15} /> Log in</>)}
            </button>
          </form>
          <small>New owner? <Link className="link" to="/register">Create an account</Link></small>
        </section>
      </main>
    </div>
  );
}