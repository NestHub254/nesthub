import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Users2, ClipboardList, UserPlus } from 'lucide-react';
import { api, saveSession } from '../api/client.js';
import { GoogleIcon, AppleIcon, GithubIcon } from '../components/SocialIcons.jsx';

// Owner-only. Managers, maintenance, and tenants get their login created for them
// inside a dashboard (see OwnerHome / ManagerHome) — this form never appears to them.
export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const values = Object.fromEntries(new FormData(event.target));
    try {
      const result = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(values) });
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
          <p className="eyebrow">FOR PROPERTY OWNERS</p>
          <h1>Set up your NestHub workspace.</h1>
          <p>
            You're the root account. Once you're in, add your first property, then create
            logins for reception and maintenance. Tenants get their own app, invited by reception.
          </p>

          <div className="auth-visual">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
              alt="Apartment complex exterior"
              loading="lazy"
            />
            <span className="auth-chip c1"><Building2 size={15} /> Add properties in minutes</span>
            <span className="auth-chip c2"><Users2 size={15} /> Invite your team after</span>
          </div>
        </section>

        <section className="auth-card">
          <h2>Create your owner account</h2>
          <p>This registers you as the account owner for your properties.</p>

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
            <label>Full name<input name="fullName" required /></label>
            <label>Email<input type="email" name="email" required /></label>
            <label>Password<input type="password" name="password" required minLength={6} /></label>
            {error && <p style={{ color: '#a44545', fontSize: 12 }}>{error}</p>}
            <button className="button full" disabled={loading}>
              {loading ? 'Creating…' : (<><UserPlus size={15} /> Create account</>)}
            </button>
          </form>
          <small>Already have an account? <Link className="link" to="/login">Log in</Link></small>
          <small style={{ marginTop: 8, display: 'block' }}>
            <ClipboardList size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Reception or maintenance? Ask your owner to create your login — this page is owner-only.
          </small>
        </section>
      </main>
    </div>
  );
}