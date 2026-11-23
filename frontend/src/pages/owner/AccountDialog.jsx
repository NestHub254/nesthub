import { useEffect, useRef, useState } from 'react';
import { Check, DoorOpen, LoaderCircle, Plus, X } from 'lucide-react';
import { api } from '../../api/client.js';
export const unitTypes=['Apartment','Bedsitter','Studio','Single room','Shared room','Shop','Office','Other'];

export default function AccountDialog({target,properties,records,assignments,onClose,onSaved,onUnitCreated}) {
  const dialog=useRef(null);
  const [propertyId,setPropertyId]=useState(target.propertyId||properties[0]?.id||'');
  const [role,setRole]=useState(target.role||'tenant');
  const [unitId,setUnitId]=useState(''),[rent,setRent]=useState('');
  const [quick,setQuick]=useState(false),[unitName,setUnitName]=useState(''),[unitType,setUnitType]=useState('Apartment'),[unitRent,setUnitRent]=useState('');
  const [busy,setBusy]=useState(false),[unitBusy,setUnitBusy]=useState(false),[error,setError]=useState(''),[unitError,setUnitError]=useState('');
  const units=records.filter(r=>r.category==='units/inventory'&&!r.archived&&r.property_id===propertyId&&r.status==='Vacant'&&!assignments.some(a=>a.unit_id===r.id&&!a.ended_at));
  const selected=units.find(r=>r.id===unitId);
  useEffect(()=>{const previous=document.activeElement;dialog.current.showModal();return()=>{dialog.current?.close();previous?.focus();};},[]);
  function selectUnit(id){setUnitId(id);setRent(units.find(r=>r.id===id)?.details['Monthly rent (KES)']||'');}
  async function registerUnit(){
    setUnitError('');
    if(!propertyId||!unitName.trim()||unitRent===''||!Number.isFinite(Number(unitRent))||Number(unitRent)<0){setUnitError('Choose a property, enter a unit / room number, and enter a valid rent.');return;}
    setUnitBusy(true);
    try{
      const created=await api('/api/workspace/save',{method:'POST',body:JSON.stringify({category:'units/inventory',propertyId,title:unitName.trim(),status:'Vacant',details:{'Unit type':unitType,'Monthly rent (KES)':unitRent}})});
      onUnitCreated(created);setUnitId(created.id);setRent(unitRent);setQuick(false);setUnitName('');setUnitRent('');
    }catch(e){setUnitError(e.message);}finally{setUnitBusy(false);}
  }
  async function submit(e){
    e.preventDefault();setError('');setBusy(true);
    const values=Object.fromEntries(new FormData(e.currentTarget));
    try{
      await api('/api/users',{method:'POST',body:JSON.stringify({...values,propertyId,role,unitId:role==='tenant'&&unitId!=='later'?unitId:undefined})});
      await onSaved(role==='tenant'&&unitId!=='later'?'Tenant created and unit assigned.':'Account created.');onClose();
    }catch(e){setError(e.message);}finally{setBusy(false);}
  }
  return <dialog ref={dialog} className="pm-dialog pm-account-dialog" aria-labelledby="account-dialog-title" onCancel={e=>{if(busy||unitBusy)e.preventDefault();else onClose();}}><form onSubmit={submit}>
    <div className="pm-modal-head"><div><p className="pm-kicker">PROPERTY ACCOUNT</p><h2 id="account-dialog-title">{role==='tenant'?'Add tenant & select a unit':'Create staff account'}</h2></div><button className="pm-icon-btn" type="button" aria-label="Close account form" disabled={busy||unitBusy} onClick={onClose}><X size={20}/></button></div>
    <div className="pm-modal-content">
      <div className="pm-form-grid"><label>Property<select value={propertyId} required onChange={e=>{setPropertyId(e.target.value);setUnitId('');setRent('');setQuick(false);}}><option value="">Choose a property</option>{properties.map(p=><option key={p.id} value={p.id}>{p.name}{p.address?' · '+p.address:''}</option>)}</select></label><label>Account role<select value={role} onChange={e=>{setRole(e.target.value);setQuick(false);}}><option value="tenant">Tenant</option><option value="manager">Reception / Grounds manager</option><option value="maintenance">Maintenance</option></select></label></div>
      <label>Full name<input name="fullName" autoComplete="name" required maxLength={255}/></label><div className="pm-form-grid"><label>Email address<input name="email" type="email" required autoComplete="off"/></label><label>Temporary password<input name="password" type="password" minLength={8} required autoComplete="new-password"/></label></div>
      {role==='tenant'&&<section className="pm-tenant-unit-section"><div className="pm-tenant-unit-heading"><DoorOpen size={22}/><div><h3>Choose their unit / room</h3><p>{units.length} vacant {units.length===1?'space':'spaces'} at this property</p></div></div>
        <label>Available unit / room<select aria-label="Available unit / room" value={unitId} required onChange={e=>selectUnit(e.target.value)}><option value="">Select a registered unit or room</option>{units.map(u=><option key={u.id} value={u.id}>{u.title} · {u.details['Unit type']||'Unit'} · KES {Number(u.details['Monthly rent (KES)']||0).toLocaleString()}/month</option>)}<option value="later">Create account without a unit — assign later</option></select></label>
        {!quick&&<button type="button" className="pm-inline-add" disabled={!propertyId} onClick={()=>setQuick(true)}><Plus size={15}/>Register a new unit / room here</button>}
        {quick&&<div className="pm-inline-unit"><div><h3>Register a unit / room</h3><button className="pm-icon-btn" type="button" aria-label="Cancel inline unit registration" disabled={unitBusy} onClick={()=>setQuick(false)}><X size={17}/></button></div><p>Saved to the selected property and immediately available in the dropdown.</p><div className="pm-form-grid"><label>Unit / room number<input aria-label="New unit / room number" maxLength={255} value={unitName} onChange={e=>setUnitName(e.target.value)} placeholder="e.g. A-01 or Room 4"/></label><label>Space type<select aria-label="New space type" value={unitType} onChange={e=>setUnitType(e.target.value)}>{unitTypes.map(t=><option key={t}>{t}</option>)}</select></label></div><label>Monthly rent (KES)<input aria-label="New unit monthly rent" type="number" min="0" step="0.01" value={unitRent} onChange={e=>setUnitRent(e.target.value)}/></label>{unitError&&<p className="pm-error" role="alert">{unitError}</p>}<button className="pm-btn" type="button" disabled={unitBusy} onClick={registerUnit}>{unitBusy?<LoaderCircle size={15} className="pm-spin"/>:<Check size={15}/>}Save unit & select it</button></div>}
        {selected&&<><div className="pm-selected-unit"><Check size={16}/><span><strong>{selected.title}</strong> · {selected.details['Unit type']||'Unit'} · Vacant</span></div><div className="pm-form-grid"><label>Agreed monthly rent (KES)<input name="rentAmount" value={rent} onChange={e=>setRent(e.target.value)} type="number" min="0" max="9999999999.99" step="0.01" required/></label><label>Deposit (KES)<input name="depositAmount" type="number" min="0" max="9999999999.99" step="0.01" defaultValue="0" required/></label><label>Move-in / start date<input name="startsOn" type="date" defaultValue={new Date().toLocaleDateString('en-CA')} required/></label><label>End date (optional)<input name="endsOn" type="date"/></label><label>Rent due day (1–28)<input name="dueDay" type="number" min="1" max="28" step="1" defaultValue="5" required/></label></div><p className="pm-form-note">The account and tenancy are saved together. The unit becomes occupied immediately.</p></>}
        {!units.length&&!quick&&<p className="pm-form-note">No vacant units yet. Register one above, or use the “Add unit / room” button in the top bar.</p>}
      </section>}
      {!properties.length&&<p className="pm-error">Add a property before registering units or tenants.</p>}
      {error&&<p className="pm-error" role="alert">{error}</p>}
    </div><div className="pm-modal-foot"><button type="button" className="pm-btn" disabled={busy||unitBusy} onClick={onClose}>Cancel</button><button className="pm-btn pm-primary" disabled={busy||unitBusy||quick||!propertyId||(role==='tenant'&&!unitId)}>{busy?<LoaderCircle size={16} className="pm-spin"/>:<Check size={16}/>} {busy?'Saving…':role==='tenant'&&unitId!=='later'?'Create tenant & assign unit':'Create account'}</button></div>
  </form></dialog>;
}
