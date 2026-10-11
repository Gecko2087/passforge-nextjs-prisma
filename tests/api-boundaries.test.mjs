import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Evaluate only the cleaned handlers, with inert dependencies. No DB, secrets or network.
const compiled = new Map();
const retainedModules = [];
async function load(relative, { authenticated = true, ownsPassword = true, ownsCategory = true } = {}) {
  if (!compiled.has(relative)) {
    const source = await readFile(new URL('../' + relative, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\beval\s*\(|\batob\s*\(|AUTH_API_KEY|node-fetch|child_process/);
    compiled.set(relative, ts.transpileModule(source, { compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022,
    } }).outputText);
  }
  const code = compiled.get(relative);
  const writes = [];
  const reads = [];
  const session = authenticated ? { user: { id: 'owner' } } : null;
  const prisma = {
    password: {
      findFirst: async input => { reads.push(input); return ownsPassword ? { id: 'vault-entry', userId: 'owner' } : null; },
      update: async input => { writes.push(input); return input.data; },
    },
    category: {
      findFirst: async input => { reads.push(input); return ownsCategory ? { id: 'category', userId: 'owner' } : null; },
      findMany: async input => { reads.push(input); return []; },
      create: async input => { writes.push(input); return input.data; },
    },
  };
  const context = vm.createContext({ console: { error() {} } }, {
    codeGeneration: { strings: false, wasm: false },
  });
  const modules = {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@/lib/prisma': { default: prisma },
    '@/lib/cripto': { cryptr: { encrypt: value => 'encrypted:' + value, decrypt: value => value } },
    '@/lib/auth-server': { getServerSession: async () => session },
  };
  const candidate = new vm.SourceTextModule(code, { context,
    importModuleDynamically() { throw new Error('Dynamic imports forbidden'); },
  });
  await candidate.link(async name => {
    assert.ok(name in modules, 'Unexpected import: ' + name);
    const values = modules[name];
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await candidate.evaluate({ timeout: 1000 });
  retainedModules.push(candidate);
  return { handlers: candidate.namespace, writes, reads };
}
const params = { params: Promise.resolve({ id: 'vault-entry' }) };
const request = body => ({ json: async () => body });
const passwordRoute = 'app/api/passwords/[id]/route.ts';

test('anonymous users cannot read categories or update passwords', async () => {
  const categories = await load('app/api/categories/route.ts', { authenticated: false });
  assert.equal((await categories.handlers.GET()).status, 401);
  const route = await load(passwordRoute, { authenticated: false });
  assert.equal((await route.handlers.PUT(request({ title: 'Demo' }), params)).status, 401);
  assert.equal(route.writes.length, 0);
});
test('category queries and creates derive the owner from the session', async () => {
  const route = await load('app/api/categories/route.ts');
  await route.handlers.GET();
  assert.equal(route.reads[0].where.userId, 'owner');
  const result = await route.handlers.POST(request({ name: 'Demo', userId: 'victim' }));
  assert.equal(result.status, 201);
  assert.equal(route.writes[0].data.userId, 'owner');
});
test('password identity, owner, encrypted value and nested relations cannot be injected', async () => {
  for (const body of [
    { userId: 'victim' }, { id: 'victim' }, { encryptedPassword: 'raw' },
    { user: { update: { role: 'admin' } } }, { category: { connect: { id: 'foreign' } } },
    { title: { set: 'x' } }, { hasSymbols: { set: true } }, { length: '32' },
    { categoryId: { set: 'foreign' } }, [], null,
  ]) {
    const route = await load(passwordRoute);
    assert.equal((await route.handlers.PUT(request(body), params)).status, 400);
    assert.equal(route.writes.length, 0);
  }
});
test('an unowned entry is hidden and never modified', async () => {
  const route = await load(passwordRoute, { ownsPassword: false });
  assert.equal((await route.handlers.PUT(request({ title: 'Demo' }), params)).status, 404);
  assert.equal(route.writes.length, 0);
});
test('a foreign category is rejected before writing', async () => {
  const route = await load(passwordRoute, { ownsCategory: false });
  assert.equal((await route.handlers.PUT(request({ categoryId: 'foreign' }), params)).status, 404);
  assert.equal(route.reads[1].where.userId, 'owner');
  assert.equal(route.writes.length, 0);
});
test('legitimate updates use explicit fields, encrypt secrets and retain false flags', async () => {
  const route = await load(passwordRoute);
  const result = await route.handlers.PUT(request({ title: ' Demo ', password: 'test-only',
    categoryId: 'category', length: 20, hasSymbols: false }), params);
  assert.equal(result.status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(route.writes[0].where)), { id: 'vault-entry', userId: 'owner' });
  assert.deepEqual(JSON.parse(JSON.stringify(route.writes[0].data)), {
    title: ' Demo ', encryptedPassword: 'encrypted:test-only', categoryId: 'category', length: 20, hasSymbols: false,
  });
});
test('null removes a category; omitted fields stay omitted', async () => {
  const route = await load(passwordRoute);
  assert.equal((await route.handlers.PUT(request({ categoryId: null }), params)).status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(route.writes[0].data)), { categoryId: null });
  assert.equal(route.reads.length, 1);
});
test('existing creation contract remains valid for long titles and whitespace', async () => {
  const route = await load(passwordRoute);
  const title = '  ' + 'a'.repeat(121) + '  ';
  assert.equal((await route.handlers.PUT(request({ title, password: 'a'.repeat(1025), length: 1025 }), params)).status, 200);
  assert.equal(route.writes[0].data.title, title);
});
