import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const apiUrl = 'https://wmwzrhreqmjsmksptzaj.supabase.co/functions/v1/nesthub-api';
const tenantUrl = 'https://nesthub.sionaglobal.com/tenant/login';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function build(directory, env) {
  execFileSync(npm, ['run', 'build'], {
    cwd: resolve(root, directory),
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

build('frontend', { VITE_API_URL: apiUrl, VITE_TENANT_PORTAL_URL: tenantUrl });
build('tenant-portal', { VITE_API_URL: apiUrl, VITE_FIREBASE_MOUNTED: 'true' });

const tenantDestination = resolve(root, 'frontend/dist/tenant');
await rm(tenantDestination, { recursive: true, force: true });
await mkdir(tenantDestination, { recursive: true });
await cp(resolve(root, 'tenant-portal/dist'), tenantDestination, { recursive: true });

console.log('Firebase bundle ready: property portal at / and tenant portal at /tenant/.');
