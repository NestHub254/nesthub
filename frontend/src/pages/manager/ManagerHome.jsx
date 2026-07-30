import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api/client.js';
import { UserPlus } from 'lucide-react';

export default function ManagerHome({ session }) {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleAddTenant(event) {
    event.preventDefault();
    setError('');
    const values = Object.fromEntries(new FormData(event.target));
    try {
      await api('/api/users', { method: 'POST', body: JSON.stringify({ ...values, role: 'tenant' }) });
      setShowModal(false);
      setToast('Tenant account created.');
      event.target.reset();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell session={session} title="Ticket queue">
      {toast && <div className="toast show">{toast}</div>}
      <div className="section-head">
        <h2>Tenants</h2>
        <button className="button" onClick={() => { setError(''); setShowModal(true); }}>
          <UserPlus size={14} /> Add tenant
        </button>
      </div>
      <section className="empty">
        <p className="eyebrow">COMING IN PHASE 3</p>
        <p>Tenant directory and ticket queue will render here. Use "Add tenant" to create a
          login for a new resident — they'll use it on the separate tenant app.</p>
      </section>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowModal(false)}>×</button>
            <p className="eyebrow">NEW TENANT</p>
            <h2>Add a tenant</h2>
            <form onSubmit={handleAddTenant}>
              <label>Full name<input name="fullName" required /></label>
              <label>Unit<input name="unitLabel" placeholder="e.g. ACACIA-4B" required /></label>
              <label>Email<input type="email" name="email" required /></label>
              <label>Temporary password<input type="password" name="password" required minLength={6} /></label>
              {error && <p style={{ color: '#a44545', fontSize: 12 }}>{error}</p>}
              <button className="button full">Create login</button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
