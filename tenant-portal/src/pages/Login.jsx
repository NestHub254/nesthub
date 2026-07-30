import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, saveSession } from '../api/client.js';
import SocialAuthButtons from '../components/SocialAuthButtons.jsx';

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
      if (result.role !== 'tenant') {
        throw new Error('This portal is for tenant accounts only.');
      }
      saveSession(result);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tp-page">
      <div className="tp-card">
        <div className="tp-form-side">
          <span className="tp-brand"><span className="tp-mark">n</span>NestHub</span>
          <p className="tp-eyebrow">Tenant Portal</p>
          <h1>Welcome back.</h1>
          <p className="tp-sub">Log in with the account your building's reception team set up for you.</p>

          <form onSubmit={handleSubmit}>
            <label>Email
              <input type="email" name="email" required autoFocus />
            </label>
            <label>Password
              <input type="password" name="password" required minLength={6} />
            </label>
            <div className="tp-row">
              <Link className="tp-link" to="/forgot-password">Forgot password?</Link>
            </div>
            {error && <p className="tp-error">{error}</p>}
            <button className="tp-btn" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
          </form>

          <SocialAuthButtons />

          <p className="tp-fine">Don't have a login yet? Ask your building's reception desk to create one for you.</p>
        </div>

        <div className="tp-image-side">
          <img
            src="https://images.unsplash.com/photo-1757372429884-92e02350c5d9?fm=jpg&q=80&w=1400&auto=format&fit=crop"
            alt="Apartment building at dusk"
          />
          <div className="tp-quote">
            <p>"I can pay rent, check on a repair, and message reception without a single phone call."</p>
            <strong>Amina W.</strong>
            <span>Resident, sample tenant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
