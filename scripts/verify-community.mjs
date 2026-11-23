import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const base='https://wmwzrhreqmjsmksptzaj.supabase.co/functions/v1/nesthub-api',tag=randomUUID(),password=randomUUID(),ids=[];
const credentials={password,ids};
async function req(path,token,body,status=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(25000)});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
async function owner(label){const o=await req('/api/auth/register',null,{email:`${label}-${tag}@example.invalid`,password,confirmPassword:password,fullName:label});ids.push(o.userId);return o;}
async function tenant(o,p,n){const unit=await req('/api/workspace/save',o.token,{propertyId:p.id,category:'units/inventory',title:n,status:'Vacant',details:{'Monthly rent (KES)':'15000'}});const t=await req('/api/users',o.token,{propertyId:p.id,fullName:n,email:`${n}-${tag}@example.invalid`,password,role:'tenant',unitId:unit.id,rentAmount:15000,depositAmount:0,dueDay:5,startsOn:'2026-10-01'});ids.push(t.userId);return await req('/api/auth/login',null,{email:t.email,password,portal:'tenant'});}
try{
 const a=await owner('Community-check'),b=await owner('Other-check');credentials.owner=a;
 const p=await req('/api/properties',a.token,{name:'Disposable community verification',address:'Test fixture only'}),q=await req('/api/properties',b.token,{name:'Other test property'});credentials.property=p;
 const t=await tenant(a,p,'Resident-One'),peer=await tenant(a,p,'Resident-Two'),outsider=await tenant(b,q,'Outside-Resident');credentials.tenant=t;credentials.peer=peer;
 const worker=await req('/api/users',a.token,{propertyId:p.id,fullName:'Grounds check',email:`grounds-${tag}@example.invalid`,password,role:'maintenance'});ids.push(worker.userId);const staff=await req('/api/auth/login',null,{email:worker.email,password,portal:'staff'});credentials.staff=staff;
 await req('/api/operations/action',a.token,{action:'rent',data:{propertyId:p.id}});
 await req('/api/community/profile',t.token,{bio:'Hello neighbours. I enjoy gardening.'});
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH9sAAAAASUVORK5CYII=';
 await req('/api/community/profile',t.token,{bio:'Hello neighbours.',image:png,mime:'image/png'});
 let c=await req('/api/community',peer.token);assert.equal(c.members.length,2);assert.ok(c.members.every(m=>!('email'in m)&&!('phone'in m)&&!('avatar_path'in m)));const profile=c.members.find(m=>m.id===t.userId);assert.equal((await fetch(profile.avatar)).status,200);
 assert.ok(!(await req('/api/community',outsider.token)).members.some(m=>m.id===t.userId));
 await req('/api/community',a.token,null,403);
 const post=await req('/api/community/post',t.token,{body:'Hello from the same building.'});
 assert.ok((await req('/api/community',peer.token)).posts.some(p=>p.id===post.id));
 await req('/api/community/remove',peer.token,{id:post.id});assert.ok((await req('/api/community',t.token)).posts.some(p=>p.id===post.id));
 await req('/api/community/remove',t.token,{id:post.id});assert.ok(!(await req('/api/community',peer.token)).posts.some(p=>p.id===post.id));
 await req('/api/community/profile',t.token,{bio:'Hello neighbours. I enjoy gardening.',removePhoto:true});
 await req('/api/communications?propertyId='+p.id,t.token,null,403);await req('/api/communications?propertyId='+p.id,b.token,null,403);
 const comms=await req('/api/communications?propertyId='+p.id,staff.token);assert.equal(comms.recipients.length,2);assert.equal(comms.configuration.sms,'unavailable');
 const requestId=randomUUID(),payload={propertyId:p.id,requestId,subject:'Test SMS notice',message:'Disposable verification. No real SMS will be sent.',channel:'SMS',recipientIds:null};
 const campaign=await req('/api/communications/prepare',a.token,payload);assert.equal((await req('/api/communications/prepare',a.token,payload)).id,campaign.id);
 await req('/api/communications/prepare',a.token,{...payload,requestId:randomUUID(),recipientIds:[outsider.userId]},409);
 await req('/api/communications/send',b.token,{propertyId:q.id,id:campaign.id},404);
 await req('/api/communications/send',a.token,{propertyId:p.id,id:campaign.id});
 let result=await req('/api/communications?propertyId='+p.id,a.token);assert.equal(result.deliveries.length,2);assert.ok(result.deliveries.every(d=>d.status==='Skipped'));
 await req('/api/users/edit',a.token,{id:t.userId,fullName:'Resident One',email:t.email,phone:'0700000000'});
 const queued=await req('/api/communications/prepare',staff.token,{...payload,requestId:randomUUID(),recipientIds:[t.userId]});await req('/api/communications/send',staff.token,{propertyId:p.id,id:queued.id});
 result=await req('/api/communications?propertyId='+p.id,a.token);assert.equal(result.deliveries.find(d=>d.campaign_id===queued.id).status,'Unavailable');
 await req('/api/communications/send',a.token,{propertyId:p.id,id:queued.id});assert.equal((await req('/api/communications?propertyId='+p.id,a.token)).deliveries.length,3);
 const state=await req('/api/operations',t.token),bill=state.charges[0];const pay=await req('/api/operations/action',t.token,{action:'payment',data:{propertyId:p.id,chargeId:bill.id,amount:5000,method:'Bank transfer',reference:'TEST-BANK-'+tag,paidOn:'2026-10-08'}});
 const after=await req('/api/operations',t.token);assert.equal(after.payments.find(p=>p.id===pay.id).status,'Pending');assert.equal(after.payments.filter(p=>p.status==='Confirmed').length,0);
 await req('/api/operations/action',t.token,{action:'review-payment',data:{propertyId:p.id,id:pay.id,status:'Confirmed'}},409);
 await req('/api/operations/action',a.token,{action:'review-payment',data:{propertyId:p.id,id:pay.id,status:'Confirmed'}});
 assert.equal((await req('/api/operations',t.token)).payments.find(p=>p.id===pay.id).status,'Confirmed');
 console.log('PASS: community membership/privacy, bio and private avatar upload/removal, peer chat, author-only deletion, cross-property isolation, staff communications, recipient scope, idempotency, missing-phone handling, truthful SMS-unavailable status, pending checkout and approval.');
 console.log(JSON.stringify({ownerEmail:a.email,tenantEmail:t.email,password}));
}finally{writeFileSync('.recovery-test-community.json',JSON.stringify(credentials));console.log('Cleanup IDs:',JSON.stringify(ids));}
