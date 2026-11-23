import assert from 'node:assert/strict';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const base='https://wmwzrhreqmjsmksptzaj.supabase.co/functions/v1/nesthub-api',file='.recovery-test.json';
const hash=x=>createHash('sha256').update(x).digest('hex');
async function req(path,token,body,status=200){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});const result=await r.json();assert.equal(r.status,status,`${path}: ${JSON.stringify(result)}`);return result;}
if(process.argv[2]==='seed'){
 const suffix=randomUUID(),password=randomUUID();
 const owner=await req('/api/auth/register',null,{email:`recovery-owner-${suffix}@example.invalid`,password,confirmPassword:password,fullName:'Recovery test owner'});
 const property=await req('/api/properties',owner.token,{name:'Disposable recovery test'});
 const tenant=await req('/api/users',owner.token,{propertyId:property.id,role:'tenant',fullName:'Recovery test resident',email:`recovery-tenant-${suffix}@example.invalid`,password});
 const other=await req('/api/auth/register',null,{email:`recovery-other-${suffix}@example.invalid`,password,confirmPassword:password,fullName:'Recovery other owner'});
 const login=await req('/api/auth/login',null,{email:tenant.email,password,portal:'tenant'});
 const tokens=Array.from({length:4},()=>randomBytes(32).toString('hex')),ownerTokens=Array.from({length:2},()=>randomBytes(32).toString('hex')),otp='193746',ownerOtp='927315';
 writeFileSync(file,JSON.stringify({owner,other,property,tenant,login,password,tokens,ownerTokens,otp,ownerOtp}));
 const rows=[...tokens.map((t,i)=>`('${tenant.userId}','${tenant.email}','${hash(t)}','${hash(t+':'+otp)}',now()+interval '${i===1?'-1':'15'} minutes')`),...ownerTokens.map(t=>`('${owner.userId}','${owner.email}','${hash(t)}','${hash(t+':'+ownerOtp)}',now()+interval '15 minutes')`)].join(',');
 writeFileSync('.recovery-test-seed.sql',`insert into public.tenant_password_resets(user_id,email,token_hash,otp_hash,expires_at) values ${rows};`);
 console.log('Disposable recovery fixtures created; seed SQL ready.');
}else{
 const f=JSON.parse(readFileSync(file));const reset=(i,otp=f.otp,pass='New-test-password-847!')=>req('/api/auth/reset-password',null,{token:f.tokens[i],otp,password:pass,confirmPassword:pass},i===0&&otp===f.otp?200:400);
 await req('/api/users/edit',f.other.token,{id:f.tenant.userId,fullName:'Blocked',email:f.tenant.email,phone:''},409);
 await req('/api/users/edit',f.login.token,{id:f.tenant.userId,fullName:'Blocked',email:f.tenant.email,phone:''},403);
 await req('/api/users/edit',f.owner.token,{id:f.tenant.userId,fullName:'Edited resident',email:f.tenant.email,phone:'+254700000000'});
 let d=await req('/api/operations',f.owner.token);assert.equal(d.people.find(p=>p.id===f.tenant.userId).phone,'+254700000000');
 await reset(1);for(let i=0;i<5;i++)await reset(2,'000000');await reset(2);
 await req('/api/auth/reset-password',null,{token:f.tokens[0],otp:f.otp,password:'New-test-password-847!',confirmPassword:'different'},400);
 await reset(0);await req('/api/operations',f.login.token,null,401);
 await req('/api/auth/reset-password',null,{token:f.tokens[0],otp:f.otp,password:'Other-test-password',confirmPassword:'Other-test-password'},400);
 await reset(3);
 await req('/api/auth/login',null,{email:f.tenant.email,password:f.password,portal:'tenant'},401);
 const next=await req('/api/auth/login',null,{email:f.tenant.email,password:'New-test-password-847!',portal:'tenant'});
 await req('/api/users/edit',f.owner.token,{id:f.tenant.userId,fullName:'Edited resident',email:f.tenant.email.replace('recovery-tenant','recovery-changed'),phone:''});
 await req('/api/operations',next.token,null,401);
 const ownerPassword='New-owner-password-934!';
 await req('/api/auth/reset-password',null,{token:f.ownerTokens[0],otp:f.ownerOtp,password:ownerPassword,confirmPassword:ownerPassword});
 await req('/api/auth/reset-password',null,{token:f.ownerTokens[1],otp:f.ownerOtp,password:ownerPassword,confirmPassword:ownerPassword},400);
 await req('/api/operations',f.owner.token,null,401);
 const recoveredOwner=await req('/api/auth/login',null,{email:f.owner.email,password:ownerPassword,portal:'staff'});
 const recoveredWorkspace=await req('/api/operations',recoveredOwner.token);assert.ok(recoveredWorkspace.properties.some(p=>p.id===f.property.id));
 console.log('PASS: owner isolation, tenant edit denial, contact editing, expiry, five-attempt lockout, confirmation matching, single use, all-reset invalidation, tenant and owner session revocation, new-password login and email-change sign-out.');
 console.log('Cleanup owners:',f.owner.userId,f.other.userId,'tenant:',f.tenant.userId);
}
