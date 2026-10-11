import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import ts from 'typescript';
const source = await readFile(new URL('../lib/password.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022,
} }).outputText;
async function generator(crypto = webcrypto) {
  const context = vm.createContext({ crypto }, { codeGeneration: { strings: false, wasm: false } });
  const module = new vm.SourceTextModule(code, { context });
  await module.link(() => { throw new Error('Unexpected dependency'); });
  await module.evaluate();
  return module.namespace.generatePassword;
}
test('every selected character class is present at all supported lengths', async () => {
  const generate = await generator();
  for (const length of [4, 8, 16, 64, 128]) {
    for (let i = 0; i < 20; i++) {
      const password = generate({ length, hasUppercase: true, hasLowercase: true, hasNumbers: true, hasSymbols: true });
      assert.equal(password.length, length);
      for (const pattern of [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/]) assert.match(password, pattern);
    }
  }
});
test('only selected groups are used; invalid lengths are rejected', async () => {
  const generate = await generator();
  assert.match(generate({ hasLowercase: false, hasNumbers: true, length: 20 }), /^[0-9]{20}$/);
  for (const length of [0, 3, 129, Infinity, 8.5]) assert.throws(() => generate({ length }));
});
test('requires at least one selected character group', async () => {
  const generate = await generator();
  assert.throws(() => generate({ length: 20, hasLowercase: false, hasUppercase: false,
    hasNumbers: false, hasSymbols: false }), /Selecciona al menos un grupo/);
});
test('uses cryptographic entropy with rejection sampling instead of modulo bias', async () => {
  let calls = 0;
  const generate = await generator({ getRandomValues(bytes) { bytes[0] = calls++ === 0 ? 255 : 1; return bytes; } });
  assert.equal(generate({ length: 4 }), 'bbbb');
  assert.ok(calls >= 5);
  assert.doesNotMatch(source, /Math\.random/);
});
