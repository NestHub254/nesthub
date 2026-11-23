// These routes use the same opaque application sessions as the main API.
// No service credentials, recipient contacts, or Storage paths are returned to community members.
export async function communityRoutes(req:Request,url:URL,path:string,body:Record<string,unknown>,user:any,ctx:any):Promise<any>{
 const {db,check,unwrap,uuid,text,ownedProperty,rateLimit}=ctx;
 const tenant=user.role==='tenant',management=['owner','manager','maintenance'].includes(user.role);
 async function resident(){
  check(tenant&&user.property_id,'Tenant access required.',403);
  const active=unwrap(await db.from('unit_assignments').select('id').eq('tenant_id',user.id).eq('property_id',user.property_id).is('ended_at',null).limit(1));
  check(active.length,'The community is available during your active tenancy.',403);
 }
 async function config(){
  const c=unwrap(await db.rpc('nesthub_communication_configuration'));
  return {key:Deno.env.get('BREVO_API_KEY')||c.nesthub_brevo_api_key,sender:Deno.env.get('RESET_EMAIL_FROM')||c.nesthub_reset_email_from,atKey:Deno.env.get('AT_API_KEY')||c.nesthub_at_api_key,atUser:Deno.env.get('AT_USERNAME')||c.nesthub_at_username,atSender:Deno.env.get('AT_SENDER')||c.nesthub_at_sender,atMode:Deno.env.get('AT_MODE')||c.nesthub_at_mode||'disabled'};
 }
 const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
 const phone=(s:string)=>{let n=s.replace(/[\s()-]/g,'');if(/^0[17]\d{8}$/.test(n))n='+254'+n.slice(1);if(/^254[17]\d{8}$/.test(n))n='+'+n;return /^\+[1-9]\d{7,14}$/.test(n)?n:'';};
 if(path==='/api/community'&&req.method==='GET'){
  await resident();
  const active=unwrap(await db.from('unit_assignments').select('tenant_id').eq('property_id',user.property_id).is('ended_at',null));
  const ids=[...new Set(active.map((a:any)=>a.tenant_id))];
  const [members,profiles,posts]=await Promise.all([
   db.from('users').select('id,full_name').eq('property_id',user.property_id).eq('role','tenant').in('id',ids),
   db.from('tenant_profiles').select('*').in('user_id',ids),
   db.from('community_posts').select('id,author_id,body,created_at').eq('property_id',user.property_id).order('created_at',{ascending:false}).limit(100)
  ]);
  const ps=unwrap(profiles)||[],paths=ps.filter((p:any)=>p.avatar_path).map((p:any)=>p.avatar_path);
  const signed=paths.length?unwrap(await db.storage.from('community-avatars').createSignedUrls(paths,900)):[];
  return {members:unwrap(members).map((m:any)=>{const p=ps.find((p:any)=>p.user_id===m.id);return {...m,bio:p?.bio||'',avatar:signed.find((s:any)=>s.path===p?.avatar_path)?.signedUrl||''};}),posts:unwrap(posts).reverse()};
 }
 if(path==='/api/community/profile'&&req.method==='POST'){
  await resident();await rateLimit('profile:'+user.id,15);
  check(typeof body.bio==='string'&&body.bio.length<=300,'Bio must be at most 300 characters.');
  const old=unwrap(await db.from('tenant_profiles').select('*').eq('user_id',user.id).maybeSingle());
  let avatar=old?.avatar_path||null,newPath:string|null=null;
  if(body.image){
   const mime=String(body.mime);check(['image/jpeg','image/png','image/webp'].includes(mime),'Choose a JPEG, PNG or WebP photo.');
   check(typeof body.image==='string'&&/^[A-Za-z0-9+/]+={0,2}$/.test(body.image),'Invalid image.');
   let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(body.image as string),c=>c.charCodeAt(0));}catch{check(false,'Invalid image.');return;}
   check(bytes.length>12&&bytes.length<=1048576,'Profile photos must be under 1 MB.');
   const valid=mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:mime==='image/png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
   check(valid,'The file does not match its image type.');
   newPath=`${user.id}/${crypto.randomUUID()}.${mime==='image/png'?'png':mime==='image/jpeg'?'jpg':'webp'}`;
   const upload=await db.storage.from('community-avatars').upload(newPath,bytes,{contentType:mime,upsert:false});check(!upload.error,'Photo upload failed.',500);avatar=newPath;
  }else if(body.removePhoto===true)avatar=null;
  const save=await db.from('tenant_profiles').upsert({user_id:user.id,bio:String(body.bio).trim(),avatar_path:avatar,updated_at:new Date().toISOString()});
  if(save.error&&newPath)await db.storage.from('community-avatars').remove([newPath]);unwrap(save);
  if(old?.avatar_path&&old.avatar_path!==avatar)await db.storage.from('community-avatars').remove([old.avatar_path]);
  return {message:'Community profile saved.'};
 }
 if(path==='/api/community/post'&&req.method==='POST'){
  await resident();await rateLimit('community:'+user.id,30);
  return unwrap(await db.from('community_posts').insert({author_id:user.id,property_id:user.property_id,body:text(body.body,'Message',2000)}).select('id').single());
 }
 if(path==='/api/community/remove'&&req.method==='POST'){
  await resident();unwrap(await db.from('community_posts').delete().eq('id',uuid(body.id)).eq('author_id',user.id).eq('property_id',user.property_id));return {message:'Your post was removed.'};
 }
 if(!path.startsWith('/api/communications'))return undefined;
 check(management,'Property team access required.',403);
 const property=unwrap(await db.from('properties').select('*').eq('id',uuid(req.method==='GET'?url.searchParams.get('propertyId'):body.propertyId)).maybeSingle());
 check(property&&(user.role==='owner'?property.owner_id===user.id:property.id===user.property_id),'You do not have access to this property.',403);
 if(path==='/api/communications/test'&&req.method==='POST'){
  await rateLimit('communication-test:'+user.id,3);
  const c=await config();check(c.key&&c.sender,'Email is not configured.',503);
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':c.key,'Content-Type':'application/json'},body:JSON.stringify({sender:{name:'NestHub',email:c.sender},to:[{email:user.email}],subject:'NestHub communication setup test - no action needed',htmlContent:`<div style="font-family:Arial,sans-serif;padding:28px"><img src="https://nesthub.sionaglobal.com/brand/owner-192.png" width="48" height="48" alt="NestHub"><h2>Email communications are connected</h2><p>This is the single test email you requested for ${esc(property.name)}. Property notices can now be sent through the NestHub Communications screen.</p><p>No payment was made, no tenant balance changed, and no action is needed.</p></div>`}),signal:AbortSignal.timeout(15000)});
  const result=await response.json().catch(()=>({}));check(response.ok&&result.messageId,'Email provider did not accept the test. Check provider logs.',502);
  return {status:'Accepted',message:'Test email accepted by the provider for your own registered address.',providerId:result.messageId};
 }
 if(path==='/api/communications'&&req.method==='GET'){
  const c=await config();const campaigns=unwrap(await db.from('communication_campaigns').select('*').eq('property_id',property.id).order('created_at',{ascending:false}).limit(50));
  const deliveries=[];
  for(let start=0;campaigns.length;start+=1000){const rows=unwrap(await db.from('communication_deliveries').select('id,campaign_id,tenant_id,channel,destination,status,detail,updated_at').in('campaign_id',campaigns.map((c:any)=>c.id)).order('id').range(start,start+999));deliveries.push(...rows);if(rows.length<1000)break;}
  const recipients=[];
  for(let start=0;;start+=1000){const rows=unwrap(await db.from('users').select('id,full_name,email,phone').eq('property_id',property.id).eq('role','tenant').order('id').range(start,start+999));recipients.push(...rows);if(rows.length<1000)break;}
  return {campaigns,deliveries,recipients,configuration:{email:!!(c.key&&c.sender),sms:c.atKey&&c.atUser&&['live','sandbox'].includes(c.atMode)?c.atMode:'unavailable'}};
 }
 if(path==='/api/communications/prepare'&&req.method==='POST'){
  await rateLimit('communications:'+user.id,20);
  const subject=text(body.subject,'Subject',160),message=text(body.message,'Message',3000);
  check(!/[\r\n]/.test(subject),'Subject must be one line.');
  check(['Email','SMS','Both'].includes(String(body.channel)),'Choose email, SMS or both.');
  check(body.recipientIds===null||Array.isArray(body.recipientIds)&&body.recipientIds.length>0&&body.recipientIds.length<=1000,'Choose recipients.');
  const ids=body.recipientIds===null?null:[...new Set((body.recipientIds as unknown[]).map(uuid))];
  const id=unwrap(await db.rpc('prepare_communication',{p_actor:user.id,p_property:property.id,p_request:uuid(body.requestId),p_subject:subject,p_body:message,p_channel:body.channel,p_tenants:ids}));
  return {id};
 }
 if(path==='/api/communications/send'&&req.method==='POST'){
  const campaign=unwrap(await db.from('communication_campaigns').select('*').eq('id',uuid(body.id)).eq('property_id',property.id).maybeSingle());check(campaign,'Message not found.',404);
  const c=await config(),owner=unwrap(await db.from('users').select('email').eq('id',property.owner_id).single());
  // A crashed request may have reached the provider. Never resend that row automatically.
  unwrap(await db.from('communication_deliveries').update({status:'Unknown',detail:'Delivery outcome unknown. Check provider logs before sending again.'}).eq('campaign_id',campaign.id).eq('status','Sending').lt('updated_at',new Date(Date.now()-120000).toISOString()));
  const rows=unwrap(await db.from('communication_deliveries').select('*').eq('campaign_id',campaign.id).eq('status','Queued').order('id').limit(5));
  await Promise.all(rows.map(async(row:any)=>{
   const claim=unwrap(await db.from('communication_deliveries').update({status:'Sending',updated_at:new Date().toISOString()}).eq('id',row.id).eq('status','Queued').select('id'));if(!claim.length)return;
   let status='Failed',detail='Provider rejected this message.',providerId=null;
   const current=unwrap(await db.from('users').select('email,phone,property_id,role').eq('id',row.tenant_id).maybeSingle());
   const destination=row.channel==='Email'?current?.email:current?.phone||'';
   if(!current||current.role!=='tenant'||current.property_id!==property.id||destination!==row.destination){status='Skipped';detail='Recipient account or contact changed. Compose a new message.';}
   else if(!row.destination||(row.channel==='SMS'&&!phone(row.destination))){status='Skipped';detail='A valid registered contact is missing.';}
   else if(row.channel==='Email'&&!(c.key&&c.sender)||row.channel==='SMS'&&!(c.atKey&&c.atUser&&['live','sandbox'].includes(c.atMode))){status='Unavailable';detail=row.channel==='Email'?'Email provider is not configured.':'SMS is not connected. No message sent to a phone.';}
   else try{
    if(row.channel==='Email'){
     const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':c.key,'Content-Type':'application/json'},body:JSON.stringify({sender:{name:'NestHub · '+property.name,email:c.sender},to:[{email:row.destination}],replyTo:{email:owner.email,name:property.name},subject:campaign.subject,textContent:`${property.name}\n\n${campaign.body}\n\nReply to this email to contact your property owner.`,htmlContent:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:28px;color:#25344c"><img src="https://nesthub.sionaglobal.com/brand/owner-192.png" width="48" height="48" alt="NestHub"><h2>${esc(property.name)}</h2><h3>${esc(campaign.subject)}</h3><div style="white-space:pre-wrap;line-height:1.7">${esc(campaign.body)}</div><hr><p>Reply to this email to contact your property owner.</p></div>`}),signal:AbortSignal.timeout(15000)});
     const data=await response.json().catch(()=>({}));if(response.ok&&data.messageId){status='Accepted';detail='Accepted by email provider; inbox delivery is not yet confirmed.';providerId=data.messageId;}else detail=`Email provider rejected this message (${response.status}). Check sender, credits or provider logs.`;
    }else{
     const sandbox=c.atMode==='sandbox',payload=new URLSearchParams({username:sandbox?'sandbox':c.atUser,to:phone(row.destination),message:`${property.name}: ${campaign.body}`,bulkSMSMode:'1',...(c.atSender?{from:c.atSender}:{})});
     const response=await fetch(sandbox?'https://api.sandbox.africastalking.com/version1/messaging':'https://api.africastalking.com/version1/messaging',{method:'POST',headers:{apikey:c.atKey,Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:payload,signal:AbortSignal.timeout(15000)});
     const data=await response.json().catch(()=>({})),result=data.SMSMessageData?.Recipients?.[0];
     if(response.ok&&Number(result?.statusCode)===101){status=sandbox?'Sandbox':'Accepted';detail=sandbox?'Sent to the SMS simulator only; not to a real phone.':'Accepted by SMS provider; handset delivery is not yet confirmed.';providerId=result.messageId;}else detail='SMS provider rejected this message. Check sender, destination, credits or provider logs.';
    }
   }catch{status='Unknown';detail='Provider response was interrupted. Check provider logs before sending again.';}
   unwrap(await db.from('communication_deliveries').update({status,detail,provider_id:providerId,updated_at:new Date().toISOString()}).eq('id',row.id));
  }));
  const pending=unwrap(await db.from('communication_deliveries').select('id').eq('campaign_id',campaign.id).eq('status','Queued').limit(1));return {remaining:pending.length>0};
 }
 check(false,'Endpoint not found.',404);
}
