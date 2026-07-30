import { useState } from 'react';
import { FileText, Pencil, Save, X } from 'lucide-react';
import { useStore } from '../../data/mockStore.jsx';
import { isValidEmail, isValidKenyanPhone } from '../../api/client.js';

export default function Profile() {
  const { profile, updateProfile } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ email: profile.email, phone: profile.phone, emergencyContact: profile.emergencyContact });
  const [error, setError] = useState('');

  function startEdit() {
    setForm({ email: profile.email, phone: profile.phone, emergencyContact: profile.emergencyContact });
    setError('');
    setEditing(true);
  }

  function handleSave() {
    if (!isValidEmail(form.email)) return setError('Enter a valid email address.');
    if (!isValidKenyanPhone(form.phone)) return setError('Enter a valid Kenyan mobile number.');
    updateProfile(form);
    setEditing(false);
  }

  return (
    <div className="db-page">
      <header className="db-page-header">
        <h1>Profile</h1>
        <p className="tp-sub">Your unit, lease, and contact details.</p>
      </header>

      <div className="db-panel">
        <div className="db-panel-header db-panel-header-row">
          <h2>Lease details</h2>
        </div>
        <dl className="db-lease-grid">
          <div><dt>Unit</dt><dd>{profile.unit}</dd></div>
          <div><dt>Building</dt><dd>{profile.building}</dd></div>
          <div><dt>Lease start</dt><dd>{profile.leaseStart}</dd></div>
          <div><dt>Lease end</dt><dd>{profile.leaseEnd}</dd></div>
        </dl>
      </div>

      <div className="db-panel">
        <div className="db-panel-header db-panel-header-row">
          <h2>Contact details</h2>
          {!editing ? (
            <button className="db-icon-btn" onClick={startEdit} aria-label="Edit"><Pencil size={16} strokeWidth={1.75} /></button>
          ) : (
            <div className="db-edit-actions">
              <button className="db-icon-btn" onClick={handleSave} aria-label="Save"><Save size={16} strokeWidth={1.75} /></button>
              <button className="db-icon-btn" onClick={() => setEditing(false)} aria-label="Cancel"><X size={16} strokeWidth={1.75} /></button>
            </div>
          )}
        </div>

        {error && <p className="tp-error">{error}</p>}

        {editing ? (
          <div className="db-form">
            <label>Name
              <input value={profile.name} disabled />
            </label>
            <label>Email
              <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </label>
            <label>Phone
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </label>
            <label>Emergency contact
              <input value={form.emergencyContact} onChange={(e) => setForm((f) => ({ ...f, emergencyContact: e.target.value }))} />
            </label>
          </div>
        ) : (
          <dl className="db-lease-grid">
            <div><dt>Name</dt><dd>{profile.name}</dd></div>
            <div><dt>Email</dt><dd>{profile.email}</dd></div>
            <div><dt>Phone</dt><dd>{profile.phone}</dd></div>
            <div><dt>Emergency contact</dt><dd>{profile.emergencyContact}</dd></div>
          </dl>
        )}
      </div>

      <div className="db-panel">
        <div className="db-panel-header">
          <FileText size={18} strokeWidth={1.75} />
          <h2>Documents</h2>
        </div>
        <ul className="db-doc-list">
          {profile.documents.map((d) => (
            <li key={d.id}>
              <FileText size={15} strokeWidth={1.75} />
              <span>{d.name}</span>
              <span className="db-doc-date">{d.uploadedAt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
