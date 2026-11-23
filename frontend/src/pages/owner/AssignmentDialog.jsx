import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, DoorOpen, LoaderCircle, Users, X } from 'lucide-react';
import { api } from '../../api/client.js';

export default function AssignmentDialog({ target, records, accounts, assignments, properties, onClose, onSaved }) {
  const ref = useRef(null);
  const initialUnit = records.find(r => r.id === target.unitId);
  const initialTenant = accounts.find(t => t.userId === target.tenantId);
  const [propertyId, setPropertyId] = useState(initialUnit?.property_id || initialTenant?.propertyId || target.propertyId || properties[0]?.id || '');
  const [unitId, setUnitId] = useState(target.unitId || '');
  const [tenantId, setTenantId] = useState(target.tenantId || '');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const active = assignments.filter(a => !a.ended_at);
  const units = records.filter(r => r.category === 'units/inventory' && !r.archived && r.property_id === propertyId && r.status === 'Vacant' && !active.some(a => a.unit_id === r.id));
  const tenants = accounts.filter(a => a.role === 'tenant' && a.propertyId === propertyId && !active.some(t => t.tenant_id === a.userId));
  const selected = units.find(u => u.id === unitId);
  useEffect(() => { const prior = document.activeElement; ref.current.showModal(); return () => { ref.current?.close(); prior?.focus(); }; }, []);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const values = Object.fromEntries(new FormData(e.currentTarget));
      await api(target.assignment ? '/api/assignments/end' : '/api/assignments', { method: 'POST', body: JSON.stringify(target.assignment ? { id: target.assignment.id } : values) });
      await onSaved(target.assignment ? 'Assignment ended. The unit is now vacant.' : 'Tenant assigned. The unit is now occupied.');
      onClose();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const existingUnit = records.find(r => r.id === target.assignment?.unit_id);
  const existingTenant = accounts.find(a => a.userId === target.assignment?.tenant_id);
  return <dialog ref={ref} className="pm-dialog nx-assignment-dialog" onCancel={e => { if (busy) e.preventDefault(); else onClose(); }} aria-labelledby="assignment-title">
    <form onSubmit={submit}>
      <div className="pm-modal-head"><div><p className="pm-kicker">TENANT + UNIT</p><h2 id="assignment-title">{target.assignment ? 'Manage tenancy' : 'Assign a unit to a tenant'}</h2></div><button type="button" className="pm-icon-btn" aria-label="Close assignment" onClick={onClose} disabled={busy}><X size={20}/></button></div>
      <div className="pm-modal-content">
        <div className="nx-assignment-illustration"><span><DoorOpen size={26}/>A place to call home</span><ArrowRight size={22}/><span><Users size={26}/>A connected tenant</span></div>
        {target.assignment ? <>
          <h3>{existingTenant?.fullName} · {existingUnit?.title}</h3>
          <p className="nx-help">Ending this assignment makes the unit available again. The tenant’s account stays active, and the tenancy remains in your history.</p>
          <dl className="nx-detail-list"><dt>Monthly rent</dt><dd>KES {Number(target.assignment.rent_amount).toLocaleString()}</dd><dt>Start date</dt><dd>{target.assignment.starts_on}</dd><dt>Rent due</dt><dd>Day {target.assignment.due_day} of each month</dd></dl>
        </> : <>
          <label>Property<select value={propertyId} onChange={e => { setPropertyId(e.target.value); setUnitId(''); setTenantId(''); }} required><option value="">Choose property</option>{properties.map(p => <option key={p.id} value={p.id}>{p.name}{p.address ? ` · ${p.address}` : ''}</option>)}</select></label>
          <div className="pm-form-grid"><label>Vacant unit<select name="unitId" value={unitId} required onChange={e => setUnitId(e.target.value)}><option value="">Choose a unit</option>{units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}</select></label><label>Tenant account<select name="tenantId" value={tenantId} required onChange={e => setTenantId(e.target.value)}><option value="">Choose a tenant</option>{tenants.map(t => <option key={t.userId} value={t.userId}>{t.fullName} · {t.email}</option>)}</select></label></div>
          {(!units.length || !tenants.length) && <div className="nx-inline-guide">{!units.length ? 'No vacant units here. Add a unit under Units & spaces → Unit inventory, and choose this property.' : 'No unassigned tenant accounts here. Create one under Tenants → Tenant directory for this property.'}</div>}
          <div className="pm-form-grid"><label>Monthly rent (KES)<input key={unitId} name="rentAmount" type="number" min="0" max="9999999999.99" step="0.01" required defaultValue={selected?.details['Monthly rent (KES)'] || ''}/></label><label>Deposit (KES)<input name="depositAmount" type="number" min="0" max="9999999999.99" step="0.01" defaultValue="0" required/></label><label>Start date<input name="startsOn" type="date" required defaultValue={new Date().toLocaleDateString('en-CA')}/></label><label>End date (optional)<input name="endsOn" type="date"/></label><label>Monthly rent due day<input name="dueDay" type="number" min="1" max="28" step="1" defaultValue="5" required/></label></div>
          <p className="nx-help">This saves the tenancy and marks the unit occupied immediately. It does not send a message or collect a payment.</p>
        </>}
        {error && <p className="pm-error" role="alert">{error}</p>}
      </div>
      <div className="pm-modal-foot"><button type="button" className="pm-btn" onClick={onClose} disabled={busy}>Cancel</button><button className="pm-btn pm-primary" disabled={busy || (!target.assignment && (!unitId || !tenantId))}>{busy ? <LoaderCircle size={16} className="pm-spin"/> : <Check size={16}/>} {busy ? 'Saving…' : target.assignment ? 'End assignment & vacate unit' : 'Assign tenant'}</button></div>
    </form>
  </dialog>;
}
