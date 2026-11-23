import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { communityRoutes } from './community.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const origins = new Set([
  'https://nesthub.sionaglobal.com', 'https://nesthub-six.vercel.app', 'https://nesthub-tenants.vercel.app',
  'http://localhost:5173', 'http://localhost:5174',
]);
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
// Public OAuth audience owned by the NestHub Google Cloud project (not a secret).
const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID') || '687819091894-qb0bn62e5ufc3c5uh9is98et445p9sb7.apps.googleusercontent.com';
type Account = { id: string; full_name: string; email: string; role: string; property_id: string | null; password_hash: string; google_subject: string | null };
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
function check(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new HttpError(status, message);
}
function text(value: unknown, label: string, max = 255): string {
  check(typeof value === 'string' && value.trim().length > 0 && value.length <= max, `${label} is required (maximum ${max} characters).`);
  return value.trim();
}
function email(value: unknown) {
  const result = text(value, 'Email').toLowerCase();
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result), 'Enter a valid email address.');
  return result;
}
function password(value: unknown) {
  check(typeof value === 'string' && value.length >= 6 && new TextEncoder().encode(value).length <= 72, 'Password must be at least 6 characters and at most 72 bytes.');
  return value;
}
function uuid(value: unknown) {
  check(typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value), 'A valid property is required.');
  return value;
}
function unwrap<T>({ data, error }: { data: T; error: { code?: string; message: string } | null }): T {
  if (error) {
    if (error.code === 'P0001') throw new HttpError(409, error.message);
    if (error.code === '23505') throw new HttpError(409, 'This email, payment reference, or record already exists. Check before submitting again.');
    console.error('Database operation failed:', error.code);
    throw new HttpError(500, 'Unable to save or load this record. Please try again.');
  }
  return data;
}
function publicUser(user: Pick<Account, 'id' | 'full_name' | 'email' | 'role' | 'property_id'>) {
  return { userId: user.id, fullName: user.full_name, email: user.email, role: user.role, propertyId: user.property_id };
}
async function digest(token: string) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))].map(v => v.toString(16).padStart(2, '0')).join('');
}
async function session(user: Account) {
  const token = [...crypto.getRandomValues(new Uint8Array(32))].map(v => v.toString(16).padStart(2, '0')).join('');
  unwrap(await db.from('app_sessions').insert({ token_hash: await digest(token), user_id: user.id, expires_at: new Date(Date.now() + 3600000).toISOString() }));
  return { ...publicUser(user), token };
}
async function currentUser(req: Request): Promise<Account> {
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
  check(/^[a-f0-9]{64}$/.test(token), 'Please log in again.', 401);
  const record = unwrap(await db.from('app_sessions').select('user_id').eq('token_hash', await digest(token)).gt('expires_at', new Date().toISOString()).maybeSingle());
  check(record, 'Your session expired. Please log in again.', 401);
  const user = unwrap(await db.from('users').select('*').eq('id', record.user_id).maybeSingle());
  check(user, 'Please log in again.', 401);
  return user as Account;
}
async function ownedProperty(user: Account, propertyId: unknown) {
  const id = uuid(propertyId);
  const property = unwrap(await db.from('properties').select('*').eq('id', id).maybeSingle());
  check(property && (user.role === 'owner' ? property.owner_id === user.id : user.role === 'manager' && user.property_id === id), 'You do not have access to this property.', 403);
  return property;
}
async function rateLimit(key: string, limit=30) {
  const count = unwrap(await db.rpc('consume_auth_attempt', { bucket_key: await digest(key), window_start: new Date(Math.floor(Date.now() / 900000) * 900000).toISOString() }));
  check(count <= limit, 'Too many attempts. Please wait 15 minutes.', 429);
}
function tenancyTerms(body: Record<string, unknown>) {
      const rent = Number(body.rentAmount), deposit = Number(body.depositAmount || 0), due = Number(body.dueDay);
      check(body.rentAmount !== '' && Number.isFinite(rent) && rent >= 0 && rent <= 9999999999.99, 'Enter a valid monthly rent.');
      check(Number.isFinite(deposit) && deposit >= 0 && deposit <= 9999999999.99, 'Enter a valid deposit.');
      check(Number.isInteger(due) && due >= 1 && due <= 28, 'Rent due day must be between 1 and 28.');
      const validDate = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
      check(validDate(body.startsOn), 'Enter a valid start date.');
      check(!body.endsOn || (validDate(body.endsOn) && String(body.endsOn) >= String(body.startsOn)), 'End date must be on or after the start date.');
  return {p_rent: rent,p_deposit: deposit,p_due: due,p_start: body.startsOn,p_end: body.endsOn || null};
}
async function handle(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/nesthub-api/, '').replace(/^\/functions\/v1\/nesthub-api/, '');
  if (req.method === 'GET' && path === '/api/health') return { status: 'ok' };
  let body: Record<string, unknown> = {};
  if (req.method === 'POST') {
    const maxBody=path==='/api/repairs/photo'?4300000:path==='/api/community/profile'?1500000:path==='/api/communications/prepare'?60000:16384;
    check(Number(req.headers.get('content-length') || 0) < maxBody, 'Request is too large.', 413);
    const raw = await req.text();
    check(raw.length < maxBody, 'Request is too large.', 413);
    try { body = JSON.parse(raw); } catch { throw new HttpError(400, 'Invalid JSON.'); }
    check(body && typeof body === 'object' && !Array.isArray(body), 'Invalid request.');
  }
  if(req.method==='POST' && path==='/api/auth/forgot-password') {
    const address=email(body.email);
    const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
    await rateLimit(`reset-ip:${ip}`,20);
    await rateLimit(`reset-email:${address}`,3);
    let key=Deno.env.get('BREVO_API_KEY'),sender=Deno.env.get('RESET_EMAIL_FROM');
    if(!key||!sender){
      const config=unwrap(await db.rpc('nesthub_email_configuration')) as Record<string,string>;
      key=key||config.nesthub_brevo_api_key;sender=sender||config.nesthub_reset_email_from;
    }
    check(key&&sender,'Email recovery is not configured yet. Contact your administrator.',503);
    const account=unwrap(await db.from('users').select('id,email,role').eq('email',address).maybeSingle());
    const response={message:'If this email belongs to a NestHub account, a reset link and code will arrive shortly.'};
    if(!account)return response;
    const token=[...crypto.getRandomValues(new Uint8Array(32))].map(v=>v.toString(16).padStart(2,'0')).join('');
    // Rejection sampling avoids modulo bias in six-digit codes.
    let n:number;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=4294000000);
    const otp=String(n%1000000).padStart(6,'0');
    unwrap(await db.from('tenant_password_resets').update({consumed_at:new Date().toISOString()}).eq('user_id',account.id).is('consumed_at',null));
    const row=unwrap(await db.from('tenant_password_resets').insert({user_id:account.id,email:address,token_hash:await digest(token),otp_hash:await digest(`${token}:${otp}`),expires_at:new Date(Date.now()+900000).toISOString()}).select('id').single());
    check(row,'Unable to create recovery request.',500);
    const tenant=account.role==='tenant';
    const link=`${tenant?'https://nesthub-tenants.vercel.app':'https://nesthub.sionaglobal.com'}/forgot-password#token=${token}`;
    try {
      const sent=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':key,'Content-Type':'application/json'},body:JSON.stringify({sender:{name:'NestHub',email:sender},to:[{email:address}],subject:'Reset your NestHub password',htmlContent:`<div style="font-family:Arial,Helvetica,sans-serif;background:#f3f6fa;padding:28px;color:#23334d"><div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;padding:28px"><img src="${tenant?'https://nesthub-tenants.vercel.app/brand/tenant-192.png':'https://nesthub.sionaglobal.com/brand/owner-192.png'}" width="56" height="56" alt="NestHub" style="border-radius:12px"><p style="font-size:20px;font-weight:bold">NestHub · ${tenant?'Tenant':'Property'} portal</p><h2>Reset your NestHub password</h2><p><a href="${link}">Open your secure reset form</a></p><p>Your one-time code: <strong>${otp}</strong></p><p>Enter this code and choose a new password. This link expires in 15 minutes. Do not share the link or code.</p><p>If you did not request this, ignore this email. Your password has not changed.</p><hr style="border:0;border-top:1px solid #e5eaf2"><p style="font-size:12px;color:#65738a">Secure access to your home, payments and property team.</p></div></div>`}),signal:AbortSignal.timeout(15000)});
      if(!sent.ok)throw new Error('Email delivery unavailable');
    }catch{
      unwrap(await db.from('tenant_password_resets').update({consumed_at:new Date().toISOString()}).eq('id',row.id));
      console.error('Password recovery provider delivery failed');
      // Keep account existence private, including when a recipient is rejected.
    }
    return response;
  }
  if(req.method==='POST' && path==='/api/auth/reset-password') {
    const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
    await rateLimit(`reset-complete-ip:${ip}`,20);
    check(typeof body.token==='string'&&/^[a-f0-9]{64}$/.test(body.token),'Invalid or expired reset link.');
    check(typeof body.otp==='string'&&/^\d{6}$/.test(body.otp),'Enter the six-digit code from your email.');
    const next=password(body.password);check(next.length>=8,'Use at least eight characters.');
    check(next===body.confirmPassword,'Passwords do not match.');
    const valid=unwrap(await db.rpc('complete_account_password_reset',{p_token:await digest(body.token),p_otp:await digest(`${body.token}:${body.otp}`),p_password_hash:await bcrypt.hash(next,10)}));
    check(valid,'The link or code is invalid, expired, or used. Request a new email.',400);
    return {message:'Password reset. Sign in with your new password.'};
  }
  if (req.method === 'POST' && ['/api/auth/login', '/api/auth/register', '/api/auth/google'].includes(path)) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    await rateLimit(`ip:${ip}`);
    if (path === '/api/auth/google') {
      check(googleClientId, 'Google sign-in is being configured. Please use email and password.', 503);
      check(body.portal === 'staff', 'Google sign-in is only available in the property portal. Tenants must use email and password.', 403);
      let identity;
      try {
        identity = (await jwtVerify(text(body.credential, 'Google credential', 12000), googleKeys, {
          algorithms: ['RS256'], audience: googleClientId, issuer: ['https://accounts.google.com', 'accounts.google.com'], requiredClaims: ['sub', 'exp', 'email'],
        })).payload;
      } catch { throw new HttpError(401, 'Google sign-in could not be verified.'); }
      check(identity.email_verified === true, 'Google email must be verified.', 401);
      const address = email(identity.email);
      let user = unwrap(await db.from('users').select('*').eq('google_subject', identity.sub!).maybeSingle());
      if (!user) {
        user = unwrap(await db.from('users').select('*').ilike('email', address.replace(/[%_]/g, '\\$&')).maybeSingle());
        if (user) {
          check((address.endsWith('@gmail.com') || typeof identity.hd === 'string') && (!user.google_subject || user.google_subject === identity.sub), 'Use your email and password to access this account.', 403);
        } else {
          check(body.register === true && body.portal === 'staff', 'No account exists for this email. Ask your property team to create one, or register as an owner.', 403);
          user = unwrap(await db.from('users').insert({ full_name: typeof identity.name === 'string' ? identity.name.slice(0,255) : address, email: address, password_hash: await bcrypt.hash(crypto.randomUUID(), 10), role: 'owner', google_subject: identity.sub }).select('*').single());
        }
        check(user.role !== 'tenant', 'Tenant accounts must sign in with email and password in the tenant portal.', 403);
        user = unwrap(await db.from('users').update({ google_subject: identity.sub }).eq('id', user.id).select('*').single());
      }
      check(user.role !== 'tenant', 'Tenant accounts must sign in with email and password in the tenant portal.', 403);
      return session(user);
    }
    const address = email(body.email);
    const pass = password(body.password);
    await rateLimit(`email:${address}`);
    if (path === '/api/auth/register') {
      check(pass.length>=8,'Use at least eight characters.');
      check(pass === body.confirmPassword, 'Passwords do not match.');
      const user = unwrap(await db.from('users').insert({ full_name: text(body.fullName, 'Full name'), email: address, password_hash: await bcrypt.hash(pass, 10), role: 'owner' }).select('*').single());
      return session(user);
    }
    const user = unwrap(await db.from('users').select('*').eq('email', address).maybeSingle());
    check(user && await bcrypt.compare(pass, user.password_hash), 'Incorrect email or password.', 401);
    if (body.portal) check((body.portal === 'tenant') === (user.role === 'tenant'), 'Please use the portal for your account.', 403);
    return session(user);
  }
  const user = await currentUser(req);
  if(path.startsWith('/api/community')||path.startsWith('/api/communications'))return await communityRoutes(req,url,path,body,user,{db,check,unwrap,uuid,text,ownedProperty,rateLimit});
    if(path==='/api/repairs/photo/delete' && req.method==='POST') {
      const objectPath=unwrap(await db.rpc('remove_draft_repair_photo',{p_actor:user.id,p_photo:uuid(body.id)}));
      const removed=await db.storage.from('repair-photos').remove([objectPath]);
      if(removed.error)console.error('Orphan draft photo requires storage cleanup');
      return {message:'Draft photo removed.'};
    }
    if(path==='/api/repairs/photo' && req.method==='POST') {
      const repairId=uuid(body.repairId), mime=String(body.mime);
      check(['Before','After'].includes(String(body.stage||'Before')),'Choose before or after.');
      check(['image/jpeg','image/png','image/webp'].includes(mime),'Use a JPEG, PNG or WebP image.');
      check(typeof body.image==='string'&&/^[A-Za-z0-9+/]+={0,2}$/.test(body.image),'Invalid image.');
      let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(body.image),c=>c.charCodeAt(0));}catch{throw new HttpError(400,'Invalid image.');}
      check(bytes.length>12&&bytes.length<=3145728,'Photos must be under 3 MB.');
      const valid=mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:mime==='image/png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
      check(valid,'The file does not match its image type.');
      const path=`${repairId}/${crypto.randomUUID()}.${mime==='image/jpeg'?'jpg':mime==='image/png'?'png':'webp'}`;
      const photoId=unwrap(await db.rpc('reserve_repair_photo',{p_actor:user.id,p_repair:repairId,p_path:path,p_caption:typeof body.caption==='string'?body.caption.slice(0,200):''}));
      const upload=await db.storage.from('repair-photos').upload(path,bytes,{contentType:mime,upsert:false});
      if(upload.error){unwrap(await db.from('repair_photos').delete().eq('id',photoId));throw new HttpError(500,'Photo upload failed. Please try again.');}
      check(['Before','After'].includes(String(body.stage||'Before')),'Choose before or after.');
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes).buffer))].map(v=>v.toString(16).padStart(2,'0')).join('');
      unwrap(await db.from('repair_photos').update({stage:body.stage||'Before',content_hash:hash,ready:true}).eq('id',photoId));
      return {message:'Evidence saved with its upload time and integrity hash.'};
    }
    if(path==='/api/users/edit' && req.method==='POST') {
      check(['owner','manager'].includes(user.role),'Management access required.',403);
      const phone=typeof body.phone==='string'?body.phone.trim():'';
      check(phone.length<=30&&(!phone||/^\+?[0-9 ()-]{7,30}$/.test(phone)),'Enter a valid phone number.');
      unwrap(await db.rpc('edit_tenant_contact',{p_actor:user.id,p_tenant:uuid(body.id),p_name:text(body.fullName,'Full name'),p_email:email(body.email),p_phone:phone}));
      return {message:'Tenant details updated.'};
    }
  if(path === '/api/operations/action' && req.method === 'POST') {
    const action=text(body.action,'Action',40);
    check(body.data && typeof body.data==='object' && !Array.isArray(body.data),'Invalid action details.');
    const data=body.data as Record<string,unknown>;
    if(action==='message')check(data.channel==='Staff'&&user.role!=='tenant','Use Community for resident chat or Communications for email and SMS.',409);
    if(action==='remind')check(false,'Send rent reminders through Communications by email or SMS.',409);
    if(action==='rent')check(['owner','manager'].includes(user.role),'Only property management can generate rent bills.',403);
    uuid(data.propertyId);
    for(const [key,value] of Object.entries(data)) check(key.length<=60 && (typeof value==='string'||typeof value==='number') && String(value).length<=3000,'Invalid field value.');
    for(const key of ['description','supplier','title','body','reference']) if(key in data) text(data[key],key,3000);
    for(const key of ['dueOn','paidOn']) if(key in data) check(/^\d{4}-\d{2}-\d{2}$/.test(String(data[key]))&&!Number.isNaN(Date.parse(String(data[key]))),'Enter a valid date.');
    if('amount' in data)check(Number.isFinite(Number(data.amount))&&Number(data.amount)>0&&Number(data.amount)<=9999999999.99,'Enter a positive amount.');
    if(action==='credit-note')return unwrap(await db.rpc('issue_rental_credit_note',{p_actor:user.id,p_property:uuid(data.propertyId),p_charge:uuid(data.chargeId),p_amount:Number(data.amount),p_reason:text(data.reason,'Reason',2000)}));
    return unwrap(await db.rpc('rental_action',{p_actor:user.id,p_action:action,p_data:data}));
  }
  if(path === '/api/operations' && req.method === 'GET') {
    const owner=user.role==='owner',tenant=user.role==='tenant',maintenance=user.role==='maintenance';
    const properties=unwrap(await (owner?db.from('properties').select('*').eq('owner_id',user.id):db.from('properties').select('*').eq('id',user.property_id||'00000000-0000-0000-0000-000000000000'))) || [];
    const ids=properties.map(p=>p.id);
    const empty={properties,units:[],people:[],assignments:[],charges:[],payments:[],creditNotes:[],expenses:[],messages:[],repairs:[],photos:[],activity:[],self:publicUser(user)};
    if(!ids.length)return empty;
    async function list(table:string,select='*',filter?:[string,string]) {
      const out:Record<string,unknown>[]=[];
      for(let start=0;;start+=1000){let q=db.from(table).select(select).in('property_id',ids).order('id').range(start,start+999);if(filter)q=q.eq(filter[0],filter[1]);const rows=(unwrap(await q)||[]) as unknown as Record<string,unknown>[];out.push(...rows);if(rows.length<1000)break;}
      return out;
    }
    const [units,people,assignments,charges,payments,creditNotes,expenses,messages,repairs,activity,settlements,billingRuns,workflowEvents]=await Promise.all([
      list('workspace_records',maintenance?'id,title,property_id':'*',['category','units/inventory']),
        list('users',owner||user.role==='manager'?'id,full_name,role,property_id,email,phone':'id,full_name,role,property_id'),
      maintenance?[]:list('unit_assignments','*',tenant?['tenant_id',user.id]:undefined),
      maintenance?[]:list('rental_charges','*',tenant?['tenant_id',user.id]:undefined),
      maintenance?[]:list('rental_payments','*',tenant?['tenant_id',user.id]:undefined),
      maintenance?[]:list('rental_credit_notes','*',tenant?['tenant_id',user.id]:undefined),
      tenant||maintenance?[]:list('property_expenses'),
        list('property_conversations'),
      list('property_repairs','*',tenant?['tenant_id',user.id]:maintenance?['assigned_to',user.id]:undefined),
      tenant||maintenance?[]:list('property_activity'),
      maintenance?[]:list('deposit_settlements','*',tenant?['tenant_id',user.id]:undefined),
      owner?(unwrap(await db.from('billing_runs').select('*').in('property_id',ids).order('created_at',{ascending:false}).limit(30))||[]):[],
      owner?(unwrap(await db.from('workflow_events').select('*').in('property_id',ids).order('created_at',{ascending:false}).limit(100))||[]):[]
    ]);
      const visiblePhotos=(await list('repair_photos')).filter(photo=>photo.ready&&repairs.some(r=>r.id===photo.repair_id));
      const signed=visiblePhotos.length?unwrap(await db.storage.from('repair-photos').createSignedUrls(visiblePhotos.map(p=>String(p.object_path)),900)):[];
      return {...empty,units:tenant?units.filter(r=>assignments.some(a=>a.unit_id===r.id)):maintenance?units.filter(r=>repairs.some(a=>a.unit_id===r.id)):units,people:tenant?people.filter(p=>p.id===user.id||p.role!=='tenant'):maintenance?people.filter(p=>p.role!=='tenant'):people,
        assignments,charges,payments,creditNotes,expenses,settlements,billingRuns,workflowEvents,messages:(tenant?messages.filter(m=>m.channel!=='Staff'&&(m.channel!=='Private'||m.recipient_id===user.id)):maintenance?messages.filter(m=>m.channel==='Staff'):messages).map(m=>({...m,author_name:people.find(p=>p.id===m.author_id)?.full_name||'Property team'})),repairs,photos:visiblePhotos.map(p=>({...p,url:signed?.find(s=>s.path===p.object_path)?.signedUrl||''})),activity};
  }
  if (path.startsWith('/api/assignments')) {
    check(user.role === 'owner', 'Owner access required.', 403);
    if (path === '/api/assignments' && req.method === 'GET') {
      const result = [];
      for (let start = 0; ; start += 1000) {
        const rows = unwrap(await db.from('unit_assignments').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).order('id').range(start, start + 999)) || [];
        result.push(...rows);
        if (rows.length < 1000) break;
      }
      return result;
    }
    if (path === '/api/assignments/end' && req.method === 'POST') return unwrap(await db.rpc('finish_tenancy', { p_actor: user.id, p_assignment: uuid(body.id), p_notes:text(body.notes,'Move-out inspection notes',3000) }));
    if (path === '/api/assignments' && req.method === 'POST') {
      return unwrap(await db.rpc('assign_workspace_unit', { p_owner: user.id, p_unit: uuid(body.unitId), p_tenant: uuid(body.tenantId), ...tenancyTerms(body) }));
    }
  }
  if (path === '/api/workspace' || path === '/api/workspace/save') {
    check(user.role === 'owner', 'Owner access required.', 403);
    if (path === '/api/workspace' && req.method === 'GET') {
      const records = [];
      for (let start = 0; ; start += 1000) {
        const page = unwrap(await db.from('workspace_records').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).order('id').range(start, start + 999));
        records.push(...(page || []));
        if (!page || page.length < 1000) break;
      }
      return records;
    }
    if (path === '/api/workspace/save' && req.method === 'POST') {
      if (body.propertyId) await ownedProperty(user, body.propertyId);
      const category = text(body.category, 'Category', 80);
      check(/^[a-z]+\/[a-z-]+$/.test(category), 'Invalid category.');
      check(body.details && typeof body.details === 'object' && !Array.isArray(body.details), 'Invalid details.');
      check(Object.entries(body.details).every(([key, value]) => key.length <= 100 && typeof value === 'string' && value.length <= 3000), 'Details must be text values of at most 3000 characters.');
      const value = { property_id: body.propertyId || null, category, title: text(body.title, 'Title'), status: text(body.status, 'Status', 40), details: body.details, archived: body.archived === true, updated_at: new Date().toISOString() };
      if (body.id) {
        const saved = unwrap(await db.from('workspace_records').update(value).eq('id', uuid(body.id)).eq('owner_id', user.id).select('*').maybeSingle());
        check(saved, 'Record not found.', 404);
        return saved;
      }
      return unwrap(await db.from('workspace_records').insert({ ...value, owner_id: user.id }).select('*').single());
    }
  }
  if (path === '/api/auth/logout' && req.method === 'POST') {
    const token = req.headers.get('Authorization')!.slice(7);
    unwrap(await db.from('app_sessions').delete().eq('token_hash', await digest(token)));
    return { success: true };
  }
  if (path === '/api/properties/mine' && req.method === 'GET') {
    check(user.role === 'owner', 'Owner access required.', 403);
    return unwrap(await db.from('properties').select('id,name,address,owner_id').eq('owner_id', user.id).order('created_at'));
  }
  if (path === '/api/properties' && req.method === 'POST') {
    check(user.role === 'owner', 'Owner access required.', 403);
    return unwrap(await db.from('properties').insert({ owner_id: user.id, name: text(body.name, 'Property name'), address: body.address ? text(body.address, 'Address') : null }).select('id,name,address,owner_id').single());
  }
  if (path === '/api/users') {
    check(['owner','manager'].includes(user.role), 'Owner or reception access required.', 403);
    const propertyId = user.role === 'manager' ? user.property_id : req.method === 'GET' ? url.searchParams.get('propertyId') : body.propertyId;
    if (req.method === 'GET' && !propertyId) return [];
    await ownedProperty(user, propertyId);
    if (req.method === 'GET') return (unwrap(await db.from('users').select('id,full_name,email,role,property_id').eq('property_id', propertyId)) || []).map(publicUser);
    if (req.method === 'POST') {
      check(['tenant','manager','maintenance'].includes(String(body.role)), 'Choose a tenant, reception or maintenance role.');
      check(user.role === 'owner' || body.role === 'tenant', 'Reception can create tenant accounts only.', 403);
      const initialPassword=password(body.password);
      check(initialPassword.length>=8,'Use at least eight characters.');
      if (body.unitId) {
        check(user.role === 'owner' && body.role === 'tenant', 'Only an owner can create a tenant with a unit assignment.', 403);
        const terms = tenancyTerms(body);
        const created = unwrap(await db.rpc('create_tenant_with_unit', {
          p_owner: user.id, p_property: propertyId, p_name: text(body.fullName,'Full name'),
          p_email: email(body.email), p_password_hash: await bcrypt.hash(initialPassword, 10),
          p_unit: uuid(body.unitId), ...terms,
        }));
        return publicUser(created);
      }
      const created = unwrap(await db.from('users').insert({ full_name: text(body.fullName,'Full name'), email: email(body.email), password_hash: await bcrypt.hash(initialPassword, 10), role: body.role, property_id: propertyId, unit_label: body.role === 'tenant' && body.unitLabel ? text(body.unitLabel,'Unit label') : null }).select('*').single());
      return publicUser(created);
    }
  }
  throw new HttpError(404, 'Endpoint not found.');
}

Deno.serve(async req => {
  const origin = req.headers.get('Origin') || '';
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' });
  if (origins.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Headers', 'authorization,content-type,apikey,x-client-info');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (origin && !origins.has(origin)) return new Response(JSON.stringify({ error: 'Origin not allowed.' }), { status: 403, headers });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  try { return new Response(JSON.stringify(await handle(req)), { headers }); }
  catch (error) {
    const known = error instanceof HttpError;
    if (!known) console.error('Unexpected API error', error instanceof Error ? error.name : 'unknown');
    return new Response(JSON.stringify({ error: known ? error.message : 'Something went wrong. Please try again.' }), { status: known ? error.status : 500, headers });
  }
});
