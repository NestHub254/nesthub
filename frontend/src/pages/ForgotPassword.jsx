import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client.js';

export default function ForgotPassword() {
  const location = useLocation();
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get('token') || '');
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && location.hash) window.history.replaceState(null, '', location.pathname + location.search);
  }, [location.hash, location.pathname, location.search, token]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (token && values.password !== values.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api(token ? '/api/auth/reset-password' : '/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(token ? { ...values, token } : values),
      });
      token ? setDone(true) : setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <header>
        <span className="brand"><img src="/brand/owner-mark.svg" alt="" width="36" height="36"/>NestHub</span>
        <Link className="text-button" to="/login">← Back to login</Link>
      </header>
      <main className="auth-wrap auth-recovery">
        <section className="auth-card">
          <p className="eyebrow">PROPERTY PORTAL</p>
          <h2>{done ? 'Password updated.' : token ? 'Choose a new password.' : 'Recover your account'}</h2>
          {done ? <p role="status">Your password was changed and previous sessions were signed out. Sign in with your new password.</p> : sent ? <div role="status"><p>If this email belongs to a NestHub account, a reset link and six-digit code will arrive shortly. Check your inbox and spam folder.</p><p>The link expires after 15 minutes.</p><button className="text-button" type="button" onClick={() => setSent(false)}>Try another email</button></div> : <>
            <p>{token ? 'Enter the six-digit code from the same email, then set your new password.' : 'Enter your account email. We’ll send a secure reset link and one-time code if it matches an account.'}</p>
            <form onSubmit={submit}>
              {token ? <>
                <label>One-time code<input name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required /></label>
                <label>New password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
                <label>Confirm new password<input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required /></label>
                <small>At least 8 characters. You have five attempts to enter the correct code.</small>
              </> : <label>Email<input name="email" type="email" autoComplete="email" required /></label>}
              {error && <p className="auth-error" role="alert">{error}</p>}
              <button className="button full" disabled={busy}>{busy ? 'Please wait…' : token ? 'Reset password' : 'Email me a reset link'}</button>
            </form>
          </>}
          <small><Link className="link" to="/login">Back to login</Link></small>
        </section>
      </main>
    </div>
  );
}
