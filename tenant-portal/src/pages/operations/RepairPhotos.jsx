import {useState} from 'react';
export default function RepairPhotos({repair,photos=[],api,onSaved,session,management}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function remove(id){
  setBusy(true);setError('');try{await api('/api/repairs/photo/delete',{method:'POST',body:JSON.stringify({id})});await onSaved();}catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function upload(e){
  e.preventDefault();const form=e.currentTarget,file=form.elements.photo.files[0];if(!file)return;
  setBusy(true);setError('');let bitmap;
  try{
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024)throw new Error('Choose a JPEG, PNG or WebP photo under 15 MB.');
   bitmap=await createImageBitmap(file);const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
   const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const encoded=canvas.toDataURL('image/jpeg',.82).split(',')[1];
   await api('/api/repairs/photo',{method:'POST',body:JSON.stringify({repairId:repair.id,mime:'image/jpeg',image:encoded,caption:form.elements.caption.value,stage:form.elements.stage.value})});
   form.reset();await onSaved();
  }catch(err){setError(err.message||'Could not read this photo.');}finally{bitmap?.close();setBusy(false);}
 }
 return <div className="op-repair-photos"><div>{photos.filter(p=>p.url).map(p=><div key={p.id}><a href={p.url} target="_blank" rel="noreferrer"><img src={p.url} alt={p.caption||'Repair photo'} loading="lazy"/><span>{p.stage||'Before'} · {p.caption||'View photo'}</span><small>{new Date(p.created_at).toLocaleString()}</small></a>{!repair.completed_by&&!['Awaiting verification','Verified','Completed'].includes(repair.status)&&(management||p.created_by===session.userId)&&<button type="button" className="op-text" disabled={busy} onClick={()=>remove(p.id)}>Remove photo</button>}</div>)}</div>{error&&<p role="alert">{error}</p>}{photos.length<20&&!['Awaiting verification','Verified','Completed'].includes(repair.status)&&<details><summary>Add a repair photo</summary><form onSubmit={upload}><label>Photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required/></label><label>Evidence stage<select name="stage"><option>Before</option><option>After</option></select></label><label>Caption<input name="caption" maxLength={200} placeholder="Before repair / work completed"/></label><p>Up to 20 photos. Once submitted for verification, evidence is retained and cannot be deleted. Visible only to this resident and the authorised property team.</p>{error&&<p role="alert">{error}</p>}<button className="op-btn" disabled={busy}>{busy?'Uploading…':'Upload photo'}</button></form></details>}</div>;
}
