import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

// Own temporary SQLite database; never reads the existing vault or deployment credentials.
const directory = await mkdtemp(path.join(tmpdir(), 'passforge-test-'));
const database = path.join(directory, 'demo.db');
new DatabaseSync(database).close();
const original = await readFile('prisma/schema.prisma', 'utf8');
const schemaPath = path.join(directory, 'schema.prisma');
await writeFile(schemaPath, original.replace('provider = "postgresql"', 'provider = "sqlite"')
  .replace('provider      = "prisma-client-js"',
    'provider      = "prisma-client-js"\n  output = "' + path.resolve('node_modules/.prisma/client').replaceAll('\\', '/') + '"'));
const env = { ...process.env, NODE_ENV: 'production', DATABASE_URL: 'file:' + database.replaceAll('\\', '/'),
  BETTER_AUTH_SECRET: randomBytes(32).toString('hex'), ENCRYPTION_KEY: randomBytes(32).toString('hex'),
  BETTER_AUTH_URL: 'http://localhost:3010', NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3010',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3010', PASSFORGE_DEMO: 'true', NEXT_TELEMETRY_DISABLED: '1',
  NODE_OPTIONS: '--max-old-space-size=640 --max-semi-space-size=1' };
let server;
function run(args, overrides = {}) {
  const result = spawnSync(process.execPath, args, { env: { ...env, ...overrides }, stdio: 'inherit' });
  if (result.status !== 0) throw new Error('Failed: ' + args.join(' '));
}
async function request(url, { cookie = '', body, method = 'GET', origin = 'http://localhost:3010' } = {}) {
  const response = await fetch('http://localhost:3010' + url, { method,
    headers: { Cookie: cookie, Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}) });
  let data; try { data = await response.json(); } catch { data = null; }
  return { response, data };
}
try {
  run(['node_modules/prisma/build/index.js', 'generate', '--schema', schemaPath]);
  run(['node_modules/prisma/build/index.js', 'db', 'push', '--schema', schemaPath, '--skip-generate']);
  run(['node_modules/next/dist/bin/next', 'build', '--webpack']);
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3010'], { env, stdio: 'inherit' });
  for (let tries = 0; tries < 60; tries++) {
    try { await request('/login'); break; } catch {
      if (tries === 59) throw new Error('Test server did not start');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  assert.equal((await request('/api/passwords')).response.status, 401);
  assert.equal((await request('/api/auth/sign-in/anonymous', { method: 'POST', body: {}, origin: 'https://foreign.invalid' })).response.status, 403);
  const a = await request('/api/auth/sign-in/anonymous', { method: 'POST', body: {} });
  const b = await request('/api/auth/sign-in/anonymous', { method: 'POST', body: {} });
  assert.equal(a.response.status, 200); assert.equal(b.response.status, 200);
  assert.notEqual(a.data.user.id, b.data.user.id);
  const cookie = result => result.response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const ca = cookie(a), cb = cookie(b);
  assert.match(a.response.headers.get('set-cookie'), /httponly/i);
  const category = await request('/api/categories', { method: 'POST', cookie: ca, body: { name: 'Categoría propia' } });
  assert.equal(category.response.status, 201);
  const created = await request('/api/passwords', { method: 'POST', cookie: ca,
    body: { title: 'Clave ficticia', password: 'Ficticia-123!', categoryId: category.data.id } });
  assert.equal(created.response.status, 201);
  const listed = await request('/api/passwords', { cookie: ca });
  assert.equal(listed.data[0].decryptedPassword, undefined);
  assert.equal(listed.data[0].encryptedPassword, undefined);
  const copied = await request('/api/passwords/' + created.data.id, { cookie: ca });
  assert.equal(copied.data.decryptedPassword, 'Ficticia-123!');
  assert.equal(copied.data.encryptedPassword, undefined);
  assert.deepEqual((await request('/api/passwords', { cookie: cb })).data, []);
  for (const method of ['GET', 'PUT', 'DELETE']) {
    const result = await request('/api/passwords/' + created.data.id, { method, cookie: cb,
      ...(method === 'PUT' ? { body: { title: 'Ajena' } } : {}) });
    assert.equal(result.response.status, 404);
  }
  const update = await request('/api/passwords/' + created.data.id, { method: 'PUT', cookie: ca, body: { title: 'Editada' } });
  assert.equal(update.response.status, 200);
  const crossOrigin = await request('/api/passwords/' + created.data.id, { method: 'PUT', cookie: ca,
    origin: 'https://foreign.invalid', body: { title: 'Cambio desde otro sitio' } });
  assert.equal(crossOrigin.response.status, 401);
  assert.equal((await request('/api/passwords', { cookie: ca })).data[0].title, 'Editada');
  const sqlite = new DatabaseSync(database);
  const stored = sqlite.prepare('SELECT encryptedPassword FROM password WHERE id = ?').get(created.data.id);
  assert.notEqual(stored.encryptedPassword, 'Ficticia-123!');
  sqlite.prepare('UPDATE DemoUsage SET requests = 200 WHERE userId = ?').run(a.data.user.id);
  assert.equal((await request('/api/passwords', { cookie: ca })).response.status, 401);
  sqlite.prepare('UPDATE DemoUsage SET expiresAt = 0 WHERE userId = ?').run(b.data.user.id);
  assert.equal((await request('/api/passwords', { cookie: cb })).response.status, 401);
  sqlite.close();
  console.log('PASS: real HTTP authentication, separate visitors, persisted encrypted data, foreign CRUD denial, owner update, quotas and expiry.');
} finally {
  if (server) { server.kill(); await new Promise(resolve => server.once('exit', resolve)); }
  run(['node_modules/prisma/build/index.js', 'generate', '--schema', 'prisma/schema.prisma'],
    { DATABASE_URL: 'postgresql://build:build@127.0.0.1:5432/build' });
  if (!path.resolve(directory).startsWith(path.resolve(tmpdir()) + path.sep) || !path.basename(directory).startsWith('passforge-test-')) {
    throw new Error('Unexpected temporary directory; cleanup refused');
  }
  await rm(directory, { recursive: true, force: true });
}
