import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const base='https://wmwzrhreqmjsmksptzaj.supabase.co/functions/v1/nesthub-api',tag=randomUUID(),password=randomUUID(),ids=[],fixtures={ids};
async function req(path,token,body,expected=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});const d=await r.json();assert.equal(r.status,expected,JSON.stringify(d));return d;}
try{
 const owner=await req('/api/auth/register',null,{email:`workflow-${tag}@example.invalid`,password,confirmPassword:password,fullName:'Disposable workflow owner'});ids.push(owner.userId);fixtures.owner=owner.userId;fixtures.token=owner.token;
 const p=await req('/api/properties',owner.token,{name:'Disposable workflow verification'});fixtures.property=p.id;
 const unit=await req('/api/workspace/save',owner.token,{propertyId:p.id,category:'units/inventory',title:'T1',status:'Vacant',details:{'Monthly rent (KES)':'12000'}});
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Nairobi'}).format(new Date());
 async function account(label,role){const u=await req('/api/users',owner.token,{propertyId:p.id,fullName:label,email:`${label}-${tag}@example.invalid`,password,role,...(role==='tenant'?{unitId:unit.id,rentAmount:12000,depositAmount:10000,dueDay:5,startsOn:day}:{})});ids.push(u.userId);return req('/api/auth/login',null,{email:u.email,password,portal:role==='tenant'?'tenant':'staff'});}
 const tenant=await account('resident','tenant'),staff=await account('worker','maintenance'),manager=await account('reception','manager');
 const action=(who,action,data={},expected=200)=>req('/api/operations/action',who.token,{action,data:{propertyId:p.id,...data}},expected);
 await action(owner,'rent');await action(owner,'rent');
 let state=await req('/api/operations',owner.token);assert.equal(state.charges.length,2);
 const rent=state.charges.find(x=>x.kind==='Rent'),deposit=state.charges.find(x=>x.kind==='Deposit'),assignment=state.assignments[0];
 await action(owner,'payment',{chargeId:rent.id,amount:100,method:'Cash',reference:'CASH-TEST',paidOn:day},409);
 await action(tenant,'cash-settings',{enabled:'true'},409);
 await action(owner,'cash-settings',{enabled:'true'});
 const cash=await action(owner,'payment',{chargeId:rent.id,amount:100,method:'Cash',reference:'CASH-TEST',paidOn:day});
 await action(owner,'review-payment',{id:cash.id,status:'Confirmed'},409);
 await action(manager,'review-payment',{id:cash.id,status:'Confirmed'});
 const paid=await action(tenant,'payment',{chargeId:deposit.id,amount:10000,method:'Bank transfer',reference:'DEPOSIT-TEST',paidOn:day});await action(owner,'review-payment',{id:paid.id,status:'Confirmed'});
 const repair=await action(tenant,'repair',{title:'Tap needs repair',description:'Disposable workflow test only',priority:'Normal'});
 await action(owner,'update-repair',{id:repair.id,status:'Assigned',assignedTo:staff.userId,note:'Inspect the tap'});
 await action(staff,'update-repair',{id:repair.id,status:'Completed',note:'Work completed without evidence'},409);
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH9sAAAAASUVORK5CYII=';
 for(const stage of ['Before','After'])await req('/api/repairs/photo',staff.token,{repairId:repair.id,mime:'image/png',image:png,stage,caption:`Test ${stage}`});
 await action(staff,'update-repair',{id:repair.id,status:'Completed',note:'New washer installed'});
 await action(staff,'verify-repair',{id:repair.id,status:'Verified',note:'Approving my own work'},409);
 await action(tenant,'verify-repair',{id:repair.id,status:'In progress',note:'Still leaking, please inspect again'});
 await action(staff,'update-repair',{id:repair.id,status:'Completed',note:'Leak repaired and checked'});
 await action(tenant,'verify-repair',{id:repair.id,status:'Verified',note:'Tested and the tap is dry'});
 await action(staff,'update-repair',{id:repair.id,status:'In progress',note:'Trying to change verified job'},409);
 await action(owner,'deposit-propose',{assignmentId:assignment.id,deduction:500,note:'Deduct for missing key',evidence:'Inspection key return record'},409);
 await req('/api/assignments/end',owner.token,{id:assignment.id,notes:'All rooms inspected, one key missing; tenant has moved out.'});
 await action(manager,'deposit-propose',{assignmentId:assignment.id,deduction:500,note:'Deduct for missing key',evidence:'Inspection key return record'},409);
 await action(owner,'deposit-propose',{assignmentId:assignment.id,deduction:11000,note:'Deduct for missing key',evidence:'Inspection key return record'},409);
 await action(owner,'deposit-propose',{assignmentId:assignment.id,deduction:500,note:'Deduct for missing key',evidence:'Inspection key return record'});
 await action(owner,'deposit-refund',{assignmentId:assignment.id,method:'Bank transfer',reference:'REFUND-TEST'},409);
 await action(tenant,'deposit-respond',{assignmentId:assignment.id,status:'Disputed',note:'The key was returned'});
 await action(owner,'deposit-propose',{assignmentId:assignment.id,deduction:0,note:'Full refund after key found',evidence:'Updated inspection key register'});
 await action(tenant,'deposit-respond',{assignmentId:assignment.id,status:'Accepted',note:'I agree to the full refund'});
 await action(owner,'deposit-refund',{assignmentId:assignment.id,method:'Bank transfer',reference:'REFUND-TEST'});
 await action(owner,'deposit-refund',{assignmentId:assignment.id,method:'Bank transfer',reference:'REFUND-TEST'},409);
 state=await req('/api/operations',tenant.token);assert.equal(state.settlements[0].status,'Settled');assert.equal(state.settlements[0].deduction,0);assert.equal(state.repairs[0].status,'Verified');assert.equal(state.workflowEvents.length,0);assert.ok(state.photos.every(x=>x.content_hash?.length===64));
 const mgmt=await req('/api/operations',owner.token);assert.ok(mgmt.workflowEvents.length>=12);assert.equal((await req('/api/operations',staff.token)).settlements.length,0);
 console.log('PASS: billing idempotency, cash separation, mandatory repair evidence, tenant dispute/verification, deposit settlement, audit visibility.');
}finally{writeFileSync('.recovery-test-workflow.json',JSON.stringify(fixtures));console.log('Disposable fixture identifiers saved for cleanup.');}
