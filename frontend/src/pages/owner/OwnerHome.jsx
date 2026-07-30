import { useEffect, useState } from 'react';
import AppShell from '../../components/AppShell.jsx';
import { api } from '../../api/client.js';
import { Plus, Building2, UserPlus } from 'lucide-react';

export default function OwnerHome({ session }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffPropertyId, setStaffPropertyId] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  async function loadProperties() {
    setLoading(true);
    try {
      setProperties(await api('/api/properties/mine'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProperties(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleAddProperty(event) {
    event.preventDefault();
    setError('');
    const values = Object.fromEntries(new FormData(event.target));
    try {
      await api('/api/properties', { method: 'POST', body: JSON.stringify(values) });
      setShowPropertyModal(false);
      setToast('Property added.');
      loadProperties();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddStaff(event) {
    event.preventDefault();
    setError('');
    const values = Object.fromEntries(new FormData(event.target));
    try {
      await api('/api/users', { method: 'POST', body: JSON.stringify({ ...values, propertyId: staffPropertyId }) });
      setShowStaffModal(false);
      setToast(`${values.role === 'manager' ? 'Reception' : 'Maintenance'} account created.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell session={session} title="Portfolio overview">
      {toast && <div className="toast show">{toast}</div>}

      <div className="section-head">
        <h2>Your properties</h2>
        <button className="button" onClick={() => { setError(''); setShowPropertyModal(true); }}>
          <Plus size={14} /> Add property
        </button>
      </div>

      {loading ? <p>Loading…</p> : properties.length === 0 ? (
        <section className="empty">
          <Building2 size={28} />
          <p className="eyebrow">NO PROPERTIES YET</p>
          <p>Add your first property to start creating reception and maintenance logins.</p>
        </section>
      ) : (
        <div className="metric-grid">
          {properties.map(p => (
            <article key={p.id}>
              <span>{p.address || 'No address set'}</span>
              <strong>{p.name}</strong>
              <button
                className="small-button"
                onClick={() => { setStaffPropertyId(p.id); setError(''); setShowStaffModal(true); }}
              >
                <UserPlus size={12} /> Add staff
              </button>
            </article>
          ))}
        </div>
      )}

      {showPropertyModal && (
        <div className="modal-bg" onClick={() => setShowPropertyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowPropertyModal(false)}>×</button>
            <p className="eyebrow">NEW PROPERTY</p>
            <h2>Add a property</h2>
            <form onSubmit={handleAddProperty}>
              <label>Property name<input name="name" required /></label>
              <label>Address<input name="address" /></label>
              {error && <p style={{ color: '#a44545', fontSize: 12 }}>{error}</p>}
              <button className="button full">Save property</button>
            </form>
          </div>
        </div>
      )}

      {showStaffModal && (
        <div className="modal-bg" onClick={() => setShowStaffModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setShowStaffModal(false)}>×</button>
            <p className="eyebrow">NEW STAFF LOGIN</p>
            <h2>Add reception or maintenance</h2>
            <form onSubmit={handleAddStaff}>
              <label>Full name<input name="fullName" required /></label>
              <label>Email<input type="email" name="email" required /></label>
              <label>Temporary password<input type="password" name="password" required minLength={6} /></label>
              <label>Role
                <select name="role" required defaultValue="manager">
                  <option value="manager">Reception / Grounds manager</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </label>
              {error && <p style={{ color: '#a44545', fontSize: 12 }}>{error}</p>}
              <button className="button full">Create login</button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
