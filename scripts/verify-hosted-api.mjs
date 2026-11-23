import assert from 'node:assert/strict';

const base = process.env.NESTHUB_TEST_API;
const ownerPassword = process.env.NESTHUB_TEST_PASSWORD;
if (!base || !ownerPassword) throw new Error('Set NESTHUB_TEST_API and NESTHUB_TEST_PASSWORD.');
async function call(path, { method = 'GET', body, token, origin } = {}) {
  const response = await fetch(`${base}${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(origin ? { Origin: origin } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json(), headers: response.headers };
}
const owner = await call('/api/auth/login', { method:'POST', body:{email:'markkyalo226@gmail.com',password:ownerPassword,portal:'staff'},origin:'https://nesthub-six.vercel.app' });
assert.equal(owner.status,200);
assert.equal(owner.body.role,'owner');
assert.equal(owner.headers.get('Access-Control-Allow-Origin'),'https://nesthub-six.vercel.app');
const token = owner.body.token;
const properties = await call('/api/properties/mine',{token});
assert.equal(properties.body.length,1);
assert.equal(properties.body[0].name,'Wamaitha Apartments');
assert.equal((await call('/api/properties/mine')).status,401);
assert.equal((await call('/api/properties/mine',{token:'invalid'})).status,401);
assert.equal((await call('/api/auth/login',{method:'POST',body:{email:'markkyalo226@gmail.com',password:'invalid-password'}})).status,401);
assert.equal((await call('/api/auth/login',{method:'POST',body:{email:'markkyalo226@gmail.com',password:ownerPassword,portal:'tenant'}})).status,403);
assert.equal((await call('/api/users?propertyId=00000000-0000-0000-0000-000000000000',{token})).status,403);
assert.equal((await call('/api/auth/register',{method:'POST',body:{fullName:'Mismatch',email:'nesthub-check-mismatch@example.invalid',password:'Test-only-pass-78',confirmPassword:'different'}})).status,400);
const testPassword = 'Temporary-test-' + crypto.randomUUID();
const tenant = await call('/api/users',{method:'POST',token,body:{fullName:'Temporary Verification Tenant',email:'nesthub-check-tenant@example.invalid',password:testPassword,role:'tenant',propertyId:properties.body[0].id,unitLabel:'TEST'}});
assert.equal(tenant.status,200,JSON.stringify(tenant.body));
assert.equal(tenant.body.role,'tenant');
const login = await call('/api/auth/login',{method:'POST',body:{email:'nesthub-check-tenant@example.invalid',password:testPassword,portal:'tenant'}});
assert.equal(login.status,200);
assert.equal((await call('/api/properties/mine',{token:login.body.token})).status,403);
assert.equal((await call('/api/users',{method:'POST',token:login.body.token,body:{}})).status,403);
assert.equal((await call('/api/users',{method:'POST',token,body:{role:'owner',propertyId:properties.body[0].id}})).status,400);
assert.equal((await call('/api/auth/logout',{method:'POST',token:login.body.token,body:{}})).status,200);
assert.equal((await call('/api/properties/mine',{token:login.body.token})).status,401);
assert.equal((await call('/api/auth/logout',{method:'POST',token,body:{}})).status,200);
assert.equal((await call('/api/properties/mine',{token})).status,401);
console.log('PASS: owner login/property, CORS, password confirmation, tenant creation/login, property isolation, role restrictions, logout revocation.');
console.log('Remove temporary account nesthub-check-tenant@example.invalid after verification.');
