import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Smartphone } from 'lucide-react';
import { api, isValidKenyanPhone } from '../api/client.js';

export default function ForgotPassword() {
  const [method, setMethod] = useState('email'); // 'email' | 'mobile'
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const values = Object.fromEntries(new FormData(event.target));

    if (method === 'mobile' && !isValidKenyanPhone(values.phone)) {
      setError('Enter a valid Kenyan mobile number, e.g. 07XXXXXXXX.');
      return;
    }

    setLoading(true);
    try {
      if (method === 'email') {
        // NOTE: /api/auth/forgot-password doesn't exist on the backend yet —
        // add that endpoint (send reset email/token) before this will work end to end.
        await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(values) });
      } else {
        // NOTE: /api/auth/forgot-password/sms doesn't exist yet either — this
        // needs an SMS provider (e.g. Africa's Talking) wired up server-side
        // to actually send a reset code.
        await api('/api/auth/forgot-password/sms', { method: 'POST', body: JSON.stringify(values) });
      }
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tp-page">
      <div className="tp-card tp-card-narrow">
        <div className="tp-form-side">
          <span className="tp-brand"><span className="tp-mark">n</span>NestHub</span>
          <p className="tp-eyebrow">Tenant Portal</p>
          <h1>Reset your password.</h1>

          {sent ? (
            <p className="tp-sub">
              {method === 'email'
                ? "If that email has an account, we've sent a reset link to it."
                : "If that number has an account, we've sent a reset code to it by SMS."}
            </p>
          ) : (
            <>
              <div className="tp-tabs" role="tablist" aria-label="Reset method">
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === 'email'}
                  className={`tp-tab ${method === 'email' ? 'tp-tab-active' : ''}`}
                  onClick={() => { setMethod('email'); setError(''); }}
                >
                  <Mail size={15} strokeWidth={1.75} /> Email
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={method === 'mobile'}
                  className={`tp-tab ${method === 'mobile' ? 'tp-tab-active' : ''}`}
                  onClick={() => { setMethod('mobile'); setError(''); }}
                >
                  <Smartphone size={15} strokeWidth={1.75} /> Mobile number
                </button>
              </div>

              <p className="tp-sub">
                {method === 'email'
                  ? 'Enter the email your reception team used to set up your account.'
                  : "Enter the mobile number your reception team used to set up your account. We'll text you a reset code."}
              </p>

              <form onSubmit={handleSubmit}>
                {method === 'email' ? (
                  <label>Email
                    <input type="email" name="email" required autoFocus />
                  </label>
                ) : (
                  <label>Mobile number
                    <input type="tel" name="phone" placeholder="07XX XXX XXX" required autoFocus />
                  </label>
                )}
                {error && <p className="tp-error">{error}</p>}
                <button className="tp-btn" disabled={loading}>
                  {loading ? 'Sending…' : method === 'email' ? 'Send reset link' : 'Send reset code'}
                </button>
              </form>
            </>
          )}
          <p className="tp-fine"><Link className="tp-link" to="/login">← Back to log in</Link></p>
        </div>
      </div>
    </div>
  );
}
