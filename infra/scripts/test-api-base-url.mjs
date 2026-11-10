import assert from 'node:assert/strict';
import { resolveApiBaseUrl as resolveMain } from '../../frontend/src/api/baseUrl.js';
import { resolveApiBaseUrl as resolveTenant } from '../../tenant-portal/src/api/baseUrl.js';

function cases(resolve) {
  assert.equal(resolve(undefined), '');
  assert.equal(resolve(null), '');
  assert.equal(resolve(''), '');
  assert.equal(resolve('   '), '');
  assert.equal(resolve('/'), '');
  assert.equal(resolve('http://localhost:8080'), 'http://localhost:8080');
  assert.equal(resolve('http://localhost:8080/'), 'http://localhost:8080');
  assert.equal(
    resolve('https://nesthub-api-staging-xyz.asia-south1.run.app'),
    'https://nesthub-api-staging-xyz.asia-south1.run.app'
  );
  assert.equal(
    resolve('https://nesthub-api-staging-xyz.asia-south1.run.app/'),
    'https://nesthub-api-staging-xyz.asia-south1.run.app'
  );
  assert.equal(
    resolve('https://nesthub-api-staging-xyz.asia-south1.run.app/api'),
    'https://nesthub-api-staging-xyz.asia-south1.run.app'
  );
  assert.equal(
    resolve('https://nesthub-api-staging-xyz.asia-south1.run.app/api/'),
    'https://nesthub-api-staging-xyz.asia-south1.run.app'
  );

  // Call-site contract: paths always start with /api/...
  assert.equal(`${resolve('')}/api/health`, '/api/health');
  assert.equal(`${resolve('https://example.run.app')}/api/auth/login`, 'https://example.run.app/api/auth/login');
  assert.equal(`${resolve('https://example.run.app/api')}/api/auth/login`, 'https://example.run.app/api/auth/login');
}

cases(resolveMain);
cases(resolveTenant);
console.log('api baseUrl tests passed (main + tenant)');
