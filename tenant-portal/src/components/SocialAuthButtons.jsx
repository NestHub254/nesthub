import { Github } from 'lucide-react';
import { useState } from 'react';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.94a9 9 0 0 0 0 8.06l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .94 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"/>
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 14 16" aria-hidden="true" fill="#14142b">
      <path d="M11.3 8.5c0-1.8 1.5-2.7 1.6-2.7-.9-1.3-2.2-1.4-2.7-1.5-1.1-.1-2.2.7-2.8.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.75-3.1 1.9-1.35 2.35-.34 5.8.96 7.7.64.93 1.4 1.98 2.4 1.94.96-.04 1.32-.62 2.48-.62s1.48.62 2.5.6c1.03-.02 1.68-.94 2.32-1.87.73-1.07 1.03-2.11 1.04-2.16-.02-.01-2-.77-2-3.02z"/>
      <path d="M9.4 2.9c.52-.63.87-1.5.78-2.38-.75.03-1.66.5-2.2 1.13-.48.55-.9 1.44-.79 2.29.83.06 1.68-.42 2.21-1.04z"/>
    </svg>
  );
}

export default function SocialAuthButtons({ onUnavailable }) {
  const [flash, setFlash] = useState(null);

  function handleClick(provider) {
    setFlash(provider);
    onUnavailable?.(provider);
    setTimeout(() => setFlash(null), 1800);
  }

  return (
    <div className="tp-social">
      <div className="tp-social-divider"><span>or continue with</span></div>
      <div className="tp-social-row">
        <button type="button" className="tp-social-btn" onClick={() => handleClick('Google')} aria-label="Continue with Google">
          <GoogleMark />
        </button>
        <button type="button" className="tp-social-btn" onClick={() => handleClick('Apple')} aria-label="Continue with Apple">
          <AppleMark />
        </button>
        <button type="button" className="tp-social-btn" onClick={() => handleClick('GitHub')} aria-label="Continue with GitHub">
          <Github size={18} strokeWidth={1.75} />
        </button>
      </div>
      {flash && <p className="tp-social-note">{flash} sign-in isn't connected yet — ask reception for an email login for now.</p>}
    </div>
  );
}
